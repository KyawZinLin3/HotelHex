-- CreateTable
CREATE TABLE "ReservationSequence" (
    "propertyId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "ReservationSequence_pkey" PRIMARY KEY ("propertyId","branchId","year")
);

-- CreateTable
CREATE TABLE "ReservationCatalog" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "branchId" TEXT,
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReservationCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "reservationNumber" TEXT NOT NULL,
    "primaryGuestId" TEXT NOT NULL,
    "guestNameSnapshot" TEXT NOT NULL,
    "contactPhoneSnapshot" TEXT,
    "contactEmailSnapshot" TEXT,
    "reservationType" TEXT NOT NULL DEFAULT 'Individual',
    "bookingSource" TEXT NOT NULL,
    "marketSegment" TEXT,
    "externalReference" TEXT,
    "stayType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TENTATIVE',
    "arrivalDateTime" TIMESTAMP(3) NOT NULL,
    "departureDateTime" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "roomCount" INTEGER NOT NULL DEFAULT 1,
    "roomTypeId" TEXT NOT NULL,
    "ratePlanId" TEXT NOT NULL,
    "assignedRoomId" TEXT,
    "currencyCode" TEXT NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "total" DECIMAL(18,2) NOT NULL,
    "rateSnapshot" JSONB NOT NULL,
    "cancellationPolicySnapshot" TEXT,
    "depositPolicySnapshot" TEXT,
    "guaranteeStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "guaranteeMethod" TEXT,
    "depositStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "depositRequiredAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "depositDueAt" TIMESTAMP(3),
    "depositReference" TEXT,
    "specialRequestSummary" TEXT,
    "generalNotes" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "cancellationPolicyResult" JSONB,
    "noShowAt" TIMESTAMP(3),
    "noShowBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationGuest" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "guestId" TEXT,
    "guestNameSnapshot" TEXT NOT NULL,
    "guestType" TEXT NOT NULL DEFAULT 'ADULT',
    "age" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReservationGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationRateDetail" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "stayDate" DATE NOT NULL,
    "durationMinutes" INTEGER,
    "baseRate" DECIMAL(18,2) NOT NULL,
    "occupancyCharge" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "extraBedCharge" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "serviceCharge" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "rateSource" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "ReservationRateDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationRequest" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "requestText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationNote" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'GENERAL',
    "text" TEXT NOT NULL,
    "visibilityScope" TEXT NOT NULL DEFAULT 'RESERVATION_TEAM',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationChange" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "reason" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationGuarantee" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "guaranteeType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requiredAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3),
    "reference" TEXT,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationGuarantee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationAudit" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationCatalog_propertyId_category_isActive_idx" ON "ReservationCatalog"("propertyId", "category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationCatalog_propertyId_branchId_category_code_key" ON "ReservationCatalog"("propertyId", "branchId", "category", "code");

-- CreateIndex
CREATE INDEX "Reservation_tenantId_propertyId_status_arrivalDateTime_idx" ON "Reservation"("tenantId", "propertyId", "status", "arrivalDateTime");

-- CreateIndex
CREATE INDEX "Reservation_propertyId_branchId_roomTypeId_arrivalDateTime__idx" ON "Reservation"("propertyId", "branchId", "roomTypeId", "arrivalDateTime", "departureDateTime");

-- CreateIndex
CREATE INDEX "Reservation_primaryGuestId_propertyId_arrivalDateTime_idx" ON "Reservation"("primaryGuestId", "propertyId", "arrivalDateTime");

-- CreateIndex
CREATE INDEX "Reservation_externalReference_propertyId_idx" ON "Reservation"("externalReference", "propertyId");

-- CreateIndex
CREATE INDEX "Reservation_assignedRoomId_arrivalDateTime_departureDateTim_idx" ON "Reservation"("assignedRoomId", "arrivalDateTime", "departureDateTime");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_propertyId_reservationNumber_key" ON "Reservation"("propertyId", "reservationNumber");

-- CreateIndex
CREATE INDEX "ReservationGuest_reservationId_idx" ON "ReservationGuest"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationRateDetail_reservationId_stayDate_idx" ON "ReservationRateDetail"("reservationId", "stayDate");

-- CreateIndex
CREATE INDEX "ReservationRequest_reservationId_status_idx" ON "ReservationRequest"("reservationId", "status");

-- CreateIndex
CREATE INDEX "ReservationNote_reservationId_visibilityScope_idx" ON "ReservationNote"("reservationId", "visibilityScope");

-- CreateIndex
CREATE INDEX "ReservationChange_reservationId_changedAt_idx" ON "ReservationChange"("reservationId", "changedAt");

-- CreateIndex
CREATE INDEX "ReservationAudit_tenantId_propertyId_branchId_reservationId_idx" ON "ReservationAudit"("tenantId", "propertyId", "branchId", "reservationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "BusinessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_primaryGuestId_fkey" FOREIGN KEY ("primaryGuestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "RatePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_assignedRoomId_fkey" FOREIGN KEY ("assignedRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationGuest" ADD CONSTRAINT "ReservationGuest_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationGuest" ADD CONSTRAINT "ReservationGuest_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRateDetail" ADD CONSTRAINT "ReservationRateDetail_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRequest" ADD CONSTRAINT "ReservationRequest_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationNote" ADD CONSTRAINT "ReservationNote_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationChange" ADD CONSTRAINT "ReservationChange_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationGuarantee" ADD CONSTRAINT "ReservationGuarantee_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationAudit" ADD CONSTRAINT "ReservationAudit_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
