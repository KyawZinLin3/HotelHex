import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

const includeMap: Record<string, any> = {
  groups: {},
  companies: { group: true, defaultCurrency: true },
  properties: { company: true, defaultCurrency: true },
  branches: { property: { include: { company: true } } },
  buildings: { property: true, branch: true, floors: true },
  floors: { building: { include: { property: true } } },
  departments: { company: true, property: true, branch: true, parent: true },
  currencies: {},
  taxes: { currency: true },
  businessDates: { property: true, branch: true },
  financialYears: { company: true },
  costCenters: { company: true, department: true },
  profitCenters: { company: true, department: true },
};

const orderByMap: Record<string, any> = {
  groups: { name: "asc" },
  branches: { code: "asc" },
  currencies: { code: "asc" },
  taxes: { code: "asc" },
  businessDates: { date: "desc" },
  financialYears: { startDate: "desc" },
};

const modelMap: Record<string, string> = {
  groups: "businessGroup",
  companies: "company", properties: "property", branches: "branch",
  buildings: "building", floors: "floor", departments: "department",
  currencies: "currency", taxes: "tax", businessDates: "businessDate",
  financialYears: "financialYear", costCenters: "costCenter", profitCenters: "profitCenter",
};

@Injectable()
export class OrganizationService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const branches = await this.prisma.branch.findMany({ select: { id: true, propertyId: true } });
    const businessDate = new Date();
    businessDate.setHours(0, 0, 0, 0);
    await Promise.all(branches.map((branch: { id: string; propertyId: string }) => this.prisma.businessDate.upsert({
      where: { propertyId_branchId: { propertyId: branch.propertyId, branchId: branch.id } },
      create: { propertyId: branch.propertyId, branchId: branch.id, date: businessDate },
      update: {},
    })));
  }

  private delegate(resource: string): any {
    const model = modelMap[resource];
    if (!model) throw new NotFoundException("Unknown organization resource");
    return (this.prisma as any)[model];
  }

  async list(resource: string, query: Record<string, string | undefined>) {
    const delegate = this.delegate(resource);
    const where: any = {};
    for (const key of ["companyId", "propertyId", "branchId", "buildingId", "departmentId", "groupId"]) {
      if (query[key]) where[key] = query[key];
    }
    if (query.search) {
      where.OR = [{ code: { contains: query.search, mode: "insensitive" } }, { name: { contains: query.search, mode: "insensitive" } }];
    }
    if (query.active === "true") where.isActive = true;
    if (query.active === "false") where.isActive = false;
    return delegate.findMany({ where, include: includeMap[resource], orderBy: orderByMap[resource] ?? { createdAt: "desc" } }).catch((error: any) => {
      throw new BadRequestException(error.message);
    });
  }

  async get(resource: string, id: string) {
    const result = await this.delegate(resource).findUnique({ where: { id }, include: includeMap[resource] });
    if (!result) throw new NotFoundException("Record not found");
    return result;
  }

  private normalizeInput(input: any): Record<string, any> {
    const data: Record<string, any> = { ...input };
    for (const field of ["floorNumber", "numberOfRooms", "starRating", "decimalPlaces"]) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== "") data[field] = Number(data[field]);
    }
    for (const field of ["openingDate", "effectiveDate", "expiryDate", "startDate", "endDate", "date"]) {
      if (typeof data[field] === "string" && data[field]) data[field] = new Date(data[field]);
    }
    return data;
  }

  async create(resource: string, input: any) {
    const data = this.normalizeInput(input);
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
    const result = await this.delegate(resource).create({ data, include: includeMap[resource] });
    await this.audit(resource, result.id, "CREATE", null, result, input.branchId);
    return result;
  }

  async update(resource: string, id: string, input: any) {
    const existing = await this.get(resource, id);
    const data = this.normalizeInput(input);
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;
    const result = await this.delegate(resource).update({ where: { id }, data, include: includeMap[resource] });
    await this.audit(resource, id, "UPDATE", existing, result, input.branchId ?? existing.branchId);
    return result;
  }

  async deactivate(resource: string, id: string) {
    const existing = await this.get(resource, id);
    const data = ["companies", "properties", "branches"].includes(resource)
      ? { status: resource === "companies" ? "INACTIVE" : "INACTIVE" }
      : { isActive: false };
    const result = await this.delegate(resource).update({ where: { id }, data, include: includeMap[resource] });
    await this.audit(resource, id, "DEACTIVATE", existing, result, existing.branchId);
    return result;
  }

  async dashboard() {
    const [groups, companies, properties, branches, departments, users, rooms] = await this.prisma.$transaction([
      this.prisma.businessGroup.count(),
      this.prisma.company.count(),
      this.prisma.property.count(),
      this.prisma.branch.count(),
      this.prisma.department.count(),
      this.prisma.user.count(),
      this.prisma.property.aggregate({ _sum: { numberOfRooms: true } }),
    ]);
    return { groups, companies, properties, branches, departments, users, totalRooms: rooms._sum.numberOfRooms ?? 0 };
  }

  async hierarchy() {
    return this.prisma.businessGroup.findMany({
      where: { isActive: true },
      include: { companies: { include: { properties: { include: { branches: { include: { buildings: { include: { floors: true } }, departments: true } } } } } } },
      orderBy: { name: "asc" },
    });
  }

  async audit(resource: string, recordId: string, action: any, oldValue: any, newValue: any, branchId?: string) {
    return this.prisma.auditLog.create({
      data: { entity: resource, recordId, action, oldValue: oldValue ?? undefined, newValue: newValue ?? undefined, branchId },
    });
  }
}
