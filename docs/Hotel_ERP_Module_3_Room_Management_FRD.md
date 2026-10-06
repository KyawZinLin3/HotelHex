# Hotel ERP — Module 3: Room Management
## Functional Requirements Document (FRD)

**Product:** Multi-Property Hotel ERP  
**Module:** Module 3 — Room Management  
**Version:** 1.0  
**Document Type:** Functional Requirements Document  
**Priority:** Critical / Core PMS Foundation  
**Target Users:** Hotels, Resorts, Serviced Apartments, Hotel Groups, Multi-Property Hospitality Businesses  

---

# 1. Purpose

The Room Management module defines and manages the physical and sellable room inventory of each hotel property.

It provides the master data and operational room controls required by later modules such as:

- Reservation Management
- Front Desk / Check-In / Check-Out
- Housekeeping
- Maintenance
- Rate Management
- Billing
- Night Audit
- Reporting
- Revenue Management

The module answers questions such as:

- What rooms exist?
- Which room type does each room belong to?
- Which building and floor is the room located in?
- What bed type, amenities, features, and capacity does it have?
- Is the room active and sellable?
- What is the current operational room status?
- Is the room temporarily unavailable because of maintenance?
- Can the room be assigned to a reservation?
- Which rooms are connecting, accessible, smoking/non-smoking, or special-use rooms?

---

# 2. Business Objective

The objective of this module is to maintain one reliable source of truth for all hotel rooms.

The system shall allow hotel administrators and authorized staff to:

1. Define room types.
2. Create individual rooms.
3. Assign rooms to properties, branches, buildings, and floors.
4. Configure bed types.
5. Configure room amenities and features.
6. Define occupancy capacity.
7. Maintain room operational status.
8. Mark rooms Out of Order or Out of Service.
9. Track special room attributes.
10. Prevent invalid or duplicate room configuration.
11. Provide room information to Reservations, Front Desk, Housekeeping, and Maintenance.
12. Support multi-property and multi-branch hotel groups.

---

# 3. Dependencies

Module 3 depends on data created by earlier foundation modules.

## 3.1 Module 1 — Organization & Property Setup

The following records should already exist:

- Tenant
- Company
- Property
- Branch
- Building
- Floor
- Department
- Currency
- Business Date

Example hierarchy:

```text
Tenant
  ↓
Company
  ↓
Property
  ↓
Branch
  ↓
Building
  ↓
Floor
  ↓
Room
```

## 3.2 Module 2 — User, Role & Permission Management

Room Management must use existing authentication and authorization.

Example permissions:

```text
ROOM.TYPE.VIEW
ROOM.TYPE.CREATE
ROOM.TYPE.UPDATE

ROOM.ROOM.VIEW
ROOM.ROOM.CREATE
ROOM.ROOM.UPDATE

ROOM.STATUS.UPDATE
ROOM.OOO.CREATE
ROOM.OOO.RELEASE

ROOM.AMENITY.MANAGE
```

---

# 4. Scope

## 4.1 In Scope

The module includes:

1. Room Type Management
2. Room Management
3. Bed Type Management
4. Amenity Management
5. Room Feature Management
6. Room Capacity Configuration
7. Room Location Assignment
8. Room Operational Status
9. Room Sellability Status
10. Out of Order (OOO)
11. Out of Service (OOS)
12. Connecting Rooms
13. Accessible Rooms
14. Smoking / Non-Smoking Configuration
15. Room Notes
16. Room Images
17. Room Status History
18. Bulk Room Creation
19. Room Search and Filters
20. Room Reports
21. Room Audit Logging
22. Room Permission Enforcement
23. Integration with later hotel modules

---

# 5. Out of Scope

The following functions are not handled directly by Module 3:

- Creating reservations
- Assigning room rates
- Guest check-in
- Guest check-out
- Guest folio billing
- Housekeeping task assignment
- Maintenance work orders
- Night audit
- OTA inventory synchronization
- Dynamic pricing

However, those modules will consume Room Management data.

---

# 6. Core Concepts

The module must separate these concepts clearly.

## 6.1 Room Type

A **Room Type** is a sellable category.

Examples:

```text
Standard King
Standard Twin
Deluxe King
Executive Room
Family Room
Suite
Presidential Suite
```

A room type describes what the hotel sells.

## 6.2 Room

A **Room** is a physical room.

Examples:

```text
101
102
201
202
305
```

Each room belongs to one room type.

Example:

```text
Room 201
→ Deluxe King
```

## 6.3 Room Operational Status

Operational status describes the current room condition.

Examples:

```text
Vacant Clean
Vacant Dirty
Occupied Clean
Occupied Dirty
Cleaning
Inspected
```

## 6.4 Sellability / Availability Status

Sellability indicates whether a room may currently be sold or assigned.

Examples:

```text
Sellable
Out of Order
Out of Service
Inactive
```

Room operational status and sellability must not be treated as the same field.

---

# 7. Main Entities

Recommended entities:

```text
RoomType
Room
BedType
RoomAmenity
Amenity
RoomFeature
Feature
RoomStatusHistory
RoomOutOfOrder
RoomOutOfService
RoomImage
RoomNote
RoomConnection
```

Supporting entities from Module 1:

```text
Property
Branch
Building
Floor
```

---

# 8. Room Type Management

## FR-RT-001 — Create Room Type

Authorized users shall be able to create a room type for a property.

### Required Fields

- Room Type Code
- Room Type Name
- Property
- Maximum Occupancy
- Maximum Adults
- Maximum Children
- Status

### Optional Fields

- Branch
- Description
- Short Description
- Bed Type
- Number of Beds
- Room Size
- Room Size Unit
- Base Occupancy
- Extra Bed Allowed
- Maximum Extra Beds
- Default Number of Adults
- Default Number of Children
- Smoking Policy
- Display Order
- Marketing Description
- Thumbnail Image

Example:

```text
Code: DLX-KING
Name: Deluxe King
Property: Golden Hotel Yangon
Max Occupancy: 3
Max Adults: 2
Max Children: 1
Bed Type: King
Extra Bed Allowed: Yes
```

### Acceptance Criteria

- Room type code must be unique within the property.
- Room type name is required.
- Maximum occupancy must be greater than zero.
- Maximum adults must not exceed maximum occupancy.
- Inactive room types cannot be selected for new rooms.
- Existing reservations must not be broken when a room type is deactivated.

---

## FR-RT-002 — Edit Room Type

Authorized users shall be able to edit room type configuration.

Changes must be audited.

---

## FR-RT-003 — Activate / Deactivate Room Type

Room types shall support:

```text
Active
Inactive
```

A room type that is already used by rooms or historical transactions must not be physically deleted.

---

## FR-RT-004 — Room Type Capacity

The system shall support capacity rules:

- Base Adults
- Base Children
- Max Adults
- Max Children
- Max Occupancy
- Extra Bed Allowed
- Max Extra Beds

Example:

```text
Max Adults: 2
Max Children: 2
Max Occupancy: 4
```

Business validation:

```text
Adults + Children <= Max Occupancy
```

---

## FR-RT-005 — Room Type Bed Configuration

A room type may have one or multiple bed configurations.

Examples:

```text
1 King Bed
2 Twin Beds
1 Queen + 1 Single
1 King + Sofa Bed
```

For MVP, one default bed configuration is sufficient.

---

# 9. Bed Type Management

## FR-BED-001 — Create Bed Type

Authorized users shall be able to configure bed types.

Fields:

- Bed Type Code
- Bed Type Name
- Description
- Capacity
- Status

Examples:

```text
KING
QUEEN
TWIN
DOUBLE
SINGLE
SOFA
BUNK
```

---

## FR-BED-002 — Bed Type Status

Bed types shall support Active / Inactive status.

Inactive bed types cannot be assigned to new room configurations.

---

# 10. Amenity Management

## FR-AMN-001 — Create Amenity

Authorized users shall be able to define reusable amenities.

Fields:

- Amenity Code
- Amenity Name
- Category
- Description
- Icon
- Status

Example categories:

```text
Bathroom
Entertainment
Comfort
Kitchen
Connectivity
Safety
Accessibility
View
Other
```

Examples:

```text
Wi-Fi
Air Conditioning
Bathtub
Shower
Television
Mini Bar
Safe
Hair Dryer
Work Desk
Balcony
Coffee Maker
Refrigerator
Iron
```

---

## FR-AMN-002 — Assign Amenities to Room Type

The system shall allow amenities to be assigned to room types.

Example:

```text
Deluxe King
✓ Wi-Fi
✓ Air Conditioning
✓ Smart TV
✓ Mini Bar
✓ Safe
✓ Bathtub
```

---

## FR-AMN-003 — Room-Level Amenity Override

A specific room may have additional amenities or exceptions.

Example:

```text
Room Type: Deluxe King
Default: No Balcony

Room 205:
Balcony = Yes
```

This should be a P1 feature.

---

# 11. Room Feature Management

## FR-FTR-001 — Configure Features

The system shall support room features that are useful for search and assignment.

Examples:

```text
Sea View
City View
Garden View
Pool View
High Floor
Near Elevator
Away From Elevator
Corner Room
Connecting Room
Accessible Room
Smoking Room
Non-Smoking Room
Balcony
Quiet Zone
```

Features may be assigned to room types and/or individual rooms.

---

# 12. Room Management

## FR-RM-001 — Create Room

Authorized users shall be able to create individual rooms.

### Required Fields

- Property
- Branch
- Building
- Floor
- Room Number
- Room Type
- Status

### Optional Fields

- Room Name
- Internal Code
- Bed Type Override
- Max Occupancy Override
- Smoking Type
- Accessibility Flag
- Connecting Room Flag
- View Type
- Room Size
- Phone Extension
- Key Lock Reference
- Housekeeping Zone
- Maintenance Zone
- Notes
- Images

Example:

```text
Room Number: 205
Property: Golden Hotel Yangon
Branch: Main Hotel
Building: Main Tower
Floor: 2
Room Type: Deluxe King
Operational Status: Vacant Clean
Sellability: Sellable
```

---

## FR-RM-002 — Unique Room Number

Room number must be unique within the defined property/building scope.

Recommended MVP rule:

```text
PropertyId + RoomNumber = Unique
```

If the hotel needs duplicate room numbers across separate buildings, use:

```text
PropertyId + BuildingId + RoomNumber = Unique
```

The selected strategy must be tenant configurable only if genuinely required.

---

## FR-RM-003 — Edit Room

Authorized users shall be able to edit permitted room details.

Changes shall be audited.

Certain fields should become restricted after operational usage begins, especially:

- Property
- Branch
- Room Number
- Room Type

Changes to those fields should require elevated permission.

---

## FR-RM-004 — Activate / Deactivate Room

Room records shall support:

```text
Active
Inactive
```

Inactive rooms:

- cannot be assigned to new reservations;
- cannot be selected during check-in;
- remain visible in historical reports.

---

## FR-RM-005 — Physical Delete Restriction

Rooms used in any transaction shall not be permanently deleted.

Use deactivation instead.

---

# 13. Bulk Room Creation

## FR-RM-006 — Bulk Create Rooms

The system should allow authorized users to create multiple rooms at once.

Example input:

```text
Property: Golden Hotel Yangon
Building: Main Tower
Floor: 2
Room Type: Deluxe King
Room Numbers: 201–210
```

System creates:

```text
201
202
203
204
205
206
207
208
209
210
```

### Acceptance Criteria

- Duplicate rooms must be rejected.
- Failed records must be clearly reported.
- Bulk creation must respect authorization scope.
- All generated records must be audited.

This is strongly recommended for MVP because hotel setup can otherwise be slow.

---

# 14. Room Location

## FR-LOC-001 — Building Assignment

Each room shall belong to an active building.

## FR-LOC-002 — Floor Assignment

Each room shall belong to an active floor within the selected building.

The system must prevent mismatched hierarchy.

Invalid example:

```text
Building: Main Tower
Floor: Beach Wing Floor 2
```

if the floor does not belong to Main Tower.

---

# 15. Room Capacity

## FR-CAP-001 — Room Capacity

Each room inherits capacity from its room type by default.

A room-specific override may be supported with permission.

Fields:

- Maximum Occupancy
- Maximum Adults
- Maximum Children
- Extra Bed Allowed
- Maximum Extra Beds

---

## FR-CAP-002 — Occupancy Validation

Later Reservation and Front Desk modules must use these capacity rules when selecting a room.

Example:

```text
Room Max Occupancy: 3

Request:
2 Adults + 2 Children = 4

Result:
Not Allowed
```

unless the hotel's configured occupancy policy permits the combination.

---

# 16. Smoking Classification

## FR-SMK-001

Rooms shall support:

```text
Smoking
Non-Smoking
Smoking Policy Not Specified
```

The value should be searchable from reservation/front-desk screens.

---

# 17. Accessible Room

## FR-ACC-001

The system shall allow a room to be marked as accessible.

Optional attributes:

- Wheelchair Accessible
- Accessible Bathroom
- Grab Bars
- Wider Door
- Low Fixtures
- Accessible Shower

The system should treat these as search/assignment attributes, not medical records.

---

# 18. Connecting Rooms

## FR-CON-001 — Connect Two Rooms

Authorized users shall be able to identify rooms that physically connect.

Example:

```text
Room 201 ↔ Room 202
```

Rules:

- Both rooms must belong to the same property.
- Both rooms should normally be within the same building.
- Duplicate connection pairs shall not be allowed.
- Connection is bidirectional.

If Room 201 is connected to Room 202, the system must recognize Room 202 as connected to Room 201.

---

# 19. Room Operational Status

## FR-STS-001 — Supported Operational Statuses

Recommended PMS statuses:

```text
Vacant Clean (VC)
Vacant Dirty (VD)
Occupied Clean (OC)
Occupied Dirty (OD)
Cleaning
Inspected
```

Optional later statuses:

```text
Pickup
Do Not Disturb
Sleep Out
Due Out
```

These optional statuses may be managed partly by Housekeeping or Front Desk.

---

# 20. Status Ownership

The module shall distinguish which system process is allowed to update each state.

Example:

```text
Check-Out
→ Room becomes Vacant Dirty

Housekeeping starts cleaning
→ Cleaning

Housekeeping completes
→ Vacant Clean

Supervisor inspection
→ Inspected / Vacant Clean
```

The Room Management screen may allow administrative override only with appropriate permission.

---

# 21. Operational Status Transition Rules

## FR-STS-002

The system should enforce logical room status transitions.

Example:

```text
Occupied Clean
      ↓ Check-Out
Vacant Dirty
      ↓ Start Cleaning
Cleaning
      ↓ Complete Cleaning
Vacant Clean
```

Invalid transitions should require override permission.

Example:

```text
Occupied Clean
→ Vacant Clean
```

without Check-Out should normally be rejected.

---

# 22. Room Sellability

## FR-SELL-001

The system shall maintain whether the room can currently be assigned/sold.

Recommended states:

```text
Sellable
Out of Order
Out of Service
Inactive
```

This is separate from housekeeping status.

Example:

```text
Room 205
Operational Status: Vacant Clean
Sellability: Out of Order
```

It is clean, but it still cannot be sold.

---

# 23. Out of Order (OOO)

## FR-OOO-001 — Mark Room Out of Order

Authorized users shall be able to mark a room Out of Order.

Typical reasons:

- Air conditioner failure
- Plumbing problem
- Electrical issue
- Renovation
- Damaged furniture
- Safety issue

Fields:

- Room
- Start Date/Time
- Expected End Date/Time
- Reason Code
- Description
- Requested By
- Approved By if required
- Maintenance Reference
- Status

Example:

```text
Room: 305
Status: Out of Order
Reason: Air Conditioner Failure
From: 04-Oct-2026 10:00
Expected Until: 05-Oct-2026 15:00
```

---

## FR-OOO-002 — OOO Reservation Protection

Before marking a room OOO, the system shall check future or current room assignments.

If there is an affected reservation, the system must warn the user.

Example:

```text
Room 305 has a confirmed assignment for 05-Oct-2026.
```

The action may require reassignment first.

---

## FR-OOO-003 — Release OOO

Authorized users shall be able to return a room from OOO status.

The system shall record:

- Released By
- Released Date/Time
- Release Notes

The room should return to an appropriate operational status, normally:

```text
Vacant Dirty
```

or another configured state requiring inspection.

---

# 24. Out of Service (OOS)

## FR-OOS-001

The system shall support Out of Service separately from Out of Order.

Recommended meaning:

**Out of Order:** room should not be sold because of a significant issue and may affect available-room inventory.

**Out of Service:** short-term operational hold or minor issue, depending on hotel policy.

Because hotels use these terms differently, the exact inventory impact should be configurable at implementation level.

---

## FR-OOS-002

OOS records shall store:

- Room
- Start Date/Time
- End Date/Time
- Reason
- Notes
- Created By
- Released By

---

# 25. Room Notes

## FR-NOTE-001

Authorized users shall be able to add internal notes to rooms.

Examples:

```text
Avoid assigning to noise-sensitive guests.
TV remote replaced on 02-Oct-2026.
Curtain scheduled for replacement.
```

Notes should support:

- Note Type
- Note
- Created By
- Created Date
- Active / Resolved

Sensitive notes must be permission controlled.

---

# 26. Room Images

## FR-IMG-001

Administrators may upload room images.

Images may be associated with:

- Room Type
- Individual Room

Fields:

- Image
- Caption
- Display Order
- Primary Image
- Status

Room images can later be reused by:

- Booking Engine
- Reservation UI
- Internal room reference

---

# 27. Room Search

## FR-SRCH-001

Users shall be able to search rooms by:

- Room Number
- Room Type
- Property
- Branch
- Building
- Floor
- Bed Type
- Operational Status
- Sellability Status
- Smoking Type
- Accessible Flag
- Connecting Room
- Feature
- Amenity
- Active Status

---

# 28. Room Filters

Example:

```text
Property: Golden Hotel Yangon
Floor: 2
Room Type: Deluxe King
Operational Status: Vacant Clean
Sellability: Sellable
```

Result:

```text
201
203
205
208
```

---

# 29. Room List Screen

Recommended columns:

| Room | Room Type | Building | Floor | Operational Status | Sellability | Active |
|---|---|---|---|---|---|---|

Recommended actions:

```text
View
Edit
Change Status
Mark OOO
Mark OOS
Add Note
View History
Deactivate
```

Actions must be permission-based.

---

# 30. Room Detail Screen

Suggested sections:

## General

- Room Number
- Room Type
- Property
- Branch
- Building
- Floor

## Capacity

- Adults
- Children
- Total Occupancy
- Extra Bed

## Physical Information

- Bed Type
- Room Size
- View
- Smoking
- Accessibility
- Connecting Room

## Amenities

- Amenity list

## Status

- Operational Status
- Sellability Status

## Current Holds

- OOO
- OOS

## History

- Status changes
- Configuration changes
- Notes

---

# 31. Room Rack / Visual Board

## FR-RACK-001

The module should provide a simple room-status board.

Example:

```text
Floor 1
101  VC
102  OD
103  OOO
104  VC

Floor 2
201  VC
202  Cleaning
203  OC
204  VD
```

This is not yet the Reservation Room Rack.

The purpose here is operational room visibility.

P1 may add visual cards with filters.

---

# 32. Room Status History

## FR-HIST-001

The system shall retain room status history.

Fields:

```text
RoomId
PreviousStatus
NewStatus
Reason
ChangedBy
ChangedAt
SourceModule
ReferenceId
```

Example:

```text
Room 205
Occupied Clean → Vacant Dirty
Source: Front Desk Check-Out
```

---

# 33. Status Source Tracking

## FR-HIST-002

Changes should indicate the originating module.

Examples:

```text
ROOM_ADMIN
FRONT_DESK
HOUSEKEEPING
MAINTENANCE
NIGHT_AUDIT
SYSTEM
```

This is important for troubleshooting.

---

# 34. Audit Logging

## FR-AUD-001

The system shall audit changes to room master data.

At minimum:

```text
Room Created
Room Updated
Room Activated
Room Deactivated

Room Type Created
Room Type Updated
Room Type Deactivated

Amenity Assigned
Amenity Removed

Status Override

OOO Created
OOO Updated
OOO Released

OOS Created
OOS Released
```

---

# 35. Audit Record Data

Audit record should contain:

- Tenant
- Property
- Branch
- Entity
- Entity ID
- Action
- Old Value
- New Value
- Performed By
- Date/Time
- IP/Device where appropriate

---

# 36. Permissions

Recommended permission codes:

```text
ROOM.TYPE.VIEW
ROOM.TYPE.CREATE
ROOM.TYPE.UPDATE
ROOM.TYPE.ACTIVATE
ROOM.TYPE.DEACTIVATE

ROOM.BEDTYPE.VIEW
ROOM.BEDTYPE.MANAGE

ROOM.AMENITY.VIEW
ROOM.AMENITY.MANAGE

ROOM.FEATURE.VIEW
ROOM.FEATURE.MANAGE

ROOM.ROOM.VIEW
ROOM.ROOM.CREATE
ROOM.ROOM.UPDATE
ROOM.ROOM.ACTIVATE
ROOM.ROOM.DEACTIVATE

ROOM.STATUS.VIEW
ROOM.STATUS.UPDATE
ROOM.STATUS.OVERRIDE

ROOM.OOO.VIEW
ROOM.OOO.CREATE
ROOM.OOO.UPDATE
ROOM.OOO.RELEASE

ROOM.OOS.VIEW
ROOM.OOS.CREATE
ROOM.OOS.RELEASE

ROOM.NOTE.VIEW
ROOM.NOTE.CREATE

ROOM.REPORT.VIEW
ROOM.REPORT.EXPORT
```

---

# 37. Branch / Property Scope Security

## FR-SEC-001

Users shall only access rooms within their authorized property/branch scope.

Example:

```text
User: Yangon Front Desk Officer

Allowed:
✓ Golden Hotel Yangon

Not Allowed:
✗ Golden Hotel Mandalay
```

Even if the user has `ROOM.ROOM.VIEW`, organizational scope must also pass.

---

# 38. Business Rules

## BR-001

Every room must belong to one property.

## BR-002

Every room must belong to one active room type.

## BR-003

Every room must belong to a valid building/floor structure when the property uses buildings and floors.

## BR-004

Room numbers must be unique within the configured uniqueness scope.

## BR-005

Inactive rooms cannot be assigned to new hotel operations.

## BR-006

OOO rooms cannot be assigned for sale/check-in during the OOO period.

## BR-007

OOS behavior shall follow configured inventory rules.

## BR-008

Rooms referenced by historical transactions cannot be permanently deleted.

## BR-009

Room status overrides require explicit permission.

## BR-010

Room type capacity rules shall be available to Reservation and Front Desk modules.

## BR-011

Users may only manage rooms within authorized organizational scope.

## BR-012

All critical room configuration changes shall be audited.

---

# 39. Validation Rules

## VAL-001

Room number is required.

## VAL-002

Room type is required.

## VAL-003

Property is required.

## VAL-004

Duplicate room number within uniqueness scope is prohibited.

## VAL-005

Floor must belong to selected building.

## VAL-006

Building must belong to selected property/branch.

## VAL-007

Maximum occupancy must be greater than zero.

## VAL-008

Maximum adults must not exceed maximum occupancy.

## VAL-009

Maximum children must not result in an impossible capacity configuration.

## VAL-010

OOO end date must be later than start date when provided.

## VAL-011

A room cannot have overlapping conflicting OOO records.

## VAL-012

Inactive room types cannot be used for new room creation.

---

# 40. Integration — Reservation Module

Room Management shall provide Reservation with:

- Room Types
- Rooms
- Capacity
- Amenities
- Features
- Sellability
- OOO/OOS periods
- Smoking classification
- Accessibility
- Connecting-room information

Reservation shall determine availability using room inventory plus booking data.

Room Management itself must not calculate full reservation availability.

---

# 41. Integration — Front Desk

Front Desk shall use:

- Current room status
- Sellability
- Room type
- Room features
- Current assignment
- Capacity

Check-in must reject:

```text
Inactive Room
Out of Order Room
Unauthorized Room
```

unless a valid privileged override exists.

---

# 42. Integration — Housekeeping

Housekeeping will own operational processes such as:

```text
Cleaning Task
Housekeeper Assignment
Inspection
DND
Linen Status
```

Room Management stores or exposes the resulting room status.

Example:

```text
Housekeeping completes cleaning
→ Room operational status becomes Vacant Clean
```

---

# 43. Integration — Maintenance

Maintenance may create work orders referencing rooms.

Example:

```text
Maintenance Ticket
Room 305
Issue: Air Conditioner Failure
```

A maintenance ticket may lead to:

```text
Room → Out of Order
```

Room Management stores the room hold, while Maintenance manages the repair workflow.

---

# 44. Integration — Rate Management

Rates should normally be assigned to:

```text
Room Type
```

rather than individual physical rooms.

Example:

```text
Deluxe King
Weekday Rate: 180,000 MMK
```

Specific room-level rate exceptions should be avoided unless required by business rules.

---

# 45. Reporting

The module shall provide at minimum:

1. Room Master List
2. Room Type List
3. Rooms by Property
4. Rooms by Building
5. Rooms by Floor
6. Rooms by Room Type
7. Rooms by Operational Status
8. Rooms by Sellability
9. Out of Order Rooms
10. Out of Service Rooms
11. Accessible Rooms
12. Smoking / Non-Smoking Rooms
13. Connecting Rooms
14. Room Status History
15. Inactive Rooms

---

# 46. Export

Reports may support:

- Screen View
- Print
- PDF Export
- Excel Export

subject to permission.

---

# 47. Recommended Menu Structure

```text
Hotel Operations
│
└── Room Management
    │
    ├── Rooms
    ├── Room Types
    ├── Bed Types
    ├── Amenities
    ├── Features
    ├── Room Status Board
    ├── Out of Order
    ├── Out of Service
    └── Room Reports
```

Configuration items may alternatively be placed under:

```text
Administration
└── Hotel Configuration
```

---

# 48. Main Screens

Recommended screens:

1. Room List
2. Create Room
3. Edit Room
4. Room Detail
5. Bulk Room Creation
6. Room Type List
7. Create/Edit Room Type
8. Bed Type Setup
9. Amenity Setup
10. Feature Setup
11. Room Status Board
12. OOO List
13. Create OOO
14. OOS List
15. Room Status History
16. Room Reports

---

# 49. Suggested Database Model

## RoomType

```text
Id
TenantId
CompanyId
PropertyId
BranchId

Code
Name
Description

DefaultBedTypeId
NumberOfBeds

BaseAdults
BaseChildren
MaxAdults
MaxChildren
MaxOccupancy

ExtraBedAllowed
MaxExtraBeds

RoomSize
RoomSizeUnit

SmokingPolicy

DisplayOrder

IsActive

CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

---

# 50. Room

```text
Id
TenantId

CompanyId
PropertyId
BranchId

BuildingId
FloorId

RoomTypeId

RoomNumber
RoomName
InternalCode

PhoneExtension

SmokingType
IsAccessible

OperationalStatus
SellabilityStatus

HousekeepingZone
MaintenanceZone

IsActive

CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

---

# 51. BedType

```text
Id
TenantId

Code
Name
Description

Capacity

IsActive
```

---

# 52. Amenity

```text
Id
TenantId

Code
Name
Category
Description
Icon

IsActive
```

---

# 53. RoomTypeAmenity

```text
Id
RoomTypeId
AmenityId
```

Unique:

```text
RoomTypeId + AmenityId
```

---

# 54. RoomAmenityOverride

Optional P1:

```text
Id
RoomId
AmenityId

OverrideType
```

Example:

```text
ADD
REMOVE
```

---

# 55. RoomFeature

```text
Id
TenantId

Code
Name
Category
Description

IsActive
```

---

# 56. RoomFeatureAssignment

```text
Id
RoomId
FeatureId
```

---

# 57. RoomConnection

```text
Id

RoomId
ConnectedRoomId

IsActive
CreatedAt
CreatedBy
```

Unique normalized pair must be enforced.

---

# 58. RoomStatusHistory

```text
Id
RoomId

PreviousStatus
NewStatus

Reason

SourceModule
ReferenceId

ChangedAt
ChangedBy
```

---

# 59. RoomOutOfOrder

```text
Id
RoomId

StartDateTime
ExpectedEndDateTime
ActualEndDateTime

ReasonCode
Reason
Description

MaintenanceReferenceId

Status

CreatedBy
CreatedAt

ReleasedBy
ReleasedAt
ReleaseNotes
```

---

# 60. Recommended Relationships

```text
Property
  │
  ├── Building
  │     │
  │     └── Floor
  │           │
  │           └── Room
  │
  └── RoomType
          │
          └── Room
```

Amenities:

```text
RoomType
   *
   │
   *
Amenity
```

Features:

```text
Room
  *
  │
  *
Feature
```

---

# 61. Recommended API Endpoints

## Room Types

```text
GET    /api/v1/room-management/room-types
POST   /api/v1/room-management/room-types
GET    /api/v1/room-management/room-types/{id}
PUT    /api/v1/room-management/room-types/{id}

POST   /api/v1/room-management/room-types/{id}/activate
POST   /api/v1/room-management/room-types/{id}/deactivate
```

## Rooms

```text
GET    /api/v1/room-management/rooms
POST   /api/v1/room-management/rooms
GET    /api/v1/room-management/rooms/{id}
PUT    /api/v1/room-management/rooms/{id}

POST   /api/v1/room-management/rooms/bulk
POST   /api/v1/room-management/rooms/{id}/activate
POST   /api/v1/room-management/rooms/{id}/deactivate
```

## Room Status

```text
GET    /api/v1/room-management/rooms/{id}/status-history

POST   /api/v1/room-management/rooms/{id}/status
```

## OOO

```text
GET    /api/v1/room-management/out-of-order
POST   /api/v1/room-management/out-of-order
PUT    /api/v1/room-management/out-of-order/{id}

POST   /api/v1/room-management/out-of-order/{id}/release
```

## OOS

```text
GET    /api/v1/room-management/out-of-service
POST   /api/v1/room-management/out-of-service

POST   /api/v1/room-management/out-of-service/{id}/release
```

## Amenities / Features

```text
GET    /api/v1/room-management/amenities
POST   /api/v1/room-management/amenities

GET    /api/v1/room-management/features
POST   /api/v1/room-management/features
```

---

# 62. Room Status API Security

A status update endpoint must not trust the frontend alone.

Example:

```text
POST /api/v1/room-management/rooms/{id}/status
```

Backend must validate:

1. Authenticated user.
2. Tenant.
3. Property/branch scope.
4. Required permission.
5. Allowed transition.
6. Room current state.
7. Audit information.

---

# 63. Concurrency

## NFR-CON-001

The system should prevent accidental overwriting when two users edit the same room record.

Recommended approaches:

- Row version / optimistic concurrency
- UpdatedAt comparison
- ETag/version token

---

# 64. Performance

## NFR-PERF-001

Room list screens should normally return within approximately 2 seconds under expected hotel operating load.

## NFR-PERF-002

Room filters should support indexed fields such as:

- TenantId
- PropertyId
- BranchId
- BuildingId
- FloorId
- RoomTypeId
- OperationalStatus
- SellabilityStatus

---

# 65. Security

## NFR-SEC-001

All Room Management APIs shall require authentication unless explicitly public.

## NFR-SEC-002

Every query must be tenant scoped.

## NFR-SEC-003

Property and branch restrictions must be enforced server-side.

## NFR-SEC-004

Sensitive overrides shall require dedicated permissions.

---

# 66. Data Integrity

## NFR-DATA-001

Foreign keys shall prevent invalid:

- Property
- Branch
- Building
- Floor
- Room Type

references.

## NFR-DATA-002

Physical deletion must be restricted where dependent records exist.

---

# 67. Multi-Property Support

The module must support hotels with different structures.

Example:

```text
Tenant
│
├── Yangon Hotel
│   ├── Main Tower
│   └── Garden Wing
│
└── Mandalay Hotel
    ├── Main Building
    └── Annex
```

Rooms from one property must never appear in another property's operational scope unless the user intentionally selects group-level reporting.

---

# 68. MVP Scope — P0

The first sellable Room Management version should include:

1. Room Type CRUD
2. Room CRUD
3. Bed Type
4. Building/Floor linkage
5. Room capacity
6. Smoking classification
7. Basic amenities
8. Operational status
9. Sellability status
10. OOO
11. Active/Inactive
12. Search/filter
13. Bulk room creation
14. Branch/property access security
15. Audit logging
16. Basic room reports

---

# 69. P1 Enhancements

Add after MVP:

1. Room images
2. Detailed features
3. Connecting rooms
4. Accessible-room attributes
5. OOS workflow
6. Room notes
7. Amenity overrides
8. Room status board
9. Advanced history
10. Import rooms from Excel/CSV
11. Status-transition rules
12. Maintenance reference

---

# 70. P2 Enterprise Enhancements

Later enterprise features may include:

1. Digital-lock mapping
2. IoT room-device mapping
3. Smart-room controls
4. Energy-management integration
5. Floor-plan visualization
6. Advanced room compatibility rules
7. Revenue-management attributes
8. OTA mapping codes
9. External PMS/Channel Manager mapping
10. Building evacuation/safety references

---

# 71. Development Order

Recommended implementation sequence:

```text
1. Bed Type
      ↓
2. Amenity Master
      ↓
3. Room Type
      ↓
4. Room Type ↔ Amenity
      ↓
5. Room
      ↓
6. Bulk Room Creation
      ↓
7. Search / Filters
      ↓
8. Operational Status
      ↓
9. Sellability Status
      ↓
10. OOO
      ↓
11. Status History
      ↓
12. Audit
      ↓
13. Reports
      ↓
14. P1 Features
```

---

# 72. Recommended MVP User Flow

Hotel administrator:

```text
Create Room Types
       ↓
Configure Amenities
       ↓
Create Rooms
       ↓
Assign Building & Floor
       ↓
Verify Capacity
       ↓
Activate Rooms
       ↓
Rooms become available
to Reservation / Front Desk
```

---

# 73. Operational Example

Hotel setup:

```text
Golden Hotel Yangon

Main Tower

Floor 1
├── 101 Standard King
├── 102 Standard Twin
└── 103 Standard King

Floor 2
├── 201 Deluxe King
├── 202 Deluxe Twin
└── 203 Deluxe King
```

Room 201:

```text
Room Type: Deluxe King
Bed: King
Max Adults: 2
Max Children: 1
Operational Status: Vacant Clean
Sellability: Sellable

Amenities:
✓ Wi-Fi
✓ TV
✓ Mini Bar
✓ Safe
✓ Bathtub
```

Reservation module can now use Room 201.

---

# 74. Example OOO Flow

```text
Room 201
Vacant Clean
Sellable
      ↓
AC Failure Reported
      ↓
Mark Out of Order
      ↓
Reservation/Front Desk
cannot assign Room 201
      ↓
Maintenance completes repair
      ↓
Release OOO
      ↓
Room becomes Vacant Dirty
      ↓
Housekeeping cleans
      ↓
Vacant Clean
      ↓
Sellable
```

---

# 75. Example Check-Out / Housekeeping Flow

```text
Room 201
Occupied Clean
      ↓
Guest Check-Out
      ↓
Vacant Dirty
      ↓
Housekeeping Task
      ↓
Cleaning
      ↓
Cleaning Complete
      ↓
Vacant Clean
      ↓
Ready for next guest
```

This workflow requires integration between Module 3, Front Desk, and Housekeeping.

---

# 76. Completion Criteria

Module 3 shall be considered functionally complete for MVP when:

- Room types can be created and maintained.
- Rooms can be created and maintained.
- Multiple rooms can be created in bulk.
- Rooms can be assigned to valid properties, branches, buildings, and floors.
- Room capacity is stored correctly.
- Amenities can be associated with room types.
- Rooms can be activated/deactivated.
- Operational room status can be viewed and controlled.
- OOO rooms can be created and released.
- OOO rooms are prevented from normal operational assignment.
- Search/filter works by room, type, floor, building, and status.
- Users can only access authorized hotel properties/branches.
- Room changes are audited.
- Room data can be consumed by the Reservation module.

---

# 77. Final Functional Outcome

After Module 3 is completed, the system should be able to represent a hotel like:

```text
Golden Hotel Yangon
│
├── Main Tower
│   │
│   ├── Floor 1
│   │   ├── 101 — Standard King — Vacant Clean
│   │   ├── 102 — Standard Twin — Occupied
│   │   └── 103 — Standard King — Vacant Dirty
│   │
│   └── Floor 2
│       ├── 201 — Deluxe King — Vacant Clean
│       ├── 202 — Deluxe Twin — Cleaning
│       └── 203 — Deluxe King — Out of Order
│
└── Garden Wing
    └── Floor 1
        ├── G101 — Villa King
        └── G102 — Villa Twin
```

The Reservation, Front Desk, Housekeeping, Maintenance, Billing, and Reporting modules can then rely on the Room Management module as the authoritative source for hotel room inventory.

---

# 78. Summary

Module 3 is responsible for:

```text
"What rooms does the hotel have?"
"What type is each room?"
"Where is each room?"
"What can each room accommodate?"
"What facilities does each room have?"
"What condition/status is the room in?"
"Can this room currently be sold or assigned?"
```

It should not decide who is staying in the room or how much they pay. Those responsibilities belong to later Reservation, Front Desk, Rate, and Billing modules.
