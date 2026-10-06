import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RoomAccessService } from './room-access.service';
import { GUEST_DEFAULTS, GUEST_PERMISSIONS } from './guest.constants';
import { contactValue, dateValue, decryptIdentity, encryptIdentity, identityHash, mask, normalizeIdentity, normalizeName, textValue } from './guest-security';

const include = { contacts: true, addresses: true, identities: true, preferences: true, notes: true, vip: true };
const resources: Record<string, { model: string; permission: string; view: string }> = {
  contacts: { model: 'guestContact', permission: 'CONTACT.UPDATE', view: 'CONTACT.VIEW' },
  addresses: { model: 'guestAddress', permission: 'CONTACT.UPDATE', view: 'CONTACT.VIEW' },
  identities: { model: 'guestIdentity', permission: 'IDENTITY.UPDATE', view: 'IDENTITY.VIEW' },
  preferences: { model: 'guestPreference', permission: 'PREFERENCE.UPDATE', view: 'PREFERENCE.VIEW' },
  notes: { model: 'guestNote', permission: 'NOTE.UPDATE', view: 'NOTE.VIEW' },
  vip: { model: 'guestVip', permission: 'VIP.MANAGE', view: 'VIP.VIEW' },
};

@Injectable()
export class GuestManagementService {
  constructor(private readonly db: PrismaService, private readonly access: RoomAccessService) {}
  authenticate(header?: string) { return this.access.authenticate(header); }
  private can(user: any, c: any, permission: string) { return this.access.can(user, 'GUEST.' + permission, c.property, c.branchId); }
  private require(user: any, c: any, permission: string) {
    if (!this.can(user, c, permission)) throw new ForbiddenException('Guest permission or organization scope does not allow this action');
  }
  private async context(user: any, q: any, permission = 'PROFILE.VIEW') {
    const property = await this.access.context(user, q.propertyId, q.branchId || undefined);
    const company = await this.db.company.findUniqueOrThrow({ where: { id: property.companyId } });
    const c = { property, tenantId: company.groupId, branchId: q.branchId || null };
    this.require(user, c, permission); return c;
  }
  async properties(user: any) {
    const properties = await this.db.property.findMany({ include: { branches: true }, orderBy: { name: 'asc' } });
    return properties.filter(p => this.access.can(user, 'GUEST.PROFILE.VIEW', p) || p.branches.some(b => this.access.can(user, 'GUEST.PROFILE.VIEW', p, b.id)))
      .map(p => ({ id: p.id, name: p.name, branchOnly: !this.access.can(user, 'GUEST.PROFILE.VIEW', p),
        branches: p.branches.filter(b => this.access.can(user, 'GUEST.PROFILE.VIEW', p, b.id)).map(b => ({ id: b.id, name: b.name })) }));
  }
  async options(user: any, q: any) {
    const c = await this.context(user, q);
    const custom = await this.db.guestConfiguration.findMany({ where: { tenantId: c.tenantId, isActive: true } });
    const catalogs = Object.fromEntries(Object.entries(GUEST_DEFAULTS).map(([category, values]) => [category, [...new Set([...values, ...custom.filter(x => x.category === category).map(x => x.name)])]]));
    return { ...catalogs, permissions: Object.entries(GUEST_PERMISSIONS).flatMap(([resource, actions]) => actions.map(action => resource + '.' + action)).filter(p => this.can(user, c, p)) };
  }
  async configure(user: any, q: any, b: any) {
    const c = await this.context(user, q, 'CONFIG.MANAGE');
    if (!Object.keys(GUEST_DEFAULTS).includes(b.category)) throw new BadRequestException('Invalid configuration category');
    const name = textValue(b.name, 'Name', true)!;
    const row = await this.db.guestConfiguration.upsert({ where: { tenantId_category_name: { tenantId: c.tenantId, category: b.category, name } },
      create: { tenantId: c.tenantId, category: b.category, name }, update: { isActive: true } });
    return row;
  }
  private async choice(tx: any, c: any, category: keyof typeof GUEST_DEFAULTS, value: any) {
    const name = textValue(value, category, true)!;
    if (!(GUEST_DEFAULTS[category] as readonly string[]).includes(name) && !await tx.guestConfiguration.findFirst({ where: { tenantId: c.tenantId, category, name, isActive: true } })) throw new BadRequestException('Select a configured ' + category);
    return name;
  }
  private async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try { return await this.db.$transaction(fn, { isolationLevel: 'Serializable', timeout: 15000 }); }
      catch (error: any) { if (error.code === 'P2034' && attempt < 2) continue; throw error; }
    }
  }
  private async guest(tx: any, c: any, id: string) {
    const row = await tx.guest.findFirst({ where: { id, tenantId: c.tenantId }, include });
    if (!row) throw new NotFoundException('Guest not found'); return row;
  }
  private scoped(row: any, c: any) {
    return (!row.propertyId || row.propertyId === c.property.id) && (!row.branchId || row.branchId === c.branchId);
  }
  private visibleNote(user: any, c: any, row: any) {
    return this.scoped(row, c) && (row.visibility !== 'MANAGEMENT' || this.can(user, c, 'NOTE.MANAGEMENT'))
      && (row.visibility !== 'DEPARTMENT' || row.department === user.department);
  }
  private safe(user: any, c: any, row: any, reveal = false) {
    const { normalizedName, contacts, addresses, identities, preferences, notes, vip, ...guest } = row;
    return {
      ...guest,
      contacts: this.can(user, c, 'CONTACT.VIEW') ? contacts.map((x: any) => ({ id: x.id, type: x.type, isPrimary: x.isPrimary, isActive: x.isActive,
        value: reveal && this.can(user, c, 'CONTACT.VIEW_FULL') ? x.value : mask(x.value) })) : [],
      addresses: this.can(user, c, 'CONTACT.VIEW') ? addresses.map((x: any) => reveal && this.can(user, c, 'CONTACT.VIEW_FULL') ? x : { id: x.id, type: x.type, country: x.country, city: x.city, isPrimary: x.isPrimary, isActive: x.isActive, line1: '••••••', line2: null, postalCode: null, stateRegion: null }) : [],
      identities: this.can(user, c, 'IDENTITY.VIEW') ? identities.map((x: any) => {
        const { numberEncrypted, numberHash, ...rest } = x;
        return { ...rest, number: reveal && this.can(user, c, 'IDENTITY.VIEW_FULL') ? decryptIdentity(numberEncrypted) : x.maskedNumber,
          expired: !!x.expiryDate && x.expiryDate < new Date() };
      }) : [],
      preferences: this.can(user, c, 'PREFERENCE.VIEW') ? preferences.filter((x: any) => this.scoped(x, c)) : [],
      notes: this.can(user, c, 'NOTE.VIEW') ? notes.filter((x: any) => this.visibleNote(user, c, x)) : [],
      vip: this.can(user, c, 'VIP.VIEW') ? vip : null,
      stayHistory: [], stayHistoryAvailable: false,
    };
  }
  // Audit snapshots contain metadata and masked values, never raw identity/contact/note text.
  private snapshot(resource: string, value: any) {
    if (!value) return undefined;
    const allowed: Record<string, string[]> = {
      profile: ['fullName', 'displayName', 'status', 'guestType', 'nationality', 'preferredLanguage', 'version'],
      contacts: ['type', 'isPrimary', 'isActive'], addresses: ['type', 'isPrimary', 'isActive'],
      identities: ['type', 'maskedNumber', 'isPrimary', 'isActive'],
      preferences: ['type', 'propertyId', 'branchId', 'isActive'],
      notes: ['type', 'visibility', 'propertyId', 'branchId', 'isResolved', 'isActive'],
      vip: ['level', 'effectiveFrom', 'effectiveTo', 'isActive'],
    };
    return JSON.parse(JSON.stringify(Object.fromEntries((allowed[resource] || []).filter(k => value[k] !== undefined).map(k => [k, value[k]]))));
  }
  private audit(tx: any, user: any, c: any, guestId: string, action: string, resource: string, old?: any, current?: any) {
    return tx.guestAudit.create({ data: { guestId, tenantId: c.tenantId, propertyId: c.property.id, branchId: c.branchId,
      action, resource, performedBy: user.id, oldValue: this.snapshot(resource, old), newValue: this.snapshot(resource, current) } });
  }
  private async bump(tx: any, user: any, c: any, id: string, version: any, data: any = {}) {
    if (!Number.isInteger(version) || version < 1) throw new BadRequestException('Guest version is required');
    const changed = await tx.guest.updateMany({ where: { id, tenantId: c.tenantId, version, status: { not: 'ARCHIVED' } }, data: { ...data, version: { increment: 1 }, updatedBy: user.id } });
    if (changed.count !== 1) throw new ConflictException('Guest changed or was archived. Refresh the profile before editing.');
  }
  private async duplicates(tx: any, user: any, c: any, b: any, exclude?: string) {
    const or: any[] = [];
    const name = textValue(b.fullName, 'Full name');
    if (name) or.push({ normalizedName: normalizeName(name) });
    for (const [field, type] of [['phone', 'Phone'], ['email', 'Email']]) {
      if (b[field]) or.push({ contacts: { some: { normalizedValue: contactValue(type, textValue(b[field], field, true)!), isActive: true } } });
    }
    if (b.number) or.push({ identities: { some: { numberHash: identityHash(c.tenantId, textValue(b.number, 'Identity number', true)!), isActive: true } } });
    if (!or.length) return [];
    const rows = await tx.guest.findMany({ where: { tenantId: c.tenantId, ...(exclude ? { id: { not: exclude } } : {}), OR: or }, include, take: 20 });
    return rows.map((r: any) => {
      const safe = this.safe(user, c, r);
      return { id: r.id, guestNumber: r.guestNumber, fullName: r.fullName, status: r.status, contacts: safe.contacts,
        reason: b.number && r.identities.some((x: any) => x.numberHash === identityHash(c.tenantId, b.number)) ? 'Identity match' :
          r.contacts.some((x: any) => (b.phone && x.normalizedValue === contactValue('Phone', b.phone)) || (b.email && x.normalizedValue === contactValue('Email', b.email))) ? 'Contact match' : 'Name match' };
    });
  }
  private reviewed(matches: any[], b: any) {
    if (matches.length && !textValue(b.duplicateReason, 'Duplicate review reason', false, 1000)) throw new ConflictException({ message: 'Possible existing guest found. Review matches or provide a reason to continue.', candidates: matches });
  }
  async duplicateReview(user: any, q: any, b: any) {
    const c = await this.context(user, q); return this.duplicates(this.db, user, c, b, b.excludeId);
  }
  private async profileData(tx: any, c: any, b: any, old?: any) {
    const data: any = {};
    for (const field of ['fullName', 'title', 'firstName', 'middleName', 'lastName', 'displayName', 'gender', 'nationality', 'preferredLanguage', 'occupation', 'company']) {
      if (!old || b[field] !== undefined) data[field] = textValue(b[field], field, field === 'fullName');
    }
    if (data.fullName) data.normalizedName = normalizeName(data.fullName);
    if (!old || b.guestType !== undefined) data.guestType = await this.choice(tx, c, 'guestType', b.guestType || 'Individual');
    if (!old || b.status !== undefined) {
      if (!['ACTIVE', 'INACTIVE'].includes(b.status || 'ACTIVE')) throw new BadRequestException('Use Active or Inactive. Archive uses its dedicated action.');
      data.status = b.status || 'ACTIVE';
    }
    if (!old || b.dateOfBirth !== undefined) {
      data.dateOfBirth = dateValue(b.dateOfBirth, 'date of birth');
      if (data.dateOfBirth && data.dateOfBirth > new Date()) throw new BadRequestException('Date of birth cannot be in the future');
    }
    if (!old || b.preferredContactMethod !== undefined) {
      data.preferredContactMethod = b.preferredContactMethod || 'None';
      if (!['Phone', 'Email', 'SMS', 'Messaging App', 'None'].includes(data.preferredContactMethod)) throw new BadRequestException('Invalid contact method');
    }
    return data;
  }
  async create(user: any, q: any, b: any) {
    const c = await this.context(user, q, 'PROFILE.CREATE'); this.require(user, c, 'PROFILE.VIEW');
    if (b.phone || b.email) this.require(user, c, 'CONTACT.UPDATE');
    const id = await this.transaction(async tx => {
      const data = await this.profileData(tx, c, b);
      const matches = await this.duplicates(tx, user, c, b); this.reviewed(matches, b);
      const year = new Date().getUTCFullYear();
      const sequence = await tx.guestSequence.upsert({ where: { tenantId_year: { tenantId: c.tenantId, year } }, create: { tenantId: c.tenantId, year, nextNumber: 2 }, update: { nextNumber: { increment: 1 } } });
      const row = await tx.guest.create({ data: { ...data, tenantId: c.tenantId, guestNumber: 'GST-' + year + '-' + String(sequence.nextNumber - 1).padStart(6, '0'), createdPropertyId: c.property.id, createdBy: user.id, updatedBy: user.id } });
      for (const [field, type] of [['phone', 'Phone'], ['email', 'Email']]) {
        if (b[field]) {
          const value = contactValue(type, textValue(b[field], field, true)!);
          await tx.guestContact.create({ data: { guestId: row.id, type, value, normalizedValue: value, isPrimary: true } });
        }
      }
      await this.audit(tx, user, c, row.id, matches.length ? 'CREATED_AFTER_DUPLICATE_REVIEW' : 'CREATED', 'profile', null, row);
      if (matches.length) await tx.guestNote.create({ data: { guestId: row.id, propertyId: c.property.id, branchId: c.branchId, type: 'Management', visibility: 'MANAGEMENT', text: 'Duplicate review: ' + b.duplicateReason, createdBy: user.id } });
      return row.id;
    });
    return this.detail(user, q, id);
  }
  async update(user: any, q: any, id: string, b: any) {
    const c = await this.context(user, q, 'PROFILE.UPDATE'); this.require(user, c, 'PROFILE.VIEW');
    await this.transaction(async tx => {
      const old = await this.guest(tx, c, id), data = await this.profileData(tx, c, b, old);
      if (data.status && data.status !== old.status) this.require(user, c, 'PROFILE.DEACTIVATE');
      this.reviewed(await this.duplicates(tx, user, c, { fullName: data.fullName }, id), b);
      await this.bump(tx, user, c, id, b.version, data);
      await this.audit(tx, user, c, id, 'UPDATED', 'profile', old, { ...old, ...data, version: old.version + 1 });
    });
    return this.detail(user, q, id);
  }
  async archive(user: any, q: any, id: string, b: any) {
    const c = await this.context(user, q, 'PROFILE.DEACTIVATE'); this.require(user, c, 'PROFILE.VIEW');
    await this.transaction(async tx => {
      const old = await this.guest(tx, c, id);
      await this.bump(tx, user, c, id, b.version, { status: 'ARCHIVED' });
      await this.audit(tx, user, c, id, 'ARCHIVED', 'profile', old, { ...old, status: 'ARCHIVED' });
    });
    return this.detail(user, q, id);
  }
  async detail(user: any, q: any, id: string) {
    const c = await this.context(user, q), row = await this.guest(this.db, c, id);
    if (q.reveal === 'true') {
      if (!this.can(user, c, 'CONTACT.VIEW_FULL') && !this.can(user, c, 'IDENTITY.VIEW_FULL')) throw new ForbiddenException('Full view permission required');
      await this.audit(this.db, user, c, id, 'SENSITIVE_DATA_VIEWED', 'profile');
    }
    return this.safe(user, c, row, q.reveal === 'true');
  }
  private async where(user: any, c: any, q: any) {
    const where: any = { tenantId: c.tenantId };
    if (q.status) {
      if (!['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(q.status)) throw new BadRequestException('Invalid status');
      where.status = q.status;
    }
    if (q.guestType) where.guestType = textValue(q.guestType, 'Guest type');
    if (q.nationality) where.nationality = textValue(q.nationality, 'Nationality');
    if (q.company) where.company = { contains: textValue(q.company, 'Company'), mode: 'insensitive' };
    if (q.createdProperty === 'true') where.createdPropertyId = c.property.id;
    if (q.from || q.to) {
      const from = dateValue(q.from, 'start date'), to = dateValue(q.to, 'end date');
      if (from && to && to < from) throw new BadRequestException('End must follow start');
      where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lt: new Date(to.getTime() + 86400000) } : {}) };
    }
    if (q.vip === 'true') {
      this.require(user, c, 'VIP.VIEW');
      where.vip = { is: { isActive: true, AND: [{ OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: new Date() } }] }, { OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date(new Date().toISOString().slice(0, 10)) } }] }] } };
    }
    const search = textValue(q.q, 'Search', false, 100);
    if (search) {
      const or: any[] = [{ normalizedName: { contains: normalizeName(search) } }, { guestNumber: { contains: search, mode: 'insensitive' } }, { company: { contains: search, mode: 'insensitive' } }];
      if (this.can(user, c, 'CONTACT.VIEW')) {
        const normalized = search.includes('@') ? search.toLowerCase() : search.replace(/[\s().-]/g, '').replace(/^00/, '+');
        if (normalized) or.push({ contacts: { some: { isActive: true, normalizedValue: { contains: normalized, mode: 'insensitive' } } } });
      }
      where.OR = or;
    }
    if (q.identity) {
      this.require(user, c, 'IDENTITY.VIEW');
      where.identities = { some: { isActive: true, numberHash: identityHash(c.tenantId, textValue(q.identity, 'Identity search', true)!) } };
    }
    return where;
  }
  async list(user: any, q: any) {
    const c = await this.context(user, q), where = await this.where(user, c, q);
    const page = Number(q.page || 1), pageSize = Number(q.pageSize || 20);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new BadRequestException('Invalid pagination');
    const [total, rows] = await this.db.$transaction([this.db.guest.count({ where }), this.db.guest.findMany({ where, include, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize })]);
    return { total, page, pageSize, items: rows.map(r => this.safe(user, c, r)) };
  }
  async child(user: any, q: any, id: string, resource: string, b: any, childId?: string) {
    const def = resources[resource]; if (!def) throw new NotFoundException('Unknown guest section');
    const permission = resource === 'identities' && !childId ? 'IDENTITY.CREATE' : resource === 'notes' && !childId ? 'NOTE.CREATE' : def.permission;
    const c = await this.context(user, q, permission); this.require(user, c, 'PROFILE.VIEW');
    await this.transaction(async tx => {
      const guest = await this.guest(tx, c, id);
      const old = childId ? await tx[def.model].findFirst({ where: { id: childId, guestId: id } }) : resource === 'vip' ? guest.vip : null;
      if (childId && !old) throw new NotFoundException('Guest section record not found');
      if (old && (!this.scoped(old, c) || resource === 'notes' && !this.visibleNote(user, c, old))) throw new ForbiddenException('Record is outside your scope');
      const data: any = {};
      for (const field of ['isPrimary', 'isActive', 'isResolved']) if (b[field] !== undefined && typeof b[field] !== 'boolean') throw new BadRequestException('Invalid ' + field);
      if (['contacts', 'addresses', 'identities'].includes(resource)) data.isPrimary = b.isPrimary ?? old?.isPrimary ?? false;
      data.isActive = b.isActive ?? old?.isActive ?? true;
      if (data.isActive === false) data.isPrimary = false;
      if (!['contacts', 'addresses', 'identities'].includes(resource)) delete data.isPrimary;
      if (resource === 'contacts') {
        data.type = b.type ?? old?.type;
        if (!['Phone', 'Email'].includes(data.type)) throw new BadRequestException('Contact must be Phone or Email');
        data.value = b.value !== undefined ? contactValue(data.type, textValue(b.value, 'Contact value', true)!) : old?.value;
        if (!data.value) throw new BadRequestException('Contact value required');
        data.value = contactValue(data.type, data.value);
        data.normalizedValue = data.value;
        this.reviewed(await this.duplicates(tx, user, c, { [data.type === 'Phone' ? 'phone' : 'email']: data.value }, id), b);
      } else if (resource === 'addresses') {
        data.type = b.type ?? old?.type ?? 'Home';
        if (!['Home', 'Work', 'Billing', 'Other'].includes(data.type)) throw new BadRequestException('Invalid address type');
        for (const field of ['line1', 'line2', 'city', 'stateRegion', 'postalCode', 'country']) data[field] = b[field] === undefined && old ? old[field] : textValue(b[field], field, field === 'line1', 500);
      } else if (resource === 'identities') {
        data.type = await this.choice(tx, c, 'identityType', b.type ?? old?.type);
        if (b.number !== undefined || !old) {
          const number = normalizeIdentity(textValue(b.number, 'Identity number', true)!);
          data.numberHash = identityHash(c.tenantId, number); data.numberEncrypted = encryptIdentity(number); data.maskedNumber = mask(number);
          const matches = await this.duplicates(tx, user, c, { number }, id); this.reviewed(matches, b);
        }
        data.countryOfIssue = b.countryOfIssue === undefined && old ? old.countryOfIssue : textValue(b.countryOfIssue, 'Country of issue');
        for (const f of ['issueDate', 'expiryDate']) data[f] = b[f] === undefined && old ? old[f] : dateValue(b[f], f);
        if (data.issueDate && data.expiryDate && data.expiryDate < data.issueDate) throw new BadRequestException('Expiry cannot precede issue date');
      } else if (resource === 'preferences') {
        data.type = await this.choice(tx, c, 'preferenceType', b.type ?? old?.type);
        data.value = textValue(b.value ?? old?.value, 'Preference', true, 500);
        data.notes = textValue(b.notes ?? old?.notes, 'Preference notes', false, 1000);
        data.priority = b.priority ?? old?.priority ?? 'Normal';
        if (!['Low', 'Normal', 'High'].includes(data.priority)) throw new BadRequestException('Invalid priority');
      } else if (resource === 'notes') {
        data.type = b.type ?? old?.type ?? 'General';
        if (!['General', 'Front Desk', 'Housekeeping', 'Billing', 'Service', 'Management'].includes(data.type)) throw new BadRequestException('Invalid note type');
        data.text = textValue(b.text ?? old?.text, 'Note', true, 4000);
        data.visibility = b.visibility ?? old?.visibility ?? 'PROPERTY';
        if (!['GROUP', 'PROPERTY', 'MANAGEMENT', 'DEPARTMENT'].includes(data.visibility)) throw new BadRequestException('Invalid note visibility');
        if (data.visibility === 'MANAGEMENT') this.require(user, c, 'NOTE.MANAGEMENT');
        data.department = data.visibility === 'DEPARTMENT' ? textValue(user.department, 'Your account department', true) : null;
        data.isResolved = b.isResolved ?? old?.isResolved ?? false;
        if (!old) data.createdBy = user.id;
      } else {
        data.level = await this.choice(tx, c, 'vipLevel', b.level ?? old?.level);
        for (const f of ['effectiveFrom', 'effectiveTo']) data[f] = b[f] === undefined && old ? old[f] : dateValue(b[f], f);
        if (data.effectiveFrom && data.effectiveTo && data.effectiveTo < data.effectiveFrom) throw new BadRequestException('VIP end cannot precede start');
        data.reason = textValue(b.reason ?? old?.reason, 'VIP reason', false, 1000); data.approvedBy = user.id;
      }
      if (['preferences', 'notes'].includes(resource)) {
        const group = resource === 'notes' ? data.visibility === 'GROUP' : b.scope === 'GROUP';
        if (group && c.branchId) throw new ForbiddenException('Branch context cannot publish group-wide information');
        data.propertyId = group ? null : c.property.id; data.branchId = group ? null : c.branchId;
        // Existing scope is immutable; use a new record to publish at a different scope.
        if (old) { data.propertyId = old.propertyId; data.branchId = old.branchId; if (resource === 'notes' && (data.visibility === 'GROUP') !== (old.visibility === 'GROUP')) throw new BadRequestException('Create a new note to change its scope'); }
      }
      await this.bump(tx, user, c, id, b.version);
      if (data.isPrimary) await tx[def.model].updateMany({ where: { guestId: id, ...(resource === 'contacts' ? { type: data.type } : {}) }, data: { isPrimary: false } });
      const row = old ? await tx[def.model].update({ where: { id: old.id }, data }) : await tx[def.model].create({ data: { ...data, guestId: id } });
      await this.audit(tx, user, c, id, old ? 'UPDATED' : 'ADDED', resource, old, row);
      if (b.duplicateReason) await tx.guestNote.create({ data: { guestId: id, propertyId: c.property.id, branchId: c.branchId, type: 'Management', visibility: 'MANAGEMENT', text: 'Duplicate review: ' + textValue(b.duplicateReason, 'Review reason', true, 1000), createdBy: user.id } });
    });
    return this.detail(user, q, id);
  }
  async auditHistory(user: any, q: any, id: string) {
    const c = await this.context(user, q, 'AUDIT.VIEW'); this.require(user, c, 'PROFILE.VIEW'); await this.guest(this.db, c, id);
    return this.db.guestAudit.findMany({ where: { guestId: id, tenantId: c.tenantId, propertyId: c.property.id, ...(c.branchId ? { OR: [{ branchId: null }, { branchId: c.branchId }] } : { branchId: null }) }, orderBy: { createdAt: 'desc' }, take: 200 });
  }
  async reports(user: any, q: any) {
    const c = await this.context(user, q, 'REPORT.VIEW'); this.require(user, c, 'PROFILE.VIEW');
    const where = await this.where(user, c, q);
    const [total, nationality, status] = await Promise.all([this.db.guest.count({ where }),
      this.db.guest.groupBy({ by: ['nationality'], where, _count: { _all: true } }),
      this.db.guest.groupBy({ by: ['status'], where, _count: { _all: true } })]);
    return { total, nationality, status, stayHistoryAvailable: false };
  }
  async export(user: any, q: any) {
    const c = await this.context(user, q, 'REPORT.EXPORT'); this.require(user, c, 'REPORT.VIEW'); this.require(user, c, 'PROFILE.VIEW');
    const where = await this.where(user, c, q);
    if (await this.db.guest.count({ where }) > 10000) throw new BadRequestException('Narrow the filters to 10,000 guests or fewer');
    const rows = await this.db.guest.findMany({ where, orderBy: { guestNumber: 'asc' }, take: 10000, select: { guestNumber: true, fullName: true, guestType: true, nationality: true, status: true, createdAt: true } });
    const cell = (v: any) => '"' + String(v ?? '').replace(/^(?:[\t\r]|\s*[=+@-])/, match => "'" + match).replace(/"/g, '""') + '"';
    return { filename: 'guest-master.csv', csv: [['Guest number', 'Full name', 'Guest type', 'Nationality', 'Status', 'Created'], ...rows.map(r => [r.guestNumber, r.fullName, r.guestType, r.nationality, r.status, r.createdAt.toISOString()])].map(row => row.map(cell).join(',')).join('\r\n') };
  }
}
