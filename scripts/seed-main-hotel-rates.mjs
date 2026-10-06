// Adds repeatable sample overnight rate plans for the Main Hotel branch.
// Run after Prisma has been generated: node scripts/seed-main-hotel-rates.mjs
// Set HOTELHEX_RATE_BRANCH_ID when the database contains multiple possible main branches.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const candidates = process.env.HOTELHEX_RATE_BRANCH_ID
    ? await prisma.branch.findMany({ where: { id: process.env.HOTELHEX_RATE_BRANCH_ID }, include: { property: true } })
    : await prisma.branch.findMany({
        where: { OR: [{ isMain: true }, { name: { contains: 'Main Hotel', mode: 'insensitive' } }] },
        include: { property: true },
      });

  if (candidates.length !== 1) {
    throw new Error(candidates.length
      ? 'More than one Main Hotel branch matched. Set HOTELHEX_RATE_BRANCH_ID to the intended branch ID.'
      : 'No Main Hotel branch matched. Create the branch first or set HOTELHEX_RATE_BRANCH_ID.');
  }

  const branch = candidates[0];
  const roomTypes = await prisma.roomType.findMany({
    where: { propertyId: branch.propertyId, isActive: true, OR: [{ branchId: null }, { branchId: branch.id }] },
    orderBy: { displayOrder: 'asc' },
  });
  if (!roomTypes.length) throw new Error(`No active room types exist for ${branch.name}. Create room types before seeding rates.`);

  let currency = await prisma.currency.findUnique({ where: { code: 'MMK' } });
  if (!currency) {
    currency = await prisma.currency.findFirst({ where: { isActive: true, symbol: 'MMK' }, orderBy: { code: 'asc' } });
  }
  if (!currency && branch.property.defaultCurrencyId) {
    currency = await prisma.currency.findUnique({ where: { id: branch.property.defaultCurrencyId } });
  }
  if (!currency) throw new Error('MMK and the property default currency are unavailable. Add an active currency first.');

  const samples = [
    { code: 'DEMO-MAIN-BAR', name: 'Demo ? Best Available Rate', rateType: 'PUBLIC', refundability: 'REFUNDABLE', factor: 1 },
    { code: 'DEMO-MAIN-ADVANCE', name: 'Demo ? Advance Purchase', rateType: 'PROMOTIONAL', refundability: 'NON_REFUNDABLE', factor: 0.9 },
  ];

  const result = await prisma.$transaction(async tx => {
    let ratesAdded = 0;
    for (const sample of samples) {
      const plan = await tx.ratePlan.upsert({
        where: { propertyId_code: { propertyId: branch.propertyId, code: sample.code } },
        update: {
          branchId: branch.id, name: sample.name, rateType: sample.rateType, stayType: 'OVERNIGHT',
          currencyCode: currency.code, mealPlan: 'RO', refundability: sample.refundability,
          cancellationPolicy: sample.refundability === 'REFUNDABLE' ? 'Free cancellation until 24 hours before arrival.' : 'Non-refundable; full payment is due at booking.',
          isPublic: true, status: 'ACTIVE', description: 'Sample data for validating the HotelHex rate-management flow.',
        },
        create: {
          propertyId: branch.propertyId, branchId: branch.id, code: sample.code, name: sample.name,
          rateType: sample.rateType, stayType: 'OVERNIGHT', currencyCode: currency.code, mealPlan: 'RO',
          refundability: sample.refundability,
          cancellationPolicy: sample.refundability === 'REFUNDABLE' ? 'Free cancellation until 24 hours before arrival.' : 'Non-refundable; full payment is due at booking.',
          isPublic: true, status: 'ACTIVE', description: 'Sample data for validating the HotelHex rate-management flow.',
        },
      });

      for (const roomType of roomTypes) {
        const name = roomType.name.toLowerCase();
        const roomFactor = name.includes('suite') ? 2.5 : name.includes('deluxe') ? 1.5 : name.includes('superior') ? 1.2 : 1;
        const basePrice = Math.round(80000 * roomFactor * sample.factor);
        await tx.ratePlanRoomType.upsert({
          where: { ratePlanId_roomTypeId: { ratePlanId: plan.id, roomTypeId: roomType.id } },
          update: { basePrice, baseOccupancy: roomType.maxOccupancy, baseAdults: roomType.baseAdults, baseChildren: roomType.baseChildren, weekdayAdjustment: 0, weekendAdjustment: 15, extraAdultCharge: 15000, extraChildCharge: 8000, extraBedCharge: 20000, minStay: 1, isActive: true },
          create: { ratePlanId: plan.id, roomTypeId: roomType.id, basePrice, baseOccupancy: roomType.maxOccupancy, baseAdults: roomType.baseAdults, baseChildren: roomType.baseChildren, weekdayAdjustment: 0, weekendAdjustment: 15, extraAdultCharge: 15000, extraChildCharge: 8000, extraBedCharge: 20000, minStay: 1, isActive: true },
        });
        ratesAdded += 1;
      }
    }
    return ratesAdded;
  }, { timeout: 30000 });

  console.log(`Seeded ${samples.length} demo rate plans and ${result} room-type prices for ${branch.name} (${branch.property.name}), currency ${currency.code}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Rate demo-data seeding failed.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
