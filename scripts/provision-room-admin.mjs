// Run manually after schema synchronization. This is not a public bootstrap API.
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();
const propertyId = process.env.ROOM_ADMIN_PROPERTY_ID;
const username = process.env.ROOM_ADMIN_USERNAME?.trim().toLowerCase();
const password = process.env.ROOM_ADMIN_PASSWORD;
const catalog = {
  TYPE: ['VIEW', 'CREATE', 'UPDATE', 'ACTIVATE', 'DEACTIVATE'], BEDTYPE: ['VIEW', 'MANAGE'],
  AMENITY: ['VIEW', 'MANAGE'], FEATURE: ['VIEW', 'MANAGE'], ROOM: ['VIEW', 'CREATE', 'UPDATE', 'ACTIVATE', 'DEACTIVATE'],
  STATUS: ['VIEW', 'UPDATE', 'OVERRIDE'], OOO: ['VIEW', 'CREATE', 'UPDATE', 'RELEASE'], OOS: ['VIEW', 'CREATE', 'RELEASE'],
  NOTE: ['VIEW', 'CREATE'], REPORT: ['VIEW', 'EXPORT'],
};
try {
  if (!propertyId || !username) throw new Error('Set ROOM_ADMIN_PROPERTY_ID and ROOM_ADMIN_USERNAME.');
  await prisma.$transaction(async tx => {
    const property = await tx.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new Error('Property was not found. Create it in Organization first.');
    let user = await tx.user.findUnique({ where: { username } });
    if (!user) {
      if (!password || password.length < 12 || password.length > 200) throw new Error('For a new user, set ROOM_ADMIN_PASSWORD to 12?200 characters.');
      const salt = randomBytes(16).toString('hex');
      user = await tx.user.create({ data: { username, name: process.env.ROOM_ADMIN_NAME || username,
        passwordHash: salt + ':' + scryptSync(password, salt, 64).toString('hex'), status: 'ACTIVE', mustChangePassword: true } });
    }
    if (user.status !== 'ACTIVE') throw new Error('Existing user is not active. Review the account status in Security.');
    const code = 'ROOM_ADMIN_' + propertyId;
    const role = await tx.role.upsert({ where: { code }, update: {}, create: { code, name: property.name + ' Room Administrator', scope: 'PROPERTY', description: 'Room inventory administration for one property' } });
    if (role.status !== 'ACTIVE' || role.scope !== 'PROPERTY') throw new Error('Existing provisioning role is inactive or has a different scope. Review it in Security.');
    for (const [resource, actions] of Object.entries(catalog)) {
      for (const action of actions) {
        const code = `ROOM.${resource}.${action}`;
        const permission = await tx.permission.upsert({ where: { code }, update: {}, create: { code, module: 'ROOM', resource, action } });
        await tx.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
      }
    }
    const existing = await tx.userRoleAssignment.findFirst({ where: { userId: user.id, roleId: role.id, propertyId, isActive: true, effectiveFrom: null, effectiveTo: null } });
    if (!existing) await tx.userRoleAssignment.create({ data: { userId: user.id, roleId: role.id, companyId: property.companyId, propertyId } });
    await tx.auditLog.create({ data: { entity: 'ROOM.ADMIN_PROVISION', recordId: user.id, action: 'UPDATE', newValue: { roleId: role.id, propertyId, source: 'LOCAL_PROVISIONING' } } });
  }, { isolationLevel: 'Serializable', timeout: 30000 });
  console.log('Room administrator provisioned for the selected property. Existing passwords were not changed.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Provisioning failed.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
