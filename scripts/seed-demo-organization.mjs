// Creates an idempotent, clearly labeled multi-property HotelHex demo dataset.
// Run with: node scripts/seed-demo-organization.mjs
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
const db = new PrismaClient();
const demoUsername = 'demo.admin';
const demoPassword = process.env.HOTELHEX_DEMO_PASSWORD || 'HotelHex-Demo-2026!';
const now = new Date();
const demoStart = new Date(now.getTime() - 60 * 60 * 1000);
const overnightEnd = new Date(demoStart.getTime() + 24 * 60 * 60 * 1000);
const dueOut = new Date(now.getTime() - 30 * 60 * 1000);
const upcomingStart = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
const upcomingEnd = new Date(upcomingStart.getTime() + 2 * 24 * 60 * 60 * 1000);
const yyyy = now.getUTCFullYear();
const locations = [
  { code: 'YGN', name: 'Yangon', propertyName: 'HotelHex Demo Yangon', city: 'Yangon', timeZone: 'Asia/Yangon' },
  { code: 'BGN', name: 'Bagan', propertyName: 'HotelHex Demo Bagan', city: 'Bagan', timeZone: 'Asia/Yangon' },
  { code: 'INL', name: 'Inle Lake', propertyName: 'HotelHex Demo Inle Lake', city: 'Nyaungshwe', timeZone: 'Asia/Yangon' },
];

async function main() {
  const user = await db.user.findFirst({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'asc' }, select: { id: true } });
  const actor = user?.id || 'HOTELHEX_DEMO_SEED';
  const currency = await db.currency.upsert({ where: { code: 'MMK' }, update: { name: 'Myanmar Kyat', symbol: 'Ks', isActive: true }, create: { code: 'MMK', name: 'Myanmar Kyat', symbol: 'Ks', decimalPlaces: 0, isActive: true } });
  const group = await db.businessGroup.upsert({ where: { code: 'HH-DEMO-MULTI' }, update: { name: 'HotelHex Demo Collection', country: 'Myanmar', description: 'Clearly labeled sample organization and operational records for product demonstrations.' }, create: { code: 'HH-DEMO-MULTI', name: 'HotelHex Demo Collection', country: 'Myanmar', email: 'demo@hotelhex.example', description: 'Clearly labeled sample organization and operational records for product demonstrations.' } });
  const company = await db.company.upsert({ where: { groupId_code: { groupId: group.id, code: 'HH-DEMO-HOSP' } }, update: { legalName: 'HotelHex Demo Hospitality Company', tradingName: 'HotelHex Demo Hotels', country: 'Myanmar', defaultCurrencyId: currency.id, defaultLanguage: 'en', timeZone: 'Asia/Yangon', status: 'ACTIVE' }, create: { groupId: group.id, code: 'HH-DEMO-HOSP', legalName: 'HotelHex Demo Hospitality Company', tradingName: 'HotelHex Demo Hotels', businessType: 'Hospitality', country: 'Myanmar', defaultCurrencyId: currency.id, defaultLanguage: 'en', timeZone: 'Asia/Yangon', status: 'ACTIVE' } });
  const summary = { group: group.name, company: company.legalName, properties: [] };
  let defaultContext;

  for (const [index, location] of locations.entries()) {
    const propertyCode = `DEMO-${location.code}`;
    const property = await db.property.upsert({ where: { companyId_code: { companyId: company.id, code: propertyCode } }, update: { name: location.propertyName, type: location.code === 'INL' ? 'RESORT' : 'HOTEL', starRating: 4, numberOfRooms: 6, timeZone: location.timeZone, defaultCurrencyId: currency.id, checkInTime: '14:00', checkOutTime: '12:00', status: 'ACTIVE', phone: `+95 9 7000000${index + 1}`, email: `reservations.${location.code.toLowerCase()}@hotelhex.example` }, create: { companyId: company.id, code: propertyCode, name: location.propertyName, type: location.code === 'INL' ? 'RESORT' : 'HOTEL', starRating: 4, openingDate: new Date('2024-01-01T00:00:00Z'), numberOfRooms: 6, timeZone: location.timeZone, defaultCurrencyId: currency.id, checkInTime: '14:00', checkOutTime: '12:00', status: 'ACTIVE', phone: `+95 9 7000000${index + 1}`, email: `reservations.${location.code.toLowerCase()}@hotelhex.example` } });
    const branch = await db.branch.upsert({ where: { propertyId_code: { propertyId: property.id, code: 'MAIN' } }, update: { name: `${location.name} Main Hotel`, type: location.code === 'INL' ? 'RESORT' : 'HOTEL', city: location.city, country: 'Myanmar', currencyCode: 'MMK', isMain: true, status: 'ACTIVE' }, create: { propertyId: property.id, code: 'MAIN', name: `${location.name} Main Hotel`, type: location.code === 'INL' ? 'RESORT' : 'HOTEL', city: location.city, country: 'Myanmar', currencyCode: 'MMK', isMain: true, status: 'ACTIVE' } });
    if (!defaultContext) defaultContext = { propertyId: property.id, branchId: branch.id };
    await db.businessDate.upsert({ where: { propertyId_branchId: { propertyId: property.id, branchId: branch.id } }, update: {}, create: { propertyId: property.id, branchId: branch.id, date: new Date(Date.UTC(yyyy, now.getUTCMonth(), now.getUTCDate())) } });
    const building = await db.building.upsert({ where: { propertyId_code: { propertyId: property.id, code: 'DEMO-MAIN' } }, update: { name: `${location.name} Demo Building`, branchId: branch.id, isActive: true }, create: { propertyId: property.id, branchId: branch.id, code: 'DEMO-MAIN', name: `${location.name} Demo Building`, description: 'Demo inventory building.' } });
    const floor1 = await db.floor.upsert({ where: { buildingId_code: { buildingId: building.id, code: 'G' } }, update: { name: 'Garden Floor', floorNumber: 1, isActive: true }, create: { buildingId: building.id, code: 'G', name: 'Garden Floor', floorNumber: 1 } });
    const floor2 = await db.floor.upsert({ where: { buildingId_code: { buildingId: building.id, code: 'U' } }, update: { name: 'Upper Floor', floorNumber: 2, isActive: true }, create: { buildingId: building.id, code: 'U', name: 'Upper Floor', floorNumber: 2 } });

    const standard = await db.roomType.upsert({ where: { propertyId_code: { propertyId: property.id, code: 'DEMO-STD' } }, update: { branchId: branch.id, name: 'Demo Standard King', description: 'Sample standard guest room.', numberOfBeds: 1, baseAdults: 1, baseChildren: 0, maxAdults: 2, maxChildren: 1, maxOccupancy: 3, isActive: true }, create: { propertyId: property.id, branchId: branch.id, code: 'DEMO-STD', name: 'Demo Standard King', description: 'Sample standard guest room.', numberOfBeds: 1, baseAdults: 1, baseChildren: 0, maxAdults: 2, maxChildren: 1, maxOccupancy: 3, isActive: true } });
    const suite = await db.roomType.upsert({ where: { propertyId_code: { propertyId: property.id, code: 'DEMO-SUITE' } }, update: { branchId: branch.id, name: 'Demo Family Suite', description: 'Sample family suite.', numberOfBeds: 2, baseAdults: 2, baseChildren: 0, maxAdults: 3, maxChildren: 2, maxOccupancy: 5, extraBedAllowed: true, maxExtraBeds: 1, isActive: true }, create: { propertyId: property.id, branchId: branch.id, code: 'DEMO-SUITE', name: 'Demo Family Suite', description: 'Sample family suite.', numberOfBeds: 2, baseAdults: 2, baseChildren: 0, maxAdults: 3, maxChildren: 2, maxOccupancy: 5, extraBedAllowed: true, maxExtraBeds: 1, isActive: true } });
    const rooms = [];
    for (const [n, roomType, floor, status] of [
      ['101', standard, floor1, 'OCCUPIED_CLEAN'], ['102', standard, floor1, 'VACANT_CLEAN'], ['103', standard, floor1, 'VACANT_DIRTY'],
      ['201', suite, floor2, 'VACANT_CLEAN'], ['202', suite, floor2, 'INSPECTED'], ['203', suite, floor2, 'VACANT_CLEAN'],
    ]) {
      rooms.push(await db.room.upsert({ where: { propertyId_roomNumber: { propertyId: property.id, roomNumber: n } }, update: { branchId: branch.id, buildingId: building.id, floorId: floor.id, roomTypeId: roomType.id, operationalStatus: status, isActive: true }, create: { propertyId: property.id, branchId: branch.id, buildingId: building.id, floorId: floor.id, roomTypeId: roomType.id, roomNumber: n, operationalStatus: status, isActive: true } }));
    }
    const plans = {};
    for (const planSpec of [
      { code: 'DEMO-BAR', name: 'Demo Best Available Rate', stayType: 'OVERNIGHT' },
      { code: 'DEMO-HOURLY', name: 'Demo Hourly Stay', stayType: 'HOURLY' },
    ]) {
      const plan = await db.ratePlan.upsert({ where: { propertyId_code: { propertyId: property.id, code: planSpec.code } }, update: { branchId: branch.id, name: planSpec.name, stayType: planSpec.stayType, currencyCode: 'MMK', rateType: 'PUBLIC', mealPlan: 'RO', refundability: 'REFUNDABLE', cancellationPolicy: 'Demo rate. Free cancellation until 24 hours before arrival.', depositPolicy: 'No deposit required for demo reservations.', isPublic: true, status: 'ACTIVE' }, create: { propertyId: property.id, branchId: branch.id, code: planSpec.code, name: planSpec.name, stayType: planSpec.stayType, currencyCode: 'MMK', rateType: 'PUBLIC', mealPlan: 'RO', refundability: 'REFUNDABLE', cancellationPolicy: 'Demo rate. Free cancellation until 24 hours before arrival.', depositPolicy: 'No deposit required for demo reservations.', isPublic: true, status: 'ACTIVE' } });
      plans[planSpec.code] = plan;
      for (const [roomType, amount] of [[standard, planSpec.stayType === 'HOURLY' ? 30000 : 85000], [suite, planSpec.stayType === 'HOURLY' ? 50000 : 145000]]) {
        await db.ratePlanRoomType.upsert({ where: { ratePlanId_roomTypeId: { ratePlanId: plan.id, roomTypeId: roomType.id } }, update: { basePrice: amount, baseOccupancy: roomType.maxOccupancy, baseAdults: roomType.baseAdults, baseChildren: roomType.baseChildren, extraAdultCharge: 15000, extraChildCharge: 8000, extraBedCharge: 20000, isActive: true }, create: { ratePlanId: plan.id, roomTypeId: roomType.id, basePrice: amount, baseOccupancy: roomType.maxOccupancy, baseAdults: roomType.baseAdults, baseChildren: roomType.baseChildren, extraAdultCharge: 15000, extraChildCharge: 8000, extraBedCharge: 20000, isActive: true } });
        if (planSpec.stayType === 'HOURLY') await db.hourlyRateTier.upsert({ where: { ratePlanId_roomTypeId_durationMinutes: { ratePlanId: plan.id, roomTypeId: roomType.id, durationMinutes: 180 } }, update: { price: amount, extensionCharge: 10000, isActive: true }, create: { ratePlanId: plan.id, roomTypeId: roomType.id, durationMinutes: 180, price: amount, extensionCharge: 10000, isActive: true } });
      }
    }
    await db.propertyStayPolicy.upsert({ where: { propertyId: property.id }, update: { allowOvernight: true, allowHourly: true, allowDayUse: true, defaultStayType: 'OVERNIGHT' }, create: { propertyId: property.id, allowOvernight: true, allowHourly: true, allowDayUse: true, defaultStayType: 'OVERNIGHT' } });
    for (const [code, name] of [['FD', 'Front Desk'], ['HK', 'Housekeeping'], ['RSV', 'Reservations']]) await db.department.upsert({ where: { branchId_code: { branchId: branch.id, code } }, update: { companyId: company.id, propertyId: property.id, name, status: 'ACTIVE' }, create: { companyId: company.id, propertyId: property.id, branchId: branch.id, code, name, status: 'ACTIVE' } });

    const guestSpecs = [
      { code: 'ARRIVAL', name: `Demo Guest ${location.name} Arrival`, email: `arrival.${location.code.toLowerCase()}@hotelhex.example` },
      { code: 'INHOUSE', name: `Demo Guest ${location.name} Inhouse`, email: `inhouse.${location.code.toLowerCase()}@hotelhex.example` },
      { code: 'UPCOMING', name: `Demo Guest ${location.name} Upcoming`, email: `upcoming.${location.code.toLowerCase()}@hotelhex.example` },
    ];
    const guests = {};
    for (const spec of guestSpecs) {
      const guestNo = `DEMO-${location.code}-${spec.code}`;
      const guest = await db.guest.upsert({ where: { tenantId_guestNumber: { tenantId: group.id, guestNumber: guestNo } }, update: { fullName: spec.name, normalizedName: spec.name.toLowerCase(), firstName: `Demo ${location.name}`, lastName: spec.code, nationality: 'Myanmar', status: 'ACTIVE', updatedBy: actor }, create: { tenantId: group.id, guestNumber: guestNo, fullName: spec.name, normalizedName: spec.name.toLowerCase(), firstName: `Demo ${location.name}`, lastName: spec.code, nationality: 'Myanmar', preferredLanguage: 'en', guestType: 'Individual', status: 'ACTIVE', createdPropertyId: property.id, createdBy: actor, updatedBy: actor } });
      if (!(await db.guestContact.count({ where: { guestId: guest.id } }))) await db.guestContact.createMany({ data: [{ guestId: guest.id, type: 'Email', value: spec.email, normalizedValue: spec.email.toLowerCase(), isPrimary: true }, { guestId: guest.id, type: 'Phone', value: `+95 9 79900${index + 1}0${guestSpecIndex(spec.code)}`, normalizedValue: `+95979900${index + 1}0${guestSpecIndex(spec.code)}`, isPrimary: false }] });
      guests[spec.code] = guest;
    }
    const vip = await db.guestVip.findUnique({ where: { guestId: guests.INHOUSE.id } });
    if (!vip) await db.guestVip.create({ data: { guestId: guests.INHOUSE.id, level: 'SILVER', reason: 'Demo loyalty profile', approvedBy: actor, isActive: true } });
    const demoDepartment = await db.department.findUnique({ where: { branchId_code: { branchId: branch.id, code: 'FD' } } });
    await db.costCenter.upsert({ where: { companyId_code: { companyId: company.id, code: `DEMO-${location.code}-FD` } }, update: { propertyId: property.id, branchId: branch.id, departmentId: demoDepartment.id, name: `${location.name} Demo Front Desk` }, create: { companyId: company.id, code: `DEMO-${location.code}-FD`, propertyId: property.id, branchId: branch.id, departmentId: demoDepartment.id, name: `${location.name} Demo Front Desk` } });

    const overnightPlan = plans['DEMO-BAR'];
    const makeReservation = async (suffix, guest, roomType, dates, status, room = null) => {
      const num = `DEMO-${location.code}-${suffix}`;
      const amount = roomType.code === 'DEMO-SUITE' ? 145000 : 85000;
      const rateSnapshot = { demoData: true, ratePlan: overnightPlan.name, currencyCode: 'MMK', nightlyRate: amount, note: 'Synthetic sample data; not a real guest or transaction.' };
      const reservation = await db.reservation.upsert({ where: { propertyId_reservationNumber: { propertyId: property.id, reservationNumber: num } }, update: { tenantId: group.id, companyId: company.id, branchId: branch.id, primaryGuestId: guest.id, guestNameSnapshot: guest.fullName, status, arrivalDateTime: dates.start, departureDateTime: dates.end, adults: 1, children: 0, infants: 0, roomTypeId: roomType.id, ratePlanId: overnightPlan.id, assignedRoomId: room?.id || null, subtotal: amount, total: amount, rateSnapshot, createdBy: actor, updatedBy: actor }, create: { tenantId: group.id, propertyId: property.id, companyId: company.id, branchId: branch.id, reservationNumber: num, primaryGuestId: guest.id, guestNameSnapshot: guest.fullName, contactEmailSnapshot: `guest.${location.code.toLowerCase()}@hotelhex.example`, reservationType: 'Individual', bookingSource: 'Direct', marketSegment: 'Demo', stayType: 'OVERNIGHT', status, arrivalDateTime: dates.start, departureDateTime: dates.end, adults: 1, children: 0, infants: 0, roomCount: 1, roomTypeId: roomType.id, ratePlanId: overnightPlan.id, assignedRoomId: room?.id || null, currencyCode: 'MMK', subtotal: amount, total: amount, rateSnapshot, cancellationPolicySnapshot: 'Demo rate. Free cancellation until 24 hours before arrival.', depositPolicySnapshot: 'No deposit required for demo reservations.', guaranteeStatus: 'NOT_REQUIRED', depositStatus: 'NOT_REQUIRED', confirmedAt: status === 'TENTATIVE' ? null : now, confirmedBy: status === 'TENTATIVE' ? null : actor, createdBy: actor, updatedBy: actor } });
      await db.reservationGuest.deleteMany({ where: { reservationId: reservation.id } });
      await db.reservationGuest.create({ data: { reservationId: reservation.id, guestId: guest.id, guestNameSnapshot: guest.fullName, guestType: 'ADULT', isPrimary: true } });
      await db.reservationRateDetail.deleteMany({ where: { reservationId: reservation.id } });
      await db.reservationRateDetail.create({ data: { reservationId: reservation.id, stayDate: new Date(Date.UTC(dates.start.getUTCFullYear(), dates.start.getUTCMonth(), dates.start.getUTCDate())), baseRate: amount, totalAmount: amount, rateSource: 'DEMO_SEED', snapshot: rateSnapshot } });
      return reservation;
    };
    const activeStayRes = await makeReservation('INHOUSE', guests.INHOUSE, standard, { start: demoStart, end: overnightEnd }, 'CHECKED_IN', rooms[0]);
    const arrivalRes = await makeReservation('ARRIVAL', guests.ARRIVAL, standard, { start: demoStart, end: overnightEnd }, 'CONFIRMED', rooms[1]);
    await makeReservation('UPCOMING', guests.UPCOMING, suite, { start: upcomingStart, end: upcomingEnd }, 'TENTATIVE');
    const stay = await db.frontDeskStay.upsert({ where: { reservationId: activeStayRes.id }, update: { status: 'IN_HOUSE', currentRoomId: rooms[0].id, plannedArrivalDateTime: demoStart, plannedDepartureDateTime: overnightEnd, registrationConfirmed: true, identityVerified: false, updatedBy: actor }, create: { tenantId: group.id, companyId: company.id, propertyId: property.id, branchId: branch.id, reservationId: activeStayRes.id, primaryGuestId: guests.INHOUSE.id, roomTypeId: standard.id, currentRoomId: rooms[0].id, stayNumber: `${property.code}-DEMO-INHOUSE`, stayType: 'OVERNIGHT', status: 'IN_HOUSE', plannedArrivalDateTime: demoStart, plannedDepartureDateTime: overnightEnd, actualCheckInDateTime: demoStart, adults: 1, children: 0, infants: 0, registrationConfirmed: true, identityVerified: false, createdBy: actor, updatedBy: actor } });
    await db.stayOccupant.deleteMany({ where: { stayId: stay.id } });
    await db.stayOccupant.create({ data: { stayId: stay.id, guestId: guests.INHOUSE.id, guestNameSnapshot: guests.INHOUSE.fullName, occupantType: 'ADULT', isPrimary: true, createdBy: actor } });
    await db.stayRoomHistory.deleteMany({ where: { stayId: stay.id } });
    await db.stayRoomHistory.create({ data: { stayId: stay.id, toRoomId: rooms[0].id, effectiveDateTime: demoStart, reason: 'Demo initial room assignment', changedBy: actor } });
    await db.stayStatusHistory.deleteMany({ where: { stayId: stay.id } });
    await db.stayStatusHistory.create({ data: { stayId: stay.id, previousStatus: null, newStatus: 'IN_HOUSE', reason: 'Demo check-in', changedBy: actor } });
    await db.guestRegistration.deleteMany({ where: { stayId: stay.id } });
    await db.guestRegistration.create({ data: { stayId: stay.id, guestId: guests.INHOUSE.id, nationalitySnapshot: 'Myanmar', termsAccepted: true, addressSnapshot: { city: location.city, country: 'Myanmar', demoData: true }, registeredBy: actor } });
    await db.stayNote.deleteMany({ where: { stayId: stay.id } });
    await db.stayNote.create({ data: { stayId: stay.id, noteType: 'GENERAL', noteText: 'DEMO DATA: Sample in-house stay for validating Front Desk screens.', visibilityScope: 'FRONT_DESK', createdBy: actor } });
    await db.stayKey.deleteMany({ where: { stayId: stay.id } });
    await db.stayKey.create({ data: { stayId: stay.id, roomId: rooms[0].id, keyIdentifier: `DEMO-${location.code}-KEY-01`, quantity: 1, issuedBy: actor } });
    await db.reservationRequest.upsert({ where: { id: `demo-request-${location.code}` }, update: { requestType: 'AMENITY', requestText: 'DEMO DATA: Extra towels requested.', status: 'REQUESTED', createdBy: actor }, create: { id: `demo-request-${location.code}`, reservationId: arrivalRes.id, requestType: 'AMENITY', requestText: 'DEMO DATA: Extra towels requested.', status: 'REQUESTED', createdBy: actor } });
    await db.room.update({ where: { id: rooms[0].id }, data: { operationalStatus: 'OCCUPIED_CLEAN' } });
    await db.room.update({ where: { id: rooms[1].id }, data: { operationalStatus: 'VACANT_CLEAN' } });
    await db.room.update({ where: { id: rooms[2].id }, data: { operationalStatus: 'VACANT_DIRTY' } });
    await db.room.update({ where: { id: rooms[3].id }, data: { operationalStatus: 'VACANT_CLEAN' } });
    await db.room.update({ where: { id: rooms[4].id }, data: { operationalStatus: 'INSPECTED' } });
    await db.room.update({ where: { id: rooms[5].id }, data: { operationalStatus: 'VACANT_CLEAN' } });
    summary.properties.push({ name: property.name, propertyId: property.id, branch: branch.name, rooms: rooms.length, roomTypes: 2, ratePlans: 2, guests: 3, reservations: 3, inHouseStays: 1 });
  }
  if (demoPassword.length < 12) throw new Error('HOTELHEX_DEMO_PASSWORD must be at least 12 characters.');
  const role = await db.role.upsert({ where: { code: 'HH-DEMO-OPERATIONS' }, update: { name: 'HotelHex Demo Operations', description: 'Demo-only operational access scoped to HotelHex Demo Hospitality Company.', roleType: 'CUSTOM', scope: 'COMPANY', status: 'ACTIVE', isSystem: false }, create: { code: 'HH-DEMO-OPERATIONS', name: 'HotelHex Demo Operations', description: 'Demo-only operational access scoped to HotelHex Demo Hospitality Company.', roleType: 'CUSTOM', scope: 'COMPANY', status: 'ACTIVE', isSystem: false } });
  const permissions = await db.permission.findMany({ where: { isActive: true, module: { notIn: ['SECURITY'] } }, select: { id: true, module: true } });
  await db.rolePermission.deleteMany({ where: { roleId: role.id } });
  await db.rolePermission.createMany({ data: permissions.map(permission => ({ roleId: role.id, permissionId: permission.id })), skipDuplicates: true });
  const salt = randomBytes(16).toString('hex');
  const passwordHash = `${salt}:${scryptSync(demoPassword, salt, 64).toString('hex')}`;
  const demoUser = await db.user.upsert({ where: { username: demoUsername }, update: { name: 'HotelHex Demo Admin', email: 'demo.admin@hotelhex.example', passwordHash, status: 'ACTIVE', mustChangePassword: false, defaultCompanyId: company.id, defaultPropertyId: defaultContext.propertyId, defaultBranchId: defaultContext.branchId }, create: { username: demoUsername, name: 'HotelHex Demo Admin', email: 'demo.admin@hotelhex.example', passwordHash, status: 'ACTIVE', mustChangePassword: false, defaultCompanyId: company.id, defaultPropertyId: defaultContext.propertyId, defaultBranchId: defaultContext.branchId, jobTitle: 'Demo Operations Administrator' } });
  const assignment = await db.userRoleAssignment.findFirst({ where: { userId: demoUser.id, roleId: role.id, companyId: company.id, propertyId: null, branchId: null } });
  if (assignment) await db.userRoleAssignment.update({ where: { id: assignment.id }, data: { isActive: true, effectiveFrom: null, effectiveTo: null } });
  else await db.userRoleAssignment.create({ data: { userId: demoUser.id, roleId: role.id, companyId: company.id } });
  summary.demoAccount = { username: demoUsername, scope: 'HotelHex Demo Hospitality Company', properties: locations.length, securityAdministration: false };
  console.log(JSON.stringify(summary, null, 2));
}
function guestSpecIndex(code) { return code === 'ARRIVAL' ? '1' : code === 'INHOUSE' ? '2' : '3'; }
main().catch(error => { console.error(error instanceof Error ? error.message : 'Demo organization seed failed.'); process.exitCode = 1; }).finally(async () => { await db.$disconnect(); });
