-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "guestNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "title" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "nationality" TEXT,
    "preferredLanguage" TEXT,
    "occupation" TEXT,
    "company" TEXT,
    "guestType" TEXT NOT NULL DEFAULT 'Individual',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "preferredContactMethod" TEXT NOT NULL DEFAULT 'None',
    "createdPropertyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSequence" (
    "tenantId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "GuestSequence_pkey" PRIMARY KEY ("tenantId","year")
);

-- CreateTable
CREATE TABLE "GuestContact" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuestContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestAddress" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Home',
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT,
    "stateRegion" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuestAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestIdentity" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "numberEncrypted" TEXT NOT NULL,
    "numberHash" TEXT NOT NULL,
    "maskedNumber" TEXT NOT NULL,
    "countryOfIssue" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuestIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestPreference" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "propertyId" TEXT,
    "branchId" TEXT,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuestPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestNote" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "propertyId" TEXT,
    "branchId" TEXT,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PROPERTY',
    "department" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestVip" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "reason" TEXT,
    "approvedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuestVip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestAudit" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "branchId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestConfiguration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuestConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Guest_tenantId_normalizedName_idx" ON "Guest"("tenantId", "normalizedName");

-- CreateIndex
CREATE INDEX "Guest_tenantId_status_createdAt_idx" ON "Guest"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_tenantId_guestNumber_key" ON "Guest"("tenantId", "guestNumber");

-- CreateIndex
CREATE INDEX "GuestContact_normalizedValue_guestId_idx" ON "GuestContact"("normalizedValue", "guestId");

-- CreateIndex
CREATE INDEX "GuestAddress_guestId_idx" ON "GuestAddress"("guestId");

-- CreateIndex
CREATE INDEX "GuestIdentity_numberHash_guestId_idx" ON "GuestIdentity"("numberHash", "guestId");

-- CreateIndex
CREATE INDEX "GuestPreference_guestId_propertyId_branchId_idx" ON "GuestPreference"("guestId", "propertyId", "branchId");

-- CreateIndex
CREATE INDEX "GuestNote_guestId_propertyId_branchId_idx" ON "GuestNote"("guestId", "propertyId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "GuestVip_guestId_key" ON "GuestVip"("guestId");

-- CreateIndex
CREATE INDEX "GuestAudit_tenantId_guestId_createdAt_idx" ON "GuestAudit"("tenantId", "guestId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuestConfiguration_tenantId_category_name_key" ON "GuestConfiguration"("tenantId", "category", "name");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "BusinessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestContact" ADD CONSTRAINT "GuestContact_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAddress" ADD CONSTRAINT "GuestAddress_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestIdentity" ADD CONSTRAINT "GuestIdentity_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestPreference" ADD CONSTRAINT "GuestPreference_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestNote" ADD CONSTRAINT "GuestNote_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestVip" ADD CONSTRAINT "GuestVip_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestAudit" ADD CONSTRAINT "GuestAudit_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
