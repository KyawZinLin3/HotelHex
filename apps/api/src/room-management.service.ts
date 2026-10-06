import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RoomAccessService } from './room-access.service';
import { ROOM_PERMISSIONS, ROOM_STATUSES, ROOM_TRANSITIONS } from './room.constants';

const catalogs: Record<string, { model: string; resource: string }> = {
  'room-types': { model: 'roomType', resource: 'TYPE' }, 'bed-types': { model: 'bedType', resource: 'BEDTYPE' },
  amenities: { model: 'amenity', resource: 'AMENITY' }, features: { model: 'roomFeature', resource: 'FEATURE' },
};
const roomInclude = { roomType: { include: { amenities: true, bedType: true } }, building: true, floor: true, branch: true, features: true, holds: { where: { releasedAt: null } } };
const smoking = ['SMOKING', 'NON_SMOKING', 'NOT_SPECIFIED'];
const clean = (value: any) => JSON.parse(JSON.stringify(value));

@Injectable()
export class RoomManagementService {
  constructor(private readonly prisma: PrismaService, private readonly access: RoomAccessService) {}
  private text(value: any, name: string, required = false) {
    if (value == null || value === '') { if (required) throw new BadRequestException(name + ' is required'); return null; }
    if (typeof value !== 'string' || value.trim().length > 2000) throw new BadRequestException('Invalid ' + name);
    if (required && !value.trim()) throw new BadRequestException(name + ' is required');
    return value.trim();
  }
  private number(value: any, name: string, min = 0) {
    if (!Number.isInteger(value) || value < min || value > 10000) throw new BadRequestException('Invalid ' + name);
    return value;
  }
  private choice(value: any, choices: string[], name: string) {
    if (!choices.includes(value)) throw new BadRequestException('Invalid ' + name); return value;
  }
  private flag(value: any) { if (typeof value !== 'boolean') throw new BadRequestException('Expected true or false'); return value; }
  private version(body: any) { return this.number(body.version, 'record version', 1); }
  private date(value: any, name: string) { const d = new Date(value); if (!value || Number.isNaN(d.getTime())) throw new BadRequestException('Invalid ' + name); return d; }
  private async atomic<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    try { return await this.prisma.$transaction(fn, { isolationLevel: 'Serializable', timeout: 30000 }); }
    catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Code or room number already exists in this property. No changes were saved.');
      if (e.code === 'P2034') throw new ConflictException('Another user changed this inventory. Refresh and try again.');
      if (e.code === 'P2003') throw new BadRequestException('A referenced record is not valid');
      throw e;
    }
  }
  private async audit(tx: any, user: any, entity: string, record: any, before?: any, event = 'UPDATE') {
    await tx.auditLog.create({ data: { entity: 'ROOM.' + entity, recordId: record.id, action: before ? 'UPDATE' : 'CREATE',
      performedById: user.id, branchId: record.branchId, oldValue: before ? clean(before) : undefined,
      newValue: clean({ ...record, event }), } });
  }
  private async bump(tx: any, id: string, version: number, data: any = {}) {
    const changed = await tx.room.updateMany({ where: { id, version }, data: { ...data, version: { increment: 1 } } });
    if (!changed.count) throw new ConflictException('Room changed. Refresh before saving.');
  }
  private sellability(room: any) {
    if (!room.isActive) return 'INACTIVE';
    // Expected end is an estimate. Holds remain blocking until explicitly released.
    const active = room.holds.filter((h: any) => !h.releasedAt && new Date(h.startAt) <= new Date());
    return active.some((h: any) => h.kind === 'OOO') ? 'OUT_OF_ORDER' : active.length ? 'OUT_OF_SERVICE' : 'SELLABLE';
  }
  private decorate(room: any) { return { ...room, sellabilityStatus: this.sellability(room), capacity: {
    maxOccupancy: room.roomType.maxOccupancy, maxAdults: room.roomType.maxAdults, maxChildren: room.roomType.maxChildren,
    extraBedAllowed: room.roomType.extraBedAllowed, maxExtraBeds: room.roomType.maxExtraBeds,
  } }; }
  async properties(user: any) {
    const properties = await this.prisma.property.findMany({ include: { branches: true }, orderBy: { name: 'asc' } });
    return properties.filter((p: any) => Object.entries(ROOM_PERMISSIONS).some(([resource, actions]) => actions.some(action =>
      this.access.can(user, `ROOM.${resource}.${action}`, p) || p.branches.some((b: any) => this.access.can(user, `ROOM.${resource}.${action}`, p, b.id)))))
      .map((p: any) => ({ id: p.id, name: p.name, status: p.status }));
  }
  async options(user: any, propertyId: string) {
    const property = await this.access.context(user, propertyId);
    const codes = Object.entries(ROOM_PERMISSIONS).flatMap(([r, actions]) => actions.map(a => `ROOM.${r}.${a}`));
    const permissions = codes.filter(c => this.access.can(user, c, property));
    const branches = property.branches.map((b: any) => ({ ...b, permissions: codes.filter(c => this.access.can(user, c, property, b.id)) })).filter((b: any) => b.permissions.length);
    if (!permissions.length && !branches.length) this.access.require(user, 'ROOM.ROOM.VIEW', property);
    const branchIds = branches.map((b: any) => b.id);
    const [buildings, floors, roomTypes, bedTypes, amenities, features] = await Promise.all([
      this.prisma.building.findMany({ where: { propertyId, OR: [{ branchId: null }, { branchId: { in: branchIds } }] } }),
      this.prisma.floor.findMany({ where: { building: { propertyId, OR: [{ branchId: null }, { branchId: { in: branchIds } }] } } }),
      this.prisma.roomType.findMany({ where: { propertyId, OR: [{ branchId: null }, { branchId: { in: branchIds } }] }, include: { amenities: true } }),
      this.prisma.bedType.findMany({ where: { propertyId } }), this.prisma.amenity.findMany({ where: { propertyId } }), this.prisma.roomFeature.findMany({ where: { propertyId } }),
    ]);
    const propertyPermission = (code: string) => this.access.can(user, code, property)
      || branches.length > 0 && branches.every((b: any) => b.permissions.includes(code));
    return {
      property: { id: property.id, name: property.name }, permissions, branches, buildings, floors,
      roomTypes,
      bedTypes: propertyPermission('ROOM.BEDTYPE.VIEW') || permissions.includes('ROOM.ROOM.CREATE') ? bedTypes : [],
      amenities: propertyPermission('ROOM.AMENITY.VIEW') ? amenities : [],
      features: propertyPermission('ROOM.FEATURE.VIEW') ? features : [],
    };
  }
  async list(user: any, query: any, permission = 'ROOM.ROOM.VIEW') {
    const property = await this.access.context(user, query.propertyId, query.branchId);
    const branchIds = property.branches.filter((b: any) => this.access.can(user, permission, property, b.id)).map((b: any) => b.id);
    if (query.branchId) this.access.require(user, permission, property, query.branchId);
    if (!branchIds.length) this.access.require(user, permission, property);
    const where: any = { propertyId: property.id, branchId: query.branchId || { in: branchIds } };
    for (const key of ['buildingId', 'floorId', 'roomTypeId', 'operationalStatus', 'smokingType']) if (query[key]) where[key] = query[key];
    if (query.operationalStatus) this.choice(query.operationalStatus, ROOM_STATUSES, 'status');
    if (query.search) where.OR = ['roomNumber', 'roomName'].map(k => ({ [k]: { contains: String(query.search).slice(0, 100), mode: 'insensitive' } }));
    if (query.isActive) where.isActive = query.isActive === 'true';
    if (query.isAccessible) where.isAccessible = query.isAccessible === 'true';
    if (query.featureId) where.features = { some: { id: query.featureId } };
    if (query.amenityId) where.roomType = { amenities: { some: { id: query.amenityId } } };
    const rows = await this.prisma.room.findMany({ where, include: roomInclude, orderBy: { roomNumber: 'asc' } });
    return rows.map((r: any) => this.decorate(r)).filter((r: any) => !query.sellabilityStatus || r.sellabilityStatus === query.sellabilityStatus);
  }
  async detail(user: any, id: string, permission = 'ROOM.ROOM.VIEW', tx: any = this.prisma) {
    const room = await tx.room.findUnique({ where: { id }, include: { ...roomInclude, property: true } });
    if (!room) throw new NotFoundException('Room not found');
    this.access.require(user, permission, room.property, room.branchId); return this.decorate(room);
  }
  async history(user: any, id: string) {
    await this.detail(user, id, 'ROOM.STATUS.VIEW');
    return this.prisma.roomStatusHistory.findMany({ where: { roomId: id }, orderBy: { changedAt: 'desc' }, take: 500 });
  }
  async catalog(user: any, resource: string, propertyId: string) {
    const config = catalogs[resource]; if (!config) throw new NotFoundException();
    const p = await this.access.context(user, propertyId);
    this.access.require(user, `ROOM.${config.resource}.VIEW`, p);
    return (this.prisma as any)[config.model].findMany({ where: { propertyId }, include: resource === 'room-types' ? { amenities: true, bedType: true } : undefined, orderBy: { code: 'asc' } });
  }
  private async references(tx: any, model: string, ids: any, propertyId: string, existingIds: string[] = []) {
    if (!Array.isArray(ids) || ids.length > 100 || ids.some(id => typeof id !== 'string')) throw new BadRequestException('Invalid selections');
    const unique = [...new Set(ids)];
    if (await tx[model].count({ where: { id: { in: unique }, propertyId, OR: [{ isActive: true }, { id: { in: existingIds } }] } }) !== unique.length) throw new BadRequestException('New selections must be active and belong to this property');
    return unique.map(id => ({ id }));
  }
  async saveCatalog(user: any, resource: string, body: any, id?: string) {
    const config = catalogs[resource]; if (!config) throw new NotFoundException();
    return this.atomic(async tx => {
      const old = id ? await tx[config.model].findUnique({ where: { id }, include: resource === 'room-types' ? { amenities: true } : undefined }) : null;
      if (id && !old) throw new NotFoundException();
      const propertyId = old?.propertyId || body.propertyId;
      const p = await this.access.context(user, propertyId);
      const action = resource === 'room-types' ? (id ? 'UPDATE' : 'CREATE') : 'MANAGE';
      this.access.require(user, `ROOM.${config.resource}.${action}`, p);
      const b = { ...old, ...body }; const data: any = { propertyId,
        code: this.text(b.code, 'Code', true)!.toUpperCase(), name: this.text(b.name, 'Name', true),
        description: this.text(b.description, 'Description'), isActive: this.flag(b.isActive ?? true),
      };
      if (old && old.isActive !== data.isActive && resource === 'room-types') this.access.require(user, `ROOM.TYPE.${data.isActive ? 'ACTIVATE' : 'DEACTIVATE'}`, p);
      if (resource === 'bed-types') data.capacity = this.number(b.capacity ?? 1, 'bed capacity', 1);
      if (resource === 'amenities') data.category = this.text(b.category || 'Other', 'Category', true);
      if (resource === 'room-types') {
        Object.assign(data, { branchId: b.branchId || null, bedTypeId: b.bedTypeId || null,
          maxOccupancy: this.number(b.maxOccupancy, 'maximum occupancy', 1), maxAdults: this.number(b.maxAdults, 'maximum adults', 1),
          maxChildren: this.number(b.maxChildren, 'maximum children'), baseAdults: this.number(b.baseAdults ?? 1, 'base adults'), baseChildren: this.number(b.baseChildren ?? 0, 'base children'),
          numberOfBeds: this.number(b.numberOfBeds ?? 1, 'number of beds', 1), extraBedAllowed: this.flag(b.extraBedAllowed ?? false),
          maxExtraBeds: this.number(b.maxExtraBeds ?? 0, 'extra beds'), displayOrder: this.number(b.displayOrder ?? 0, 'display order'),
          smokingPolicy: this.choice(b.smokingPolicy ?? 'NON_SMOKING', smoking, 'smoking policy'), roomSizeUnit: this.choice(b.roomSizeUnit ?? 'SQM', ['SQM', 'SQFT'], 'size unit'),
        });
        if (data.maxAdults > data.maxOccupancy || data.maxChildren > data.maxOccupancy || data.baseAdults > data.maxAdults || data.baseChildren > data.maxChildren || data.baseAdults + data.baseChildren > data.maxOccupancy || (!data.extraBedAllowed && data.maxExtraBeds > 0)) throw new BadRequestException('Capacity limits are inconsistent');
        if (data.branchId && !p.branches.some((v: any) => v.id === data.branchId && v.status === 'ACTIVE')) throw new BadRequestException('Select an active branch in this property');
        if (data.branchId && old && await tx.room.count({ where: { roomTypeId: id, branchId: { not: data.branchId } } })) throw new BadRequestException('This room type is used by rooms in other branches');
        if (data.bedTypeId && !(await tx.bedType.findFirst({ where: { id: data.bedTypeId, propertyId, ...(data.bedTypeId === old?.bedTypeId ? {} : { isActive: true }) } }))) throw new BadRequestException('Select an active bed type in this property');
        if (b.roomSize != null) { if (typeof b.roomSize !== 'number' || b.roomSize <= 0 || !Number.isFinite(b.roomSize)) throw new BadRequestException('Invalid room size'); data.roomSize = b.roomSize; }
        data.amenities = { set: await this.references(tx, 'amenity', body.amenityIds ?? old?.amenities?.map((a: any) => a.id) ?? [], propertyId, old?.amenities?.map((a: any) => a.id) ?? []) };
        if (!id) data.amenities = { connect: data.amenities.set };
      }
      if (id) {
        const { amenities, ...scalar } = data;
        const changed = await tx[config.model].updateMany({ where: { id, version: this.version(body) }, data: { ...scalar, version: { increment: 1 } } });
        if (!changed.count) throw new ConflictException('Record changed. Refresh before saving.');
        if (amenities) await tx[config.model].update({ where: { id }, data: { amenities } });
      }
      const record = id ? await tx[config.model].findUnique({ where: { id }, include: resource === 'room-types' ? { amenities: true } : undefined }) : await tx[config.model].create({ data });
      await this.audit(tx, user, resource, record, old); return record;
    });
  }
  private async roomData(tx: any, user: any, body: any, old?: any) {
    const propertyId = old?.propertyId || body.propertyId; const p = await this.access.context(user, propertyId);
    const branchId = old?.branchId || body.branchId;
    this.access.require(user, old ? 'ROOM.ROOM.UPDATE' : 'ROOM.ROOM.CREATE', p, branchId);
    if (old && ((body.propertyId && body.propertyId !== old.propertyId) || (body.branchId && body.branchId !== old.branchId))) throw new BadRequestException('Property and branch cannot be moved; deactivate the room instead');
    const b = { ...old, ...body };
    for (const key of ['buildingId', 'floorId', 'roomTypeId']) this.text(b[key], key, true);
    this.text(branchId, 'Branch', true);
    const [branch, building, floor, type] = await Promise.all([
      tx.branch.findFirst({ where: { id: branchId, propertyId, status: 'ACTIVE' } }),
      tx.building.findFirst({ where: { id: b.buildingId, propertyId, isActive: true } }),
      tx.floor.findFirst({ where: { id: b.floorId, buildingId: b.buildingId, isActive: true } }),
      tx.roomType.findFirst({ where: { id: b.roomTypeId, propertyId } }),
    ]);
    if (!branch || !building || !floor || (building.branchId && building.branchId !== branchId)) throw new BadRequestException('Select a matching active property, branch, building and floor');
    if (['INACTIVE', 'TEMPORARILY_CLOSED'].includes(p.status)) throw new BadRequestException('Property is unavailable');
    if (!type || (!type.isActive && (!old || old.roomTypeId !== type.id)) || (type.branchId && type.branchId !== branchId)) throw new BadRequestException('Select an active room type in this property and branch');
    if (old && (b.roomNumber !== old.roomNumber || b.roomTypeId !== old.roomTypeId)) this.access.require(user, 'ROOM.STATUS.OVERRIDE', p, branchId);
    const data: any = { propertyId, branchId, buildingId: building.id, floorId: floor.id, roomTypeId: type.id,
      roomNumber: this.text(b.roomNumber, 'Room number', true)!.toUpperCase(), smokingType: this.choice(b.smokingType ?? type.smokingPolicy, smoking, 'smoking type'),
      isAccessible: this.flag(b.isAccessible ?? false),
    };
    for (const key of ['roomName', 'internalCode', 'phoneExtension', 'viewType', 'housekeepingZone', 'maintenanceZone']) data[key] = this.text(b[key], key);
    if (b.roomSize != null) { if (typeof b.roomSize !== 'number' || b.roomSize <= 0 || !Number.isFinite(b.roomSize)) throw new BadRequestException('Invalid size'); data.roomSize = b.roomSize; }
    const features = await this.references(tx, 'roomFeature', body.featureIds ?? old?.features?.map((f: any) => f.id) ?? [], propertyId, old?.features?.map((f: any) => f.id) ?? []);
    data.features = old ? { set: features } : { connect: features };
    return data;
  }
  async saveRoom(user: any, body: any, id?: string) {
    return this.atomic(async tx => {
      const old = id ? await this.detail(user, id, 'ROOM.ROOM.UPDATE', tx) : null;
      const data = await this.roomData(tx, user, body, old);
      if (old) { const { features, ...scalar } = data; await this.bump(tx, id!, this.version(body), scalar); await tx.room.update({ where: { id }, data: { features } }); }
      const room = old ? await tx.room.findUnique({ where: { id }, include: roomInclude }) : await tx.room.create({ data, include: roomInclude });
      await this.audit(tx, user, 'ROOM', room, old); return this.decorate(room);
    });
  }
  async bulk(user: any, body: any) {
    const start = this.number(body.start, 'start room number', 1); const end = this.number(body.end, 'end room number', 1);
    if (end < start || end - start >= 200) throw new BadRequestException('Choose a range of 1 to 200 rooms');
    const prefix = this.text(body.prefix, 'Prefix') || ''; const padding = this.number(body.padding ?? 0, 'padding');
    if (padding > 8 || prefix.length > 20) throw new BadRequestException('Prefix or padding is too long');
    return this.atomic(async tx => {
      const numbers = Array.from({ length: end - start + 1 }, (_, i) => (prefix + String(start + i).padStart(padding, '0')).toUpperCase());
      const data = await this.roomData(tx, user, { ...body, roomNumber: numbers[0] });
      const duplicates = await tx.room.findMany({ where: { propertyId: data.propertyId, roomNumber: { in: numbers } }, select: { roomNumber: true } });
      if (duplicates.length) throw new ConflictException('No rooms created. Existing rooms: ' + duplicates.map((d: any) => d.roomNumber).join(', '));
      for (const roomNumber of numbers) { const r = await tx.room.create({ data: { ...data, roomNumber } }); await this.audit(tx, user, 'ROOM', r); }
      return { created: numbers.length, roomNumbers: numbers };
    });
  }
  async activate(user: any, id: string, body: any, active: boolean) {
    return this.atomic(async tx => {
      const room = await this.detail(user, id, `ROOM.ROOM.${active ? 'ACTIVATE' : 'DEACTIVATE'}`, tx);
      if (room.operationalStatus.startsWith('OCCUPIED')) throw new ConflictException('Occupied rooms cannot be activated or deactivated here');
      if (active && !room.roomType.isActive) throw new BadRequestException('Activate the room type first');
      await this.bump(tx, id, this.version(body), { isActive: active });
      await this.audit(tx, user, 'ROOM', { id, branchId: room.branchId, isActive: active }, room, active ? 'ACTIVATE' : 'DEACTIVATE'); return { success: true };
    });
  }
  async status(user: any, id: string, body: any) {
    return this.atomic(async tx => {
      const room = await this.detail(user, id, 'ROOM.STATUS.UPDATE', tx);
      const next = this.choice(body.status, ROOM_STATUSES, 'status'); const reason = this.text(body.reason, 'Reason', true);
      if (!room.isActive) throw new BadRequestException('Activate the room before changing status');
      if (next === room.operationalStatus) throw new BadRequestException('Choose a different status');
      if (!ROOM_TRANSITIONS[room.operationalStatus]?.includes(next)) {
        if (body.override !== true) throw new BadRequestException('This transition requires an explicit administrative override');
        this.access.require(user, 'ROOM.STATUS.OVERRIDE', room.property, room.branchId);
      }
      if (next.startsWith('OCCUPIED') && room.sellabilityStatus !== 'SELLABLE') throw new ConflictException('A held room cannot be occupied');
      await this.bump(tx, id, this.version(body), { operationalStatus: next });
      await tx.roomStatusHistory.create({ data: { roomId: id, previousStatus: room.operationalStatus, newStatus: next, reason, changedBy: user.id } });
      await this.audit(tx, user, 'STATUS', { id, branchId: room.branchId, operationalStatus: next, reason }, room, body.override ? 'STATUS_OVERRIDE' : 'STATUS_CHANGE');
      return { success: true };
    });
  }
  async holds(user: any, query: any, kind: string) {
    const rooms = await this.list(user, query, `ROOM.${kind}.VIEW`);
    return this.prisma.roomHold.findMany({ where: { kind: kind as any, roomId: { in: rooms.map((r: any) => r.id) } }, include: { room: { select: { roomNumber: true, branchId: true, version: true } } }, orderBy: { createdAt: 'desc' } });
  }
  async createHold(user: any, kind: string, body: any) {
    return this.atomic(async tx => {
      const room = await this.detail(user, body.roomId, `ROOM.${kind}.CREATE`, tx);
      if (!room.isActive || room.operationalStatus.startsWith('OCCUPIED')) throw new ConflictException('Room must be active and unoccupied before placing a hold');
      const startAt = this.date(body.startAt, 'start time'); const expectedEndAt = body.expectedEndAt ? this.date(body.expectedEndAt, 'expected end time') : null;
      if (expectedEndAt && expectedEndAt <= startAt) throw new BadRequestException('Expected end must be after start');
      // Explicit release is required; prevent any second unreleased hold, including future ones.
      if (room.holds.length) throw new ConflictException('Release the existing hold before scheduling another');
      await this.bump(tx, room.id, this.version(body));
      const hold = await tx.roomHold.create({ data: { roomId: room.id, kind, startAt, expectedEndAt, reason: this.text(body.reason, 'Reason', true), reasonCode: this.text(body.reasonCode, 'Reason code'), description: this.text(body.description, 'Description'), maintenanceReference: this.text(body.maintenanceReference, 'Maintenance reference'), createdBy: user.id } });
      await this.audit(tx, user, kind, { ...hold, branchId: room.branchId }, undefined, 'HOLD_CREATED'); return hold;
    });
  }
  async updateHold(user: any, id: string, body: any) {
    return this.atomic(async tx => {
      const hold = await tx.roomHold.findUnique({ where: { id } });
      if (!hold || hold.kind !== 'OOO') throw new NotFoundException();
      const room = await this.detail(user, hold.roomId, 'ROOM.OOO.UPDATE', tx);
      if (hold.releasedAt) throw new ConflictException('Released holds cannot be changed');
      const expectedEndAt = body.expectedEndAt ? this.date(body.expectedEndAt, 'expected end') : null;
      if (expectedEndAt && expectedEndAt <= hold.startAt) throw new BadRequestException('Expected end must be after start');
      await this.bump(tx, room.id, this.version(body));
      const updated = await tx.roomHold.update({ where: { id }, data: { expectedEndAt, reason: this.text(body.reason, 'Reason', true), description: this.text(body.description, 'Description'), maintenanceReference: this.text(body.maintenanceReference, 'Maintenance reference'), version: { increment: 1 } } });
      await this.audit(tx, user, 'OOO', { ...updated, branchId: room.branchId }, hold, 'HOLD_UPDATED'); return updated;
    });
  }

  async eligibility(user: any, id: string, query: any) {
    const room = await this.detail(user, id);
    const adults = this.number(Number(query.adults), 'adults', 1);
    const children = this.number(Number(query.children ?? 0), 'children');
    const from = this.date(query.from, 'arrival time'); const to = this.date(query.to, 'departure time');
    if (to <= from) throw new BadRequestException('Departure must follow arrival');
    const reasons: string[] = [];
    if (!room.isActive || !room.roomType.isActive || room.property.status !== 'ACTIVE' || room.branch.status !== 'ACTIVE' || !room.building.isActive || !room.floor.isActive) reasons.push('INACTIVE_INVENTORY');
    if (adults > room.capacity.maxAdults || children > room.capacity.maxChildren || adults + children > room.capacity.maxOccupancy) reasons.push('CAPACITY_EXCEEDED');
    const conflictingHolds = await this.prisma.roomHold.findMany({ where: { roomId: id, startAt: { lt: to }, OR: [{ releasedAt: null }, { releasedAt: { gt: from } }] } });
    if (conflictingHolds.length) reasons.push('ROOM_HOLD');
    return { eligibleInventory: !reasons.length, reasons, capacity: room.capacity, operationalStatus: room.operationalStatus, reservationAvailabilityChecked: false };
  }
  async releaseHold(user: any, id: string, kind: string, body: any) {
    return this.atomic(async tx => {
      const hold = await tx.roomHold.findUnique({ where: { id } }); if (!hold || hold.kind !== kind) throw new NotFoundException();
      const room = await this.detail(user, hold.roomId, `ROOM.${kind}.RELEASE`, tx);
      if (hold.releasedAt) throw new ConflictException('Hold already released');
      if (room.operationalStatus.startsWith('OCCUPIED')) throw new ConflictException('Occupied room needs front desk review');
      const releaseNotes = this.text(body.releaseNotes, 'Release notes', true);
      await this.bump(tx, room.id, this.version(body), { operationalStatus: 'VACANT_DIRTY' });
      const result = await tx.roomHold.update({ where: { id }, data: { releasedAt: new Date(), releasedBy: user.id, releaseNotes, version: { increment: 1 } } });
      await tx.roomStatusHistory.create({ data: { roomId: room.id, previousStatus: room.operationalStatus, newStatus: 'VACANT_DIRTY', reason: kind + ' released: ' + releaseNotes, changedBy: user.id } });
      await this.audit(tx, user, kind, { ...result, branchId: room.branchId }, hold, 'HOLD_RELEASED'); return result;
    });
  }
  async notes(user: any, id: string, body?: any) {
    await this.detail(user, id, body ? 'ROOM.NOTE.CREATE' : 'ROOM.NOTE.VIEW');
    if (!body) return this.prisma.roomNote.findMany({ where: { roomId: id }, orderBy: { createdAt: 'desc' } });
    return this.atomic(async tx => { const note = await tx.roomNote.create({ data: { roomId: id, text: this.text(body.text, 'Note', true), noteType: this.text(body.noteType || 'GENERAL', 'Note type', true), createdBy: user.id } }); await this.audit(tx, user, 'NOTE', note); return note; });
  }
}
