import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SecurityService } from './security.service';

@Injectable()
export class RoomAccessService {
  constructor(private readonly prisma: PrismaService, private readonly security: SecurityService) {}

  async authenticate(authorization?: string) {
    const user = await this.security.currentUser(authorization?.replace(/^Bearer\s+/i, ''));
    if (user.mustChangePassword) throw new ForbiddenException('Change your temporary password before accessing rooms');
    const now = new Date();
    user.roleAssignments = user.roleAssignments.filter((a: any) => a.isActive && a.role.status === 'ACTIVE'
      && (!a.effectiveFrom || new Date(a.effectiveFrom) <= now) && (!a.effectiveTo || new Date(a.effectiveTo) > now));
    return user;
  }

  can(user: any, permission: string, property: any, branchId?: string | null) {
    return user.roleAssignments.some((a: any) => {
      if (!a.role.permissions.some((p: any) => p.permission.isActive && p.permission.code === permission)) return false;
      if (a.companyId && a.companyId !== property.companyId) return false;
      if (a.propertyId && a.propertyId !== property.id) return false;
      if (a.branchId && a.branchId !== branchId) return false;
      // Group grants need a group identifier, which Module 2 does not yet store.
      if (a.role.scope === 'GROUP') return false;
      if (a.role.scope === 'COMPANY' && !a.companyId) return false;
      if (a.role.scope === 'PROPERTY' && !a.propertyId) return false;
      if (a.role.scope === 'BRANCH' && !a.branchId) return false;
      return true;
    });
  }

  require(user: any, permission: string, property: any, branchId?: string | null) {
    if (!this.can(user, permission, property, branchId)) throw new ForbiddenException('Permission or organization scope does not allow this action');
  }

  async context(user: any, propertyId: string, branchId?: string) {
    if (typeof propertyId !== 'string' || !propertyId) throw new ForbiddenException('Select an accessible property');
    const property = await this.prisma.property.findUnique({ where: { id: propertyId || '-' }, include: { branches: true } });
    if (!property) throw new ForbiddenException('Select an accessible property');
    if (branchId && !property.branches.some((b: any) => b.id === branchId)) throw new ForbiddenException('Branch does not belong to property');
    return property;
  }
}
