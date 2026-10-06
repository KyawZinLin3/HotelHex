import { RESERVATION_PERMISSIONS } from './reservation.constants';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { PrismaService } from "./prisma.service";
import { GUEST_PERMISSIONS } from './guest.constants';
import { ROOM_PERMISSIONS } from './room.constants';
import { FRONT_DESK_PERMISSIONS } from './front-desk.constants';

const PERMISSIONS = [
  ...['PLAN.VIEW','PLAN.CREATE','PLAN.UPDATE','PLAN.ACTIVATE','PRICE.VIEW','PRICE.CREATE','PRICE.UPDATE','RESTRICTION.MANAGE','PROMOTION.MANAGE','OVERRIDE','OVERRIDE.APPROVE','HOURLY.VIEW','HOURLY.CREATE','HOURLY.UPDATE','HOURLY.ACTIVATE','DAYUSE.VIEW','DAYUSE.CREATE','DAYUSE.UPDATE','DAYUSE.ACTIVATE','STAY_POLICY.VIEW','STAY_POLICY.UPDATE'].map((name) => [`RATE.${name}`, 'RATE', name.split('.')[0], name.split('.').slice(1).join('.')]),
  ["SECURITY.USER.VIEW", "SECURITY", "USER", "VIEW"], ["SECURITY.USER.CREATE", "SECURITY", "USER", "CREATE"],
  ["SECURITY.USER.UPDATE", "SECURITY", "USER", "UPDATE"], ["SECURITY.USER.DISABLE", "SECURITY", "USER", "DISABLE"],
  ["SECURITY.ROLE.VIEW", "SECURITY", "ROLE", "VIEW"], ["SECURITY.ROLE.CREATE", "SECURITY", "ROLE", "CREATE"],
  ["SECURITY.ROLE.UPDATE", "SECURITY", "ROLE", "UPDATE"], ["SECURITY.PERMISSION.ASSIGN", "SECURITY", "PERMISSION", "ASSIGN"],
  ["SECURITY.AUDIT.VIEW", "SECURITY", "AUDIT", "VIEW"], ["ORGANIZATION.SETUP.VIEW", "ORGANIZATION", "SETUP", "VIEW"],
];

@Injectable()
export class SecurityService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    for (const [resource, actions] of Object.entries(RESERVATION_PERMISSIONS)) {
      for (const action of actions) {
        const code = 'RESERVATION.' + resource + '.' + action;
        await this.prisma.permission.upsert({ where: { code }, update: {}, create: { code, module: 'RESERVATION', resource, action } });
      }
    }
    for (const [resource, actions] of Object.entries(FRONT_DESK_PERMISSIONS)) {
      for (const action of actions) {
        const code = 'FRONTDESK.' + resource + '.' + action;
        await this.prisma.permission.upsert({ where: { code }, update: {}, create: { code, module: 'FRONTDESK', resource, action } });
      }
    }    for (const [resource, actions] of Object.entries(GUEST_PERMISSIONS)) {
      for (const action of actions) {
        const code = 'GUEST.' + resource + '.' + action;
        await this.prisma.permission.upsert({ where: { code }, update: {}, create: { code, module: 'GUEST', resource, action } });
      }
    }
    for (const [resource, actions] of Object.entries(ROOM_PERMISSIONS)) {
      for (const action of actions) {
        const code = `ROOM.${resource}.${action}`;
        await this.prisma.permission.upsert({ where: { code }, update: {}, create: { code, module: 'ROOM', resource, action } });
      }
    }
    for (const [code, module, resource, action] of PERMISSIONS) {
      await this.prisma.permission.upsert({ where: { code }, update: {}, create: { code, module, resource, action } });
    }
  }

  private hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); return salt + ":" + scryptSync(password, salt, 64).toString("hex"); }
  private verifyPassword(password: string, encoded?: string | null) { if (!encoded) return false; const [salt, key] = encoded.split(":"); if (!salt || !key) return false; const actual = scryptSync(password, salt, 64); const expected = Buffer.from(key, "hex"); return actual.length === expected.length && timingSafeEqual(actual, expected); }
  private publicUser(user: any) { const { passwordHash, ...safe } = user; return safe; }
  private async audit(action: any, entity: string, recordId: string, oldValue?: any, newValue?: any, performedById?: string) { return this.prisma.auditLog.create({ data: { action, entity, recordId, oldValue, newValue, performedById } }); }

  users() { return this.prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { roleAssignments: { include: { role: true } }, branchLinks: { include: { branch: true } } } }).then((rows: any[]) => rows.map((row: any) => this.publicUser(row))); }
  roles() { return this.prisma.role.findMany({ orderBy: { name: "asc" }, include: { permissions: { include: { permission: true } }, _count: { select: { assignments: true } } } }); }
  permissions() { return this.prisma.permission.findMany({ where: { isActive: true }, orderBy: [{ module: "asc" }, { resource: "asc" }, { action: "asc" }] }); }
  user(id: string) { return this.prisma.user.findUnique({ where: { id }, include: { roleAssignments: { include: { role: { include: { permissions: { include: { permission: true } } } } } }, branchLinks: { include: { branch: true } } } }).then((row: any) => row ? this.publicUser(row) : (() => { throw new NotFoundException("User not found"); })()); }
  role(id: string) { return this.prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } }, assignments: { include: { user: true } } } }).then((row: any) => row ?? (() => { throw new NotFoundException("Role not found"); })()); }

  async createUser(input: any, performedById?: string) {
    if (!input.username || !input.name) throw new BadRequestException("Username and full name are required");
    if (!input.password || String(input.password).length < 8) throw new BadRequestException("Password must be at least 8 characters");
    const user = await this.prisma.user.create({ data: { username: String(input.username).trim().toLowerCase(), name: input.name, email: input.email || null, phone: input.phone, jobTitle: input.jobTitle, department: input.department, passwordHash: this.hashPassword(input.password), status: input.status ?? "ACTIVE", mustChangePassword: Boolean(input.mustChangePassword), defaultCompanyId: input.defaultCompanyId, defaultPropertyId: input.defaultPropertyId, defaultBranchId: input.defaultBranchId } });
    await this.audit("CREATE", "users", user.id, undefined, { username: user.username, name: user.name }, performedById); return this.publicUser(user);
  }

  async updateUser(id: string, input: any, performedById?: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } }); if (!existing) throw new NotFoundException("User not found");
    const data: any = { name: input.name, email: input.email || null, phone: input.phone, jobTitle: input.jobTitle, department: input.department, defaultCompanyId: input.defaultCompanyId, defaultPropertyId: input.defaultPropertyId, defaultBranchId: input.defaultBranchId, status: input.status, mustChangePassword: input.mustChangePassword };
    if (input.password) { if (String(input.password).length < 8) throw new BadRequestException("Password must be at least 8 characters"); data.passwordHash = this.hashPassword(input.password); data.mustChangePassword = Boolean(input.mustChangePassword); }
    const user = await this.prisma.user.update({ where: { id }, data }); await this.audit("UPDATE", "users", id, { status: existing.status }, { status: user.status }, performedById); return this.publicUser(user);
  }

  async setUserStatus(id: string, status: "ACTIVE" | "INACTIVE" | "LOCKED", performedById?: string) { const user = await this.prisma.user.update({ where: { id }, data: { status, lockedUntil: status === "LOCKED" ? new Date(Date.now() + 30 * 60 * 1000) : null } }); await this.audit(status === "ACTIVE" ? "ACTIVATE" : "DEACTIVATE", "users", id, undefined, { status }, performedById); return this.publicUser(user); }
  async resetPassword(id: string, password: string, performedById?: string) { if (!password || password.length < 8) throw new BadRequestException("Password must be at least 8 characters"); const user = await this.prisma.user.update({ where: { id }, data: { passwordHash: this.hashPassword(password), mustChangePassword: true, status: "ACTIVE", failedLoginAttempts: 0, lockedUntil: null } }); await this.audit("PASSWORD_RESET", "users", id, undefined, { mustChangePassword: true }, performedById); return this.publicUser(user); }

  async createRole(input: any, performedById?: string) { if (!input.code || !input.name) throw new BadRequestException("Role code and name are required"); const role = await this.prisma.role.create({ data: { code: String(input.code).trim().toUpperCase(), name: input.name, description: input.description, roleType: input.roleType ?? "CUSTOM", scope: input.scope ?? "TENANT" } }); await this.audit("CREATE", "roles", role.id, undefined, role, performedById); return role; }
  async updateRole(id: string, input: any, performedById?: string) { const role = await this.prisma.role.update({ where: { id }, data: { name: input.name, description: input.description, scope: input.scope, status: input.status } }); await this.audit("UPDATE", "roles", id, undefined, role, performedById); return role; }
  async replaceRolePermissions(roleId: string, permissionIds: string[], performedById?: string) { await this.prisma.rolePermission.deleteMany({ where: { roleId } }); await this.prisma.rolePermission.createMany({ data: [...new Set(permissionIds)].map((permissionId) => ({ roleId, permissionId })) }); await this.audit("PERMISSION_ASSIGN", "roles", roleId, undefined, { permissionIds }, performedById); return this.role(roleId); }

  async assignments(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundException("User not found");
    const assignments = await this.prisma.userRoleAssignment.findMany({ where: { userId }, include: { role: true }, orderBy: { createdAt: "desc" } });
    return Promise.all(assignments.map(async assignment => {
      const [company, property, branch] = await Promise.all([
        assignment.companyId ? this.prisma.company.findUnique({ where: { id: assignment.companyId }, select: { id: true, legalName: true } }) : null,
        assignment.propertyId ? this.prisma.property.findUnique({ where: { id: assignment.propertyId }, select: { id: true, name: true } }) : null,
        assignment.branchId ? this.prisma.branch.findUnique({ where: { id: assignment.branchId }, select: { id: true, name: true } }) : null,
      ]);
      return { ...assignment, company, property, branch };
    }));
  }
  async assignRole(userId: string, input: any, performedById?: string) {
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      this.prisma.role.findUnique({ where: { id: input.roleId } }),
    ]);
    if (!user) throw new NotFoundException("User not found");
    if (!role || role.status !== "ACTIVE") throw new BadRequestException("Select an active role");
    if (role.scope === "GROUP") throw new BadRequestException("Group-scoped assignments are not available until group access is added to the security model");
    if (role.scope === "COMPANY" && !input.companyId) throw new BadRequestException("This role requires a company scope");
    if (role.scope === "PROPERTY" && !input.propertyId) throw new BadRequestException("This role requires a property scope");
    if (role.scope === "BRANCH" && !input.branchId) throw new BadRequestException("This role requires a branch scope");
    let property: any = null;
    if (input.propertyId) {
      property = await this.prisma.property.findUnique({ where: { id: input.propertyId }, select: { id: true, companyId: true } });
      if (!property) throw new BadRequestException("Select an existing property");
      if (input.companyId && input.companyId !== property.companyId) throw new BadRequestException("Property does not belong to the selected company");
      input.companyId = property.companyId;
    }
    if (input.branchId) {
      const branch = await this.prisma.branch.findUnique({ where: { id: input.branchId }, select: { id: true, propertyId: true } });
      if (!branch || (input.propertyId && input.propertyId !== branch.propertyId)) throw new BadRequestException("Branch does not belong to the selected property");
      if (!property) {
        property = await this.prisma.property.findUnique({ where: { id: branch.propertyId }, select: { id: true, companyId: true } });
        input.propertyId = property.id;
        input.companyId = property.companyId;
      }
    }
    if (input.companyId && !(await this.prisma.company.findUnique({ where: { id: input.companyId }, select: { id: true } }))) throw new BadRequestException("Select an existing company");
    const effectiveFrom = input.effectiveFrom ? new Date(input.effectiveFrom) : null;
    const effectiveTo = input.effectiveTo ? new Date(input.effectiveTo) : null;
    if ((effectiveFrom && Number.isNaN(effectiveFrom.getTime())) || (effectiveTo && Number.isNaN(effectiveTo.getTime())) || (effectiveFrom && effectiveTo && effectiveTo <= effectiveFrom)) throw new BadRequestException("Assignment end must be later than its start");
    const sameScope = { userId, roleId: role.id, isActive: true, companyId: input.companyId || null, propertyId: input.propertyId || null, branchId: input.branchId || null };
    const existing = await this.prisma.userRoleAssignment.findMany({ where: sameScope, select: { effectiveFrom: true, effectiveTo: true } });
    const newStart = effectiveFrom ?? new Date();
    const newEnd = effectiveTo ?? new Date(8640000000000000);
    if (existing.some(item => (item.effectiveTo ?? new Date(8640000000000000)) > newStart && (item.effectiveFrom ?? new Date(0)) < newEnd)) throw new BadRequestException("An active assignment for this role and scope already overlaps these dates");
    const assignment = await this.prisma.userRoleAssignment.create({ data: {
      userId, roleId: role.id, companyId: input.companyId || null, propertyId: input.propertyId || null, branchId: input.branchId || null,
      effectiveFrom: effectiveFrom ?? undefined, effectiveTo: effectiveTo ?? undefined,
    }, include: { role: true } });
    await this.audit("ROLE_ASSIGNED", "userRoleAssignments", assignment.id, undefined, assignment, performedById);
    return assignment;
  }
  async removeAssignment(id: string, performedById?: string) {
    const existing = await this.prisma.userRoleAssignment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Assignment not found");
    if (!existing.isActive) throw new BadRequestException("This assignment has already been removed");
    const assignment = await this.prisma.userRoleAssignment.update({ where: { id }, data: { isActive: false } });
    await this.audit("ROLE_REMOVED", "userRoleAssignments", id, existing, assignment, performedById);
    return assignment;
  }

  async login(username: string, password: string, meta: any = {}) {
    const user = await this.prisma.user.findUnique({ where: { username: username.toLowerCase() } });
    if (!user) { await this.prisma.loginHistory.create({ data: { username, success: false, reason: "INVALID_CREDENTIALS", ipAddress: meta.ipAddress } }); throw new UnauthorizedException("Invalid username or password"); }
    if (user.status !== "ACTIVE" || (user.lockedUntil && user.lockedUntil > new Date())) { await this.prisma.loginHistory.create({ data: { userId: user.id, username, success: false, reason: "ACCOUNT_UNAVAILABLE", ipAddress: meta.ipAddress } }); throw new ForbiddenException("Account is not active or is locked"); }
    if (!this.verifyPassword(password, user.passwordHash)) { const attempts = user.failedLoginAttempts + 1; const locked = attempts >= 5; await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: locked ? 0 : attempts, status: locked ? "LOCKED" : undefined, lockedUntil: locked ? new Date(Date.now() + 30 * 60 * 1000) : undefined } }); await this.prisma.loginHistory.create({ data: { userId: user.id, username, success: false, reason: locked ? "ACCOUNT_LOCKED" : "INVALID_CREDENTIALS", ipAddress: meta.ipAddress } }); throw new UnauthorizedException("Invalid username or password"); }
    const rawToken = randomUUID() + randomBytes(24).toString("hex"); const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); await this.prisma.$transaction([this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lastLoginAt: new Date() } }), this.prisma.userSession.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(rawToken).digest("hex"), expiresAt, ipAddress: meta.ipAddress, userAgent: meta.userAgent } }), this.prisma.loginHistory.create({ data: { userId: user.id, username, success: true, ipAddress: meta.ipAddress } })]); return { token: rawToken, expiresAt, user: this.publicUser(user), mustChangePassword: user.mustChangePassword };
  }

  async changeOwnPassword(token: string | undefined, oldPassword: string, newPassword: string) {
    const user = await this.currentUser(token);
    const stored = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (typeof oldPassword !== 'string' || !this.verifyPassword(oldPassword, stored?.passwordHash)) throw new UnauthorizedException('Current password is incorrect');
    if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 200 || newPassword === oldPassword) throw new BadRequestException('Use a different password of 12 to 200 characters');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { passwordHash: this.hashPassword(newPassword), mustChangePassword: false } }),
      this.prisma.userSession.updateMany({ where: { userId: user.id }, data: { isActive: false } }),
      this.prisma.auditLog.create({ data: { entity: 'users', recordId: user.id, action: 'PASSWORD_CHANGE', performedById: user.id } }),
    ]);
    return { success: true };
  }

  async logout(token?: string) {
    if (token) await this.prisma.userSession.updateMany({ where: { tokenHash: createHash('sha256').update(token).digest('hex') }, data: { isActive: false } });
    return { success: true };
  }

  async currentUser(token?: string) {
    if (!token) throw new UnauthorizedException();
    const session: any = await this.prisma.userSession.findUnique({
      where: { tokenHash: createHash("sha256").update(token).digest("hex") },
      include: { user: { include: { roleAssignments: { where: { isActive: true }, include: { role: { include: { permissions: { include: { permission: true } } } } } } } } },
    });
    if (!session || !session.isActive || session.expiresAt < new Date() || session.user.status !== "ACTIVE") throw new UnauthorizedException("Session expired");
    await this.prisma.userSession.update({ where: { id: session.id }, data: { lastActivity: new Date() } });
    const permissions = [...new Set(session.user.roleAssignments.flatMap((a: any) => a.role.permissions.map((p: any) => p.permission.code)))];
    return { ...this.publicUser(session.user), permissions };
  }
}

