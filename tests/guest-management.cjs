/* Integration tests use an isolated group fixture and remove only those records. */
const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { GuestManagementService } = require('../apps/api/dist/guest-management.service');
const { RoomAccessService } = require('../apps/api/dist/room-access.service');
const { SecurityService } = require('../apps/api/dist/security.service');
const crypto = require('../apps/api/dist/guest-security');
const { GUEST_PERMISSIONS } = require('../apps/api/dist/guest.constants');

const db = new PrismaClient();
process.env.GUEST_ENCRYPTION_KEY ||= randomBytes(32).toString('hex');
const access = new RoomAccessService(db, new SecurityService(db));
const service = new GuestManagementService(db, access);
const prefix = 'GUEST_TEST_' + randomUUID();
let group, otherGroup, user;
let assertions = 0;
function check(value, description) { assert.ok(value, description); assertions++; }
async function rejects(fn, status) {
  await assert.rejects(fn, e => e.getStatus?.() === status); assertions++;
}
function actor(property, codes) {
  return { id: user.id, department: 'Front Desk', roleAssignments: [{ isActive: true, propertyId: property.id, companyId: property.companyId,
    role: { scope: 'PROPERTY', status: 'ACTIVE', permissions: codes.map(code => ({ permission: { code: 'GUEST.' + code, isActive: true } })) } }] };
}
const all = Object.entries(GUEST_PERMISSIONS).flatMap(([r, actions]) => actions.map(a => r + '.' + a));
async function cleanup(groupId) {
  if (!groupId) return;
  const ids = (await db.guest.findMany({ where: { tenantId: groupId }, select: { id: true } })).map(r => r.id);
  for (const model of ['guestAudit', 'guestContact', 'guestAddress', 'guestIdentity', 'guestPreference', 'guestNote', 'guestVip']) await db[model].deleteMany({ where: { guestId: { in: ids } } });
  await db.guest.deleteMany({ where: { tenantId: groupId } });
  await db.guestSequence.deleteMany({ where: { tenantId: groupId } });
  await db.guestConfiguration.deleteMany({ where: { tenantId: groupId } });
  const companies = await db.company.findMany({ where: { groupId }, select: { id: true } });
  const properties = await db.property.findMany({ where: { companyId: { in: companies.map(c => c.id) } }, select: { id: true } });
  await db.branch.deleteMany({ where: { propertyId: { in: properties.map(p => p.id) } } });
  await db.property.deleteMany({ where: { id: { in: properties.map(p => p.id) } } });
  await db.company.deleteMany({ where: { groupId } });
  await db.businessGroup.delete({ where: { id: groupId } });
}
(async () => {
  try {
    group = await db.businessGroup.create({ data: { code: prefix, name: 'Guest tests' } });
    otherGroup = await db.businessGroup.create({ data: { code: prefix + '_OTHER', name: 'Other guest test group' } });
    const company = await db.company.create({ data: { code: prefix, legalName: 'Test company', groupId: group.id } });
    const otherCompany = await db.company.create({ data: { code: prefix, legalName: 'Other company', groupId: otherGroup.id } });
    const p = await db.property.create({ data: { code: 'A', name: 'Property A', companyId: company.id } });
    const p2 = await db.property.create({ data: { code: 'B', name: 'Property B', companyId: company.id } });
    const outside = await db.property.create({ data: { code: 'X', name: 'Outside tenant', companyId: otherCompany.id } });
    const branch = await db.branch.create({ data: { code: 'B', name: 'Test branch', propertyId: p.id } });
    const branch2 = await db.branch.create({ data: { code: 'C', name: 'Other branch', propertyId: p.id } });
    user = await db.user.create({ data: { username: prefix.toLowerCase(), name: 'Guest test actor', status: 'ACTIVE' } });
    const admin = actor(p, all), second = actor(p2, all), outsider = actor(outside, all);
    const reader = actor(p, ['PROFILE.VIEW', 'CONTACT.VIEW', 'IDENTITY.VIEW', 'NOTE.VIEW', 'PREFERENCE.VIEW']);
    const q = { propertyId: p.id }, q2 = { propertyId: p2.id };
    await rejects(() => service.authenticate(), 401);
    await rejects(() => service.create(reader, q, { fullName: 'Unauthorized' }), 403);
    await rejects(() => service.create(admin, q, { fullName: ' ' }), 400);
    await rejects(() => service.create(admin, q, { fullName: 'Future', dateOfBirth: '2999-01-01' }), 400);
    await rejects(() => service.create(admin, q, { fullName: 'Invalid date', dateOfBirth: '2026-02-30' }), 400);
    await rejects(() => service.create(admin, q, { fullName: 'Invalid email', email: 'invalid' }), 400);
    let guest = await service.create(admin, q, { fullName: '  Test Aung Min  ', phone: '+95 (9) 123-45678', email: 'Guest@Example.com', nationality: 'Myanmar' });
    check(/^GST-\d{4}-\d{6}$/.test(guest.guestNumber), 'Guest numbering');
    check(guest.contacts.every(c => c.value.includes('*')), 'Masked by default even for administrators');
    check((await service.detail(second, q2, guest.id)).id === guest.id, 'Shared guest across properties');
    await rejects(() => service.detail(outsider, { propertyId: outside.id }, guest.id), 404);
    await rejects(() => service.detail(admin, { propertyId: outside.id }, guest.id), 403);
    const reveal = await service.detail(admin, { ...q, reveal: 'true' }, guest.id);
    check(reveal.contacts.some(c => c.value === '+95912345678'), 'Normalized phone');
    check(reveal.contacts.some(c => c.value === 'guest@example.com'), 'Normalized email');
    await rejects(() => service.detail(reader, { ...q, reveal: 'true' }, guest.id), 403);
    await rejects(() => service.create(admin, q, { fullName: 'Test Aung Min' }), 409);
    await rejects(() => service.create(admin, q, { fullName: 'Different name', email: 'guest@example.com' }), 409);
    const duplicate = await service.create(admin, q, { fullName: 'Test Aung Min', duplicateReason: 'Different person confirmed' });
    check(duplicate.id !== guest.id, 'Explicit duplicate override');
    check((await service.list(admin, { ...q, q: 'AUNG MIN' })).total === 2, 'Normalized name search');
    guest = await service.child(admin, q, guest.id, 'identities', { version: guest.version, type: 'Passport', number: 'AB123456', issueDate: '2020-01-01', expiryDate: '2025-01-01', isPrimary: true });
    check(guest.identities[0].expired, 'Expiry warning');
    const identity = await db.guestIdentity.findFirstOrThrow({ where: { guestId: guest.id } });
    check(!identity.numberEncrypted.includes('AB123456'), 'Encrypted at rest');
    check(crypto.decryptIdentity(identity.numberEncrypted) === 'AB123456', 'Identity decrypts');
    check(!JSON.stringify(guest).includes(identity.numberHash), 'Hash never returned');
    check((await service.detail(admin, { ...q, reveal: 'true' }, guest.id)).identities[0].number === 'AB123456', 'Permissioned reveal');
    check((await service.list(admin, { ...q, identity: 'ab 123456' })).total === 1, 'Hashed identity search');
    await rejects(() => service.child(admin, q, duplicate.id, 'identities', { version: duplicate.version, type: 'Passport', number: 'AB123456' }), 409);
    await rejects(() => service.child(admin, q, guest.id, 'identities', { version: guest.version, type: 'Passport', number: 'OTHER', issueDate: '2026-01-02', expiryDate: '2026-01-01' }), 400);
    await rejects(() => service.child(admin, q, guest.id, 'vip', { version: guest.version, level: 'VIP 1', effectiveFrom: '2026-01-02', effectiveTo: '2026-01-01' }), 400);
    guest = await service.child(admin, q, guest.id, 'notes', { version: guest.version, text: 'Property A private note', type: 'General', visibility: 'PROPERTY' });
    check((await service.detail(second, q2, guest.id)).notes.length === 0, 'Property note isolation');
    guest = await service.child(admin, q, guest.id, 'notes', { version: guest.version, text: 'Management only', visibility: 'MANAGEMENT' });
    check((await service.detail(reader, q, guest.id)).notes.length === 1, 'Management visibility');
    guest = await service.child(admin, { ...q, branchId: branch.id }, guest.id, 'notes', { version: guest.version, text: 'Branch only' });
    check(!(await service.detail(admin, { ...q, branchId: branch2.id }, guest.id)).notes.some(n => n.text === 'Branch only'), 'Branch isolation');
    await rejects(() => service.child(admin, q2, guest.id, 'notes', { version: guest.version, text: 'Scope attack' }, guest.notes[0].id), 403);
    guest = await service.detail(admin, q, guest.id);
    guest = await service.child(admin, q, guest.id, 'preferences', { version: guest.version, type: 'Floor', value: 'High floor', scope: 'PROPERTY' });
    check((await service.detail(second, q2, guest.id)).preferences.length === 0, 'Preference scope');
    guest = await service.child(admin, q, guest.id, 'addresses', { version: guest.version, type: 'Home', line1: 'Private address', city: 'Yangon', isPrimary: true });
    check(guest.addresses[0].line1 !== 'Private address', 'Address masking');
    guest = await service.child(admin, q, guest.id, 'vip', { version: guest.version, level: 'VIP 1' });
    check((await service.list(admin, { ...q, vip: 'true' })).total === 1, 'VIP filtering');
    await rejects(() => service.child(reader, q, guest.id, 'vip', { version: guest.version, level: 'VVIP' }), 403);
    const originalVersion = guest.version;
    const updates = await Promise.allSettled([
      service.update(admin, q, guest.id, { version: originalVersion, company: 'A' }),
      service.update(admin, q, guest.id, { version: originalVersion, company: 'B' }),
    ]);
    check(updates.filter(x => x.status === 'fulfilled').length === 1, 'Concurrent edits: exactly one succeeds');
    check(updates.some(x => x.status === 'rejected' && x.reason.getStatus() === 409), 'Stale edit gets conflict');
    guest = await service.detail(admin, q, guest.id);
    const audit = await service.auditHistory(admin, q, guest.id);
    check(audit.length > 5 && audit.some(a => a.action === 'SENSITIVE_DATA_VIEWED'), 'Audit events');
    check(!JSON.stringify(audit).includes('AB123456') && !JSON.stringify(audit).includes('Private address'), 'No raw sensitive audit data');
    await rejects(() => service.export(reader, q), 403);
    const csv = await service.export(admin, q);
    check(csv.csv.includes(guest.guestNumber) && !csv.csv.includes('AB123456') && !csv.csv.includes('guest@example.com'), 'Minimal export');
    check((await service.reports(admin, q)).total === 2, 'Report count');
    check((await service.list(outsider, { propertyId: outside.id })).total === 0, 'Tenant-isolated list');
    const archived = await service.archive(admin, q, guest.id, { version: guest.version });
    check(archived.status === 'ARCHIVED' && archived.identities.length === 1, 'Archive preserves records');
    await rejects(() => service.update(admin, q, guest.id, { version: archived.version, fullName: 'Cannot edit' }), 409);
    console.log('Guest integration checks passed: ' + assertions);
  } finally {
    await cleanup(group?.id); await cleanup(otherGroup?.id);
    if (user) await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
