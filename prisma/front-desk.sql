-- CreateTable
CREATE TABLE "FrontDeskStay" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "primaryGuestId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "currentRoomId" TEXT,
    "stayNumber" TEXT NOT NULL,
    "stayType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_HOUSE',
    "plannedArrivalDateTime" TIMESTAMP(3) NOT NULL,
    "plannedDepartureDateTime" TIMESTAMP(3) NOT NULL,
    "actualCheckInDateTime" TIMESTAMP(3) NOT NULL,
    "actualCheckOutDateTime" TIMESTAMP(3),
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "registrationConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "lateArrivalExpectedAt" TIMESTAMP(3),
    "lateArrivalNote" TEXT,
    "originalPlannedEndDateTime" TIMESTAMP(3),
    "gracePeriodMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalExtensionMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalExtensionCharge" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "earlyCheckInReason" TEXT,
    "overrideReason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrontDeskStay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayOccupant" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "guestId" TEXT,
    "guestNameSnapshot" TEXT NOT NULL,
    "occupantType" TEXT NOT NULL DEFAULT 'ADULT',
    "age" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "StayOccupant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayRoomHistory" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "fromRoomId" TEXT,
    "toRoomId" TEXT NOT NULL,
    "effectiveDateTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,

    CONSTRAINT "StayRoomHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayExtension" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "oldDepartureDateTime" TIMESTAMP(3) NOT NULL,
    "newDepartureDateTime" TIMESTAMP(3) NOT NULL,
    "extensionType" TEXT NOT NULL,
    "additionalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "rateReference" JSONB,
    "reason" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "StayExtension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayKey" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "keyIdentifier" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "returnedBy" TEXT,

    CONSTRAINT "StayKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayNote" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'GENERAL',
    "noteText" TEXT NOT NULL,
    "visibilityScope" TEXT NOT NULL DEFAULT 'FRONT_DESK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "StayNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StayStatusHistory" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,

    CONSTRAINT "StayStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestRegistration" (
    "id" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "identityDocumentId" TEXT,
    "addressSnapshot" JSONB,
    "nationalitySnapshot" TEXT,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "signatureReference" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredBy" TEXT NOT NULL,

    CONSTRAINT "GuestRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FrontDeskStay_reservationId_key" ON "FrontDeskStay"("reservationId");

-- CreateIndex
CREATE INDEX "FrontDeskStay_propertyId_branchId_status_plannedDepartureDa_idx" ON "FrontDeskStay"("propertyId", "branchId", "status", "plannedDepartureDateTime");

-- CreateIndex
CREATE INDEX "FrontDeskStay_propertyId_branchId_plannedArrivalDateTime_idx" ON "FrontDeskStay"("propertyId", "branchId", "plannedArrivalDateTime");

-- CreateIndex
CREATE INDEX "FrontDeskStay_currentRoomId_status_idx" ON "FrontDeskStay"("currentRoomId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FrontDeskStay_propertyId_stayNumber_key" ON "FrontDeskStay"("propertyId", "stayNumber");

-- CreateIndex
CREATE INDEX "StayOccupant_stayId_idx" ON "StayOccupant"("stayId");

-- CreateIndex
CREATE INDEX "StayRoomHistory_stayId_changedAt_idx" ON "StayRoomHistory"("stayId", "changedAt");

-- CreateIndex
CREATE INDEX "StayExtension_stayId_createdAt_idx" ON "StayExtension"("stayId", "createdAt");

-- CreateIndex
CREATE INDEX "StayKey_stayId_status_idx" ON "StayKey"("stayId", "status");

-- CreateIndex
CREATE INDEX "StayNote_stayId_visibilityScope_createdAt_idx" ON "StayNote"("stayId", "visibilityScope", "createdAt");

-- CreateIndex
CREATE INDEX "StayStatusHistory_stayId_changedAt_idx" ON "StayStatusHistory"("stayId", "changedAt");

-- CreateIndex
CREATE INDEX "GuestRegistration_stayId_registeredAt_idx" ON "GuestRegistration"("stayId", "registeredAt");

-- AddForeignKey
ALTER TABLE "FrontDeskStay" ADD CONSTRAINT "FrontDeskStay_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "BusinessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontDeskStay" ADD CONSTRAINT "FrontDeskStay_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontDeskStay" ADD CONSTRAINT "FrontDeskStay_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontDeskStay" ADD CONSTRAINT "FrontDeskStay_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontDeskStay" ADD CONSTRAINT "FrontDeskStay_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontDeskStay" ADD CONSTRAINT "FrontDeskStay_primaryGuestId_fkey" FOREIGN KEY ("primaryGuestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontDeskStay" ADD CONSTRAINT "FrontDeskStay_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrontDeskStay" ADD CONSTRAINT "FrontDeskStay_currentRoomId_fkey" FOREIGN KEY ("currentRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayOccupant" ADD CONSTRAINT "StayOccupant_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "FrontDeskStay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayOccupant" ADD CONSTRAINT "StayOccupant_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayRoomHistory" ADD CONSTRAINT "StayRoomHistory_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "FrontDeskStay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayRoomHistory" ADD CONSTRAINT "StayRoomHistory_fromRoomId_fkey" FOREIGN KEY ("fromRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayRoomHistory" ADD CONSTRAINT "StayRoomHistory_toRoomId_fkey" FOREIGN KEY ("toRoomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayExtension" ADD CONSTRAINT "StayExtension_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "FrontDeskStay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayKey" ADD CONSTRAINT "StayKey_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "FrontDeskStay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayKey" ADD CONSTRAINT "StayKey_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayNote" ADD CONSTRAINT "StayNote_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "FrontDeskStay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayStatusHistory" ADD CONSTRAINT "StayStatusHistory_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "FrontDeskStay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestRegistration" ADD CONSTRAINT "GuestRegistration_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "FrontDeskStay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestRegistration" ADD CONSTRAINT "GuestRegistration_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestRegistration" ADD CONSTRAINT "GuestRegistration_identityDocumentId_fkey" FOREIGN KEY ("identityDocumentId") REFERENCES "GuestIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
