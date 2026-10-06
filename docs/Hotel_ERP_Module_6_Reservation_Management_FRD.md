# Hotel ERP — Module 6: Reservation Management
## Functional Requirements Document (FRD)

**Product:** Multi-Property Hotel ERP  
**Module:** Module 6 — Reservation Management  
**Version:** 1.0  
**Document Type:** Functional Requirements Document  
**Priority:** Critical / Core PMS Module  
**Target Users:** Hotels, Resorts, Serviced Apartments, Hourly Hotels, Day-Use Hotels, Hotel Groups, Multi-Property Hospitality Businesses

---

# 1. Purpose

The Reservation Management module manages hotel bookings before check-in.

It connects the core data from earlier modules:

```text
Guest Management
        +
Room Management
        +
Rate Management
        +
Property / Branch Setup
        ↓
Reservation
```

The module shall support:

- Availability search
- Overnight, hourly, and day-use bookings
- Guest selection
- Room-type selection
- Rate-plan selection
- Price calculation and price snapshot
- Optional physical-room assignment
- Reservation confirmation
- Modification
- Cancellation
- No-show processing
- Waitlist
- Group and multi-room reservations
- Deposit / guarantee tracking
- Booking-source tracking
- Reservation history and audit

---

# 2. Business Objective

The objective is to provide one controlled booking workflow for all hotel reservation types.

The system shall support:

1. Overnight reservations
2. Hourly reservations
3. Day-use reservations
4. Individual reservations
5. Multi-room reservations
6. Group reservations
7. Corporate reservations
8. Travel-agent reservations
9. Direct bookings
10. Phone/email bookings
11. Future website / OTA bookings
12. Reservation modification
13. Cancellation
14. No-show
15. Waitlist
16. Deposit / guarantee tracking
17. Booking-source tracking
18. Room-type inventory control
19. Optional physical-room assignment
20. Rate snapshot preservation
21. Audit logging

---

# 3. Dependencies

## 3.1 Organization & Property Setup

Reservation requires:

- Tenant
- Company
- Property
- Branch
- Business Date
- Currency
- Tax configuration
- Number sequence

## 3.2 User, Role & Permission Management

Example permissions:

```text
RESERVATION.BOOKING.VIEW
RESERVATION.BOOKING.CREATE
RESERVATION.BOOKING.UPDATE
RESERVATION.BOOKING.CONFIRM
RESERVATION.BOOKING.CANCEL
RESERVATION.BOOKING.NO_SHOW

RESERVATION.ROOM.ASSIGN
RESERVATION.ROOM.CHANGE

RESERVATION.RATE.OVERRIDE
RESERVATION.RATE.REPRICE

RESERVATION.GROUP.CREATE
RESERVATION.GROUP.UPDATE

RESERVATION.REPORT.VIEW
RESERVATION.REPORT.EXPORT
```

## 3.3 Room Management

Reservation uses:

- Room Type
- Room
- Capacity
- Operational Status
- Sellability
- Out-of-Order / Out-of-Service periods
- Features
- Turnaround / cleaning buffer

## 3.4 Rate Management

Reservation uses:

- Stay Type
- Rate Plan
- Rate Calendar
- Hourly Rate Tier
- Day-Use Rate
- Seasonal Rate
- Weekday / Weekend Rate
- Occupancy Charges
- Cancellation Policy
- Deposit Policy
- MinLOS / MaxLOS
- CTA / CTD
- Tax / Service Charge rules
- Promotions / Corporate / Travel Agent rates

## 3.5 Guest Management

Reservation uses:

- Guest Profile
- Guest Contact
- Guest Preferences
- VIP status
- Restriction warnings
- Companion guest references

---

# 4. Scope

## 4.1 In Scope

1. Reservation Search
2. Availability Search
3. New Reservation
4. Individual Reservation
5. Multi-Room Reservation
6. Group Reservation
7. Corporate Reservation
8. Travel Agent Reservation
9. Overnight Reservation
10. Hourly Reservation
11. Day-Use Reservation
12. Room Type Selection
13. Optional Room Assignment
14. Rate Plan Selection
15. Rate Calculation
16. Rate Snapshot
17. Guest Selection
18. Companion / Occupant Details
19. Booking Source
20. Market Segment
21. Reservation Status
22. Confirmation
23. Guarantee / Deposit Requirement
24. Reservation Modification
25. Date / Time Change
26. Room Type Change
27. Rate Plan Change
28. Room Assignment Change
29. Cancellation
30. No-Show
31. Waitlist
32. Special Requests
33. Reservation Notes
34. Reservation History
35. Confirmation Number
36. Confirmation document trigger
37. Duplicate Booking Warning
38. Overbooking Control
39. Multi-Property Search
40. Audit Logging
41. Reservation Reports

---

# 5. Out of Scope

- Check-in
- Check-out
- Folio posting
- Payment gateway processing
- Cashier settlement
- Housekeeping task management
- Maintenance work-order management
- OTA synchronization
- Channel Manager distribution
- Revenue-management AI
- Loyalty point earning
- CRM campaigns

---

# 6. Core Reservation Concept

A reservation records:

```text
WHO?
Guest

WHERE?
Property / Room Type / Optional Room

WHEN?
Arrival DateTime → Departure DateTime

HOW?
Stay Type

HOW MUCH?
Rate Plan + Confirmed Rate Snapshot

STATUS?
Confirmed / Cancelled / No-Show / etc.
```

---

# 7. Stay Types

## FR-RES-001 — Supported Stay Types

```text
Overnight
Hourly
Day Use
```

The available Stay Types must respect the Property Stay Policy.

Example:

```text
Property: City Day Hotel

✓ Hourly
✓ Day Use
✗ Overnight
```

Reservation must reject Overnight booking for this property.

---

# 8. Reservation Types

## FR-RES-002

```text
Individual
Multi-Room
Group
Corporate
Travel Agent
Internal / Complimentary
```

Reservation Type and Booking Source are separate concepts.

---

# 9. Booking Sources

## FR-SOURCE-001

Examples:

```text
Walk-In
Phone
Email
Hotel Website
Facebook
Messenger
Viber
Corporate
Travel Agent
Booking.com
Agoda
Expedia
Other OTA
Other
```

Booking Source shall be configurable and reportable.

---

# 10. Market Segment

## FR-SOURCE-002

Examples:

```text
Leisure
Business
Corporate
Government
Group
Tour
OTA
Travel Agent
Long Stay
Local
International
Other
```

---

# 11. Reservation Status

## FR-STATUS-001

Recommended statuses:

```text
Inquiry
Tentative
Pending Guarantee
Confirmed
Waitlisted
Checked-In
Checked-Out
Cancelled
No-Show
Expired
```

Checked-In and Checked-Out will be triggered by the future Front Desk module.

---

# 12. Reservation Status Flow

```text
Inquiry
   ↓
Tentative
   ↓
Pending Guarantee
   ↓
Confirmed
   ↓
Checked-In
   ↓
Checked-Out
```

Alternative flows:

```text
Confirmed → Cancelled
Confirmed → No-Show
Waitlisted → Confirmed
Tentative → Expired
```

---

# 13. Create Reservation

## FR-RES-003 — Create Reservation

Required information:

- Property
- Stay Type
- Primary Guest
- Arrival DateTime
- Departure DateTime
- Room Type
- Number of Rooms
- Adults
- Children
- Rate Plan
- Booking Source
- Reservation Status

Optional:

- Physical Room
- Corporate Account
- Travel Agent
- Market Segment
- Promo Code
- Special Requests
- Notes
- Companion Guests
- Estimated Arrival / Departure
- Transportation information
- Guarantee Method
- Deposit reference

---

# 14. Reservation Number

## FR-RES-004

Every reservation shall receive a unique immutable number.

Example:

```text
YGN-RES-2026-000001
```

Numbering shall use configured number sequences.

---

# 15. Primary Guest

## FR-GUEST-001

Reservation flow shall:

1. Search Guest Management.
2. Select existing guest where found.
3. Create a new guest only when required.
4. Link the GuestId to the reservation.

---

# 16. Guest Snapshot

## FR-GUEST-002

Reservation should store booking-specific snapshots where historical accuracy is required.

Examples:

- Guest Display Name
- Booking Phone
- Booking Email
- Billing Company

Guest Master changes later must not corrupt historical booking data.

---

# 17. Accompanying Guests

## FR-GUEST-003

A reservation may contain accompanying guests.

Fields may include:

- GuestId if existing
- Name
- Adult / Child category
- Age where required
- Identity reference where required
- Primary / Companion indicator

---

# 18. Occupancy

## FR-OCC-001

Reservation shall capture occupancy per room line:

- Adults
- Children
- Infants if configured

Room Management capacity rules must be validated.

---

# 19. Child Age Rules

## FR-OCC-002

Reservation shall use Rate Management age-band configuration.

Example:

```text
0–5   → Infant / Free
6–11  → Child
12+   → Adult
```

---

# 20. Availability Search

## FR-AVL-001

Search inputs:

- Property
- Stay Type
- Arrival DateTime
- Departure DateTime
- Number of Rooms
- Adults
- Children
- Room Type optional
- Features optional

Search results shall include:

- Available Room Types
- Remaining Inventory
- Eligible Rates
- Restrictions
- Estimated Total

---

# 21. Overnight Availability

## FR-AVL-002

Example:

```text
Arrival:   10-Oct
Departure: 13-Oct
```

Consumed nights:

```text
10-Oct
11-Oct
12-Oct
```

The departure date is not normally a consumed night.

---

# 22. Hourly Availability

## FR-AVL-003

Hourly reservation availability shall use DateTime overlap.

Example:

```text
Room 101

Booking A:
09:00–12:00

Cleaning Buffer:
30 min

Next Available:
12:30
```

---

# 23. Day-Use Availability

## FR-AVL-004

Day-use reservations shall:

- Respect configured Day-Use hours
- Respect room overlap
- Respect turnaround buffer
- Respect latest check-in rules
- Reject overnight crossover when not allowed

---

# 24. Availability Formula

Availability must consider at minimum:

```text
Physical / Sellable Inventory
-
Confirmed Reservations
-
Tentative Holds if configured
-
Checked-In Occupancy
-
Out-of-Order Rooms
-
Out-of-Service Rooms if inventory-impacting
-
Cleaning / Turnaround Buffer
=
Available Inventory
```

---

# 25. Room Type Inventory

## FR-AVL-005

Reservations shall normally sell inventory at Room Type level.

Example:

```text
Deluxe King

Physical Sellable Rooms: 10
Reserved:                 7
OOO:                      1
Available:                2
```

A physical room does not need to be assigned at booking time.

---

# 26. Physical Room Assignment

## FR-ROOM-001

Physical room assignment may be:

```text
Unassigned
Pre-Assigned
Assigned at Check-In
```

Example:

```text
Reservation Room Type:
Deluxe King

Assigned Room:
205
```

---

# 27. Room Assignment Validation

## FR-ROOM-002

Assigned Room must:

- Belong to selected property
- Match reserved Room Type unless authorized change/upgrade
- Be sellable during the stay
- Not conflict with another reservation
- Not be OOO during the stay
- Respect hourly overlap
- Respect turnaround buffer

---

# 28. Room Preference vs Assignment

Guest preference does not automatically guarantee or assign a physical room.

Example:

```text
Preference:
High Floor

Reserved:
Deluxe King
```

A specific Room is guaranteed only when explicitly assigned according to hotel policy.

---

# 29. Multi-Room Reservation

## FR-MULTI-001

One Reservation may contain multiple room lines.

Example:

```text
Reservation RES-001

Primary Guest:
Aung Aung

Room Line 1:
Deluxe King
2 Adults

Room Line 2:
Standard Twin
2 Adults
```

Recommended model:

```text
Reservation
    ↓
ReservationRoom
    ↓
ReservationRateDetail
```

---

# 30. Reservation Header

Header fields may include:

- Reservation Number
- Property
- Primary Guest
- Booking Source
- Market Segment
- Corporate / Travel Agent reference
- Overall Status
- Contact snapshots
- General Notes
- Created By / Created At

---

# 31. Reservation Room Line

Each Room Line should include:

- Room Type
- Assigned Room optional
- Stay Type
- Start DateTime
- End DateTime
- Adults
- Children
- Rate Plan
- Status
- Special Requests
- Price Summary

---

# 32. Rate Search

## FR-RATE-001

Reservation shall request eligible rates using:

```text
Property
Room Type
Stay Type
Arrival DateTime
Departure DateTime
Adults
Children
Booking Channel
Corporate Account
Travel Agent
Promo Code
```

---

# 33. Rate Selection

## FR-RATE-002

Example overnight rates:

```text
BAR Room Only      180,000 / night
BAR Breakfast      205,000 / night
Non-Refundable     165,000 / night
```

Example hourly/day-use rates:

```text
3 Hours   35,000
6 Hours   55,000
Day Use   70,000
```

---

# 34. Reservation Rate Snapshot

## FR-RATE-003

Confirmed reservation prices must remain independent from future rate changes.

Example:

```text
Booked: 180,000
Future Rate Updated To: 220,000
Existing Reservation: Still 180,000
```

unless explicitly repriced.

---

# 35. Nightly Rate Detail

For Overnight stays, store per-night pricing.

Example:

```text
10-Oct: 180,000
11-Oct: 180,000
12-Oct: 220,000
```

Do not use only one average price as the authoritative record.

---

# 36. Hourly Rate Detail

For Hourly stays, store:

- Selected Duration
- Start DateTime
- Planned End DateTime
- Package Rate
- Grace Period
- Extension Rule Snapshot
- Confirmed Package Price

Example:

```text
3-Hour Package
10:00–13:00
35,000 MMK
```

---

# 37. Tax / Service Charge Snapshot

## FR-RATE-004

Reservation shall preserve the tax/service-charge calculation used at confirmation.

---

# 38. Repricing

## FR-RATE-005

Reprice when applicable:

- Stay dates changed
- Stay time changed
- Room Type changed
- Rate Plan changed
- Occupancy changed
- Promotion added/removed
- Corporate rate applied

Before save, show:

```text
Old Total
New Total
Difference
```

---

# 39. Manual Rate Override

## FR-RATE-006

Required:

- Original Rate
- Override Rate
- Reason
- User
- Date / Time
- Approval if required

Permission:

```text
RESERVATION.RATE.OVERRIDE
```

---

# 40. Reservation Guarantee

## FR-GUA-001

Guarantee status:

```text
Not Required
Pending
Guaranteed
Expired
```

Guarantee methods may include:

```text
Deposit
Card Guarantee
Corporate Guarantee
Travel Agent Guarantee
Management Approval
Other
```

Payment processing belongs to the later Payment/Cashier module.

---

# 41. Deposit Requirement

## FR-GUA-002

Reservation shall read deposit requirements from the booked rate plan.

Track:

- Required Amount
- Paid Amount reference
- Due Date
- Deposit Status

Statuses:

```text
Not Required
Pending
Partially Paid
Paid
Waived
Expired
```

---

# 42. Tentative Reservation

## FR-TENT-001

Support:

- Tentative Until
- Expiry DateTime
- Reason
- Contact
- Inventory-hold behavior

Property configuration shall determine whether tentative reservations consume inventory.

---

# 43. Tentative Expiry

## FR-TENT-002

Expired tentative bookings may become:

```text
Expired
```

and release inventory according to property policy.

---

# 44. Waitlist

## FR-WAIT-001

When inventory is unavailable, authorized users may create waitlist entries.

Fields:

- Guest
- Property
- Room Type
- Stay Type
- Start / End DateTime
- Adults / Children
- Preferred Rate
- Priority
- Contact
- Notes
- Status

Statuses:

```text
Active
Offered
Confirmed
Declined
Expired
Cancelled
```

---

# 45. Overbooking Control

## FR-OVB-001

By default, the system shall prevent inventory from being sold below zero.

---

# 46. Controlled Overbooking

## FR-OVB-002

P1 may support authorized overbooking limits.

Example:

```text
Physical Inventory: 10
Overbooking Limit:   1
Maximum Sellable:   11
```

This requires explicit management permission and reporting.

---

# 47. Special Requests

## FR-REQ-001

Examples:

```text
High Floor
Non-Smoking
Twin Bed
Airport Pickup
Late Arrival
Baby Cot
Extra Bed
Connecting Rooms
Quiet Room
```

Request status may be:

```text
Requested
Confirmed
Unable to Fulfill
Completed
```

---

# 48. Reservation Notes

## FR-NOTE-001

Visibility may include:

```text
Reservation Team
Front Desk
Management
Housekeeping
All Operational Staff
```

Sensitive notes must be permission-controlled.

---

# 49. Modify Reservation

## FR-MOD-001

Allowed changes may include:

- Guest contact
- Arrival DateTime
- Departure DateTime
- Room Type
- Assigned Room
- Number of Rooms
- Occupancy
- Rate Plan
- Booking Source
- Special Requests
- Notes
- Guarantee information

---

# 50. Modification Revalidation

## FR-MOD-002

Any inventory or price-affecting change must revalidate:

- Availability
- Rate
- Restrictions
- Capacity
- Property Stay Policy

Example:

```text
Old Departure: 12-Oct
New Departure: 14-Oct

→ Check extra inventory
→ Recalculate rates
→ Check restrictions
```

---

# 51. Reservation Change History

## FR-MOD-003

Store before/after changes.

Example:

```text
Old Departure: 12-Oct
New Departure: 14-Oct
Changed By: reservation01
Changed At: 06-Oct-2026 10:15
```

---

# 52. Cancellation

## FR-CAN-001

Required:

- Cancellation Reason
- Cancellation DateTime
- Cancelled By
- Policy Result
- Penalty reference if applicable

Example reasons:

```text
Guest Request
Duplicate Booking
Payment Not Received
Travel Cancelled
Hotel Operational Issue
Other
```

---

# 53. Cancellation Policy Evaluation

## FR-CAN-002

Use the booked cancellation-policy snapshot.

Example:

```text
Free Until: 09-Oct 14:00
Cancelled: 10-Oct 09:00
Penalty: 1 Night
```

Actual charge posting belongs to Billing / Payment.

---

# 54. Cancelled Inventory Release

## FR-CAN-003

Cancelled inventory shall be released immediately unless explicit business rules require otherwise.

---

# 55. No-Show

## FR-NS-001

The system shall:

- Record No-Show DateTime
- Record user
- Evaluate No-Show Policy
- Release remaining inventory
- Preserve reservation history

---

# 56. Duplicate Booking Detection

## FR-DUP-001

Potential duplicate criteria:

- Same Guest
- Same Property
- Overlapping DateTime
- Same Room Type
- Same phone/contact
- Same external reference

Example warning:

```text
Possible duplicate reservation detected.
Guest already has a booking for this period.
```

---

# 57. Corporate Reservation

## FR-CORP-001

Corporate reference may affect:

- Eligible Rate
- Billing Instruction
- Guarantee
- Credit Terms
- Reporting
- Contact Person

---

# 58. Travel Agent Reservation

## FR-TA-001

Travel Agent reference may affect:

- Travel Agent Rate
- Commission
- Guarantee
- Voucher
- External Booking Reference
- Reporting

---

# 59. External Booking Reference

## FR-EXT-001

Support:

```text
OTA Confirmation Number
Travel Agent Voucher Number
Corporate Reference
Website Booking Reference
```

---

# 60. Group Reservation

## FR-GRP-001

Example:

```text
Group: ABC Annual Meeting
20 Rooms
10–12 Oct

10 Standard
8 Deluxe
2 Suite
```

Fields may include:

- Group Name
- Group Code
- Organizer
- Company
- Arrival / Departure
- Room Block
- Rate Agreement
- Cut-Off Date
- Notes

---

# 61. Group Room Block

## FR-GRP-002

Group inventory may be blocked before individual guest names are known.

Example:

```text
10 Deluxe Rooms Blocked
6 Names Received
4 Unassigned
```

---

# 62. Group Cut-Off

## FR-GRP-003

After cut-off:

- Unused blocked inventory may be released.
- Confirmed named reservations remain.

This can be P1.

---

# 63. Reservation Hold

## FR-HOLD-001

Temporary inventory holds may be supported for online booking.

Example:

```text
Hold Duration: 5 Minutes
```

Expired hold releases inventory.

---

# 64. Multi-Property Search

## FR-MULTI-001

Authorized group users may search multiple properties.

Example:

```text
Yangon Hotel:   Deluxe Available
Mandalay Hotel: Deluxe Available
Bagan Resort:   Sold Out
```

A normal reservation still belongs to one property.

---

# 65. Confirmation

## FR-CONF-001

Confirmed reservations shall contain:

- Reservation Number
- Confirmation DateTime
- Confirmed By / Source
- Guest
- Property
- Stay Type
- Arrival / Departure
- Room Type
- Rate Plan
- Price Summary
- Cancellation terms
- Deposit requirement
- Special Requests

---

# 66. Confirmation Document

## FR-CONF-002

The system should support confirmation output for:

- Print
- PDF
- Email trigger
- Messaging trigger later

---

# 67. Reservation Search

## FR-SRCH-001

Search by:

- Reservation Number
- Guest Name
- Phone
- Email
- Property
- Branch
- Room Type
- Assigned Room
- Arrival
- Departure
- Stay Type
- Status
- Booking Source
- Corporate Customer
- Travel Agent
- External Reference

---

# 68. Reservation List

Suggested columns:

| Reservation | Guest | Stay Type | Room Type | Arrival | Departure | Status | Source |
|---|---|---|---|---|---|---|---|

---

# 69. Reservation Detail Screen

Suggested sections:

## Summary
- Reservation Number
- Status
- Property
- Booking Source
- Created By

## Guest
- Primary Guest
- Contact
- VIP / Restriction warning

## Stay
- Stay Type
- Arrival / Departure DateTime
- Occupancy

## Rooms
- Room Type
- Assigned Room
- Preferences

## Rate
- Rate Plan
- Nightly / Hourly breakdown
- Taxes / Service Charges
- Total

## Guarantee
- Deposit Requirement
- Guarantee Status

## Requests
- Special Requests
- Notes

## History
- Modifications
- Cancellation
- Audit

---

# 70. Reservation Calendar / Tape Chart

## FR-CAL-001

P1 should provide visual reservation planning.

Overnight example:

```text
          Oct 10    Oct 11    Oct 12
Room 101  [ John Smith      ]
Room 102            [ Aung Aung ]
Room 103  OOO
```

Hourly example:

```text
Room 101
09:00–12:00  Aung Aung
12:00–12:30  Cleaning Buffer
13:00–16:00  John Smith
```

---

# 71. Inventory Concurrency

## NFR-CON-001

The system must prevent two users from confirming the last available inventory simultaneously.

Recommended controls:

- Database transaction
- Inventory hold where appropriate
- Final availability recheck before confirmation
- Optimistic concurrency

---

# 72. Time Zone

## NFR-TIME-001

Reservation DateTime shall use the property's configured time zone.

Do not assume server time equals property local time.

---

# 73. Business Date

## NFR-TIME-002

Store both operational timestamps and hotel Business Date where required.

Example:

```text
System Local Time: 07-Oct 01:00
Hotel Business Date: 06-Oct
```

---

# 74. Permissions

Recommended permissions:

```text
RESERVATION.BOOKING.VIEW
RESERVATION.BOOKING.CREATE
RESERVATION.BOOKING.UPDATE
RESERVATION.BOOKING.CONFIRM
RESERVATION.BOOKING.CANCEL
RESERVATION.BOOKING.NO_SHOW

RESERVATION.ROOM.ASSIGN
RESERVATION.ROOM.CHANGE

RESERVATION.RATE.VIEW
RESERVATION.RATE.OVERRIDE
RESERVATION.RATE.REPRICE

RESERVATION.GUARANTEE.UPDATE

RESERVATION.WAITLIST.VIEW
RESERVATION.WAITLIST.MANAGE

RESERVATION.GROUP.VIEW
RESERVATION.GROUP.CREATE
RESERVATION.GROUP.UPDATE

RESERVATION.REPORT.VIEW
RESERVATION.REPORT.EXPORT
```

---

# 75. Organizational Scope Security

## FR-SEC-001

Users shall only manage reservations within authorized Property / Branch scope.

---

# 76. Sensitive Guest Data

## FR-SEC-002

Reservation screens shall respect Guest Management masking permissions.

---

# 77. Audit Logging

## FR-AUD-001

Audit at minimum:

```text
Reservation Created
Reservation Updated
Reservation Confirmed
Reservation Cancelled
Reservation Marked No-Show
Guest Changed
Stay Date/Time Changed
Room Type Changed
Room Assigned
Room Assignment Changed
Rate Plan Changed
Rate Repriced
Rate Overridden
Guarantee Updated
Waitlist Created
Group Block Changed
```

---

# 78. Business Rules

## BR-001
Every reservation belongs to one tenant and one property.

## BR-002
Every reservation must have a primary guest.

## BR-003
Every room line must have a valid Room Type.

## BR-004
Stay Type must be allowed by Property Stay Policy.

## BR-005
Start DateTime must be earlier than End DateTime.

## BR-006
Occupancy must not exceed Room Type capacity unless explicitly permitted.

## BR-007
Confirmed reservations consume inventory.

## BR-008
Tentative reservations consume inventory only according to configuration.

## BR-009
Cancelled / Expired reservations release inventory.

## BR-010
OOO rooms cannot be assigned during affected periods.

## BR-011
Physical room assignment is optional until hotel policy requires it.

## BR-012
Confirmed rate snapshots must not change automatically when Rate Management changes.

## BR-013
Modification affecting inventory or price requires revalidation.

## BR-014
Hourly reservations must use StartDateTime / EndDateTime.

## BR-015
Hourly reservations must respect turnaround buffer.

## BR-016
Day-Use-Only properties cannot accept Overnight reservations.

## BR-017
Cancellation uses the booked cancellation policy snapshot.

## BR-018
No-show processing preserves reservation history.

## BR-019
Organizational scope is enforced server-side.

## BR-020
Critical changes are audited.

---

# 79. Validation Rules

## VAL-001
Property is required.

## VAL-002
Primary Guest is required.

## VAL-003
Stay Type is required.

## VAL-004
Arrival / Start DateTime is required.

## VAL-005
Departure / End DateTime is required.

## VAL-006
End DateTime must be after Start DateTime.

## VAL-007
At least one Room Line is required.

## VAL-008
Room Type is required.

## VAL-009
Number of Rooms must be greater than zero.

## VAL-010
Occupancy must be valid.

## VAL-011
Rate Plan is required for normal confirmed bookings.

## VAL-012
Rate must be valid for requested stay period.

## VAL-013
MinLOS / MaxLOS must be respected.

## VAL-014
CTA / CTD must be respected.

## VAL-015
Hourly duration must match package rules unless authorized extension/override applies.

## VAL-016
Conflicting physical-room assignments are prohibited.

## VAL-017
Cancellation Reason is required.

## VAL-018
Rate Override Reason is required.

---

# 80. Suggested Database Model

## Reservation

```text
Id
TenantId
CompanyId
PropertyId
BranchId

ReservationNumber
PrimaryGuestId

ReservationType
BookingSourceId
MarketSegmentId

CorporateAccountId nullable
TravelAgentId nullable
ExternalReference

Status
CurrencyId

ContactPhoneSnapshot
ContactEmailSnapshot
GuestNameSnapshot

GuaranteeStatus
DepositRequiredAmount
DepositPaidAmount

GeneralNotes

CreatedAt
CreatedBy
UpdatedAt
UpdatedBy

ConfirmedAt nullable
ConfirmedBy nullable

CancelledAt nullable
CancelledBy nullable
CancellationReasonId nullable

NoShowAt nullable
NoShowBy nullable
```

## ReservationRoom

```text
Id
ReservationId

RoomTypeId
AssignedRoomId nullable

StayType
StartDateTime
EndDateTime

Adults
Children
Infants

RatePlanId
Status
SpecialRequestSummary
```

## ReservationRateDetail

Overnight:

```text
Id
ReservationRoomId
StayDate
BaseRate
OccupancyCharge
ExtraBedCharge
DiscountAmount
ServiceCharge
TaxAmount
TotalAmount
RateSource
RateSnapshotJson
```

Hourly / Day Use:

```text
Id
ReservationRoomId
StartDateTime
EndDateTime
DurationMinutes
PackageRate
ExtensionRate
DiscountAmount
ServiceCharge
TaxAmount
TotalAmount
RateSnapshotJson
```

## ReservationGuest

```text
Id
ReservationId
ReservationRoomId nullable
GuestId nullable
GuestNameSnapshot
GuestType
AdultChildType
Age nullable
IsPrimary
```

## ReservationRequest

```text
Id
ReservationId
ReservationRoomId nullable
RequestType
RequestText
Status
CreatedAt
CreatedBy
```

## ReservationNote

```text
Id
ReservationId
NoteType
NoteText
VisibilityScope
CreatedAt
CreatedBy
```

## ReservationStatusHistory

```text
Id
ReservationId
PreviousStatus
NewStatus
Reason
ChangedAt
ChangedBy
```

## ReservationGuarantee

```text
Id
ReservationId
GuaranteeType
Status
RequiredAmount
DueDateTime
PaymentReferenceId nullable
CorporateReference nullable
TravelAgentReference nullable
UpdatedAt
UpdatedBy
```

## Waitlist

```text
Id
TenantId
PropertyId
GuestId
RoomTypeId
StayType
StartDateTime
EndDateTime
Adults
Children
PreferredRatePlanId nullable
Priority
Status
Notes
CreatedAt
CreatedBy
```

---

# 81. Recommended Relationships

```text
Guest
  │
  └── Reservation
          │
          ├── ReservationRoom
          │       │
          │       ├── RoomType
          │       ├── Room optional
          │       └── ReservationRateDetail
          │
          ├── ReservationGuest
          ├── ReservationNote
          ├── ReservationRequest
          ├── ReservationGuarantee
          └── ReservationStatusHistory
```

---

# 82. Recommended API Endpoints

## Availability

```text
POST /api/v1/reservations/availability/search
```

## Reservations

```text
GET    /api/v1/reservations
POST   /api/v1/reservations
GET    /api/v1/reservations/{id}
PUT    /api/v1/reservations/{id}

POST   /api/v1/reservations/{id}/confirm
POST   /api/v1/reservations/{id}/cancel
POST   /api/v1/reservations/{id}/no-show
POST   /api/v1/reservations/{id}/reprice
```

## Room Assignment

```text
POST /api/v1/reservations/{id}/rooms/{roomLineId}/assign
POST /api/v1/reservations/{id}/rooms/{roomLineId}/change-room
```

## Waitlist

```text
GET  /api/v1/reservations/waitlist
POST /api/v1/reservations/waitlist
PUT  /api/v1/reservations/waitlist/{id}
```

---

# 83. Availability Search Request Examples

Overnight:

```json
{
  "propertyId": "property-id",
  "stayType": "OVERNIGHT",
  "arrivalDateTime": "2026-10-10T14:00:00",
  "departureDateTime": "2026-10-13T12:00:00",
  "adults": 2,
  "children": 1,
  "rooms": 1
}
```

Hourly:

```json
{
  "propertyId": "property-id",
  "stayType": "HOURLY",
  "arrivalDateTime": "2026-10-10T10:00:00",
  "departureDateTime": "2026-10-10T13:00:00",
  "adults": 2,
  "children": 0,
  "rooms": 1
}
```

---

# 84. Create Reservation Flow

```text
1. Select Property
        ↓
2. Select Stay Type
        ↓
3. Enter Arrival / Departure
        ↓
4. Enter Occupancy
        ↓
5. Search Availability
        ↓
6. Select Room Type
        ↓
7. Select Rate Plan
        ↓
8. Search / Create Guest
        ↓
9. Add Requests / Notes
        ↓
10. Review Price & Policies
        ↓
11. Guarantee / Deposit
        ↓
12. Confirm Reservation
        ↓
13. Generate Reservation Number
```

---

# 85. Hourly Reservation Example

```text
Property:
Yangon City Hotel

Guest:
Aung Min

Stay Type:
Hourly

Date:
10-Oct-2026

Start:
10:00

Package:
3 Hours

Planned End:
13:00

Room Type:
Standard

Rate:
35,000 MMK

Physical Room:
Not assigned yet

Status:
Confirmed
```

---

# 86. Overnight Reservation Example

```text
Guest:
John Smith

Arrival:
10-Oct-2026 14:00

Departure:
13-Oct-2026 12:00

Room Type:
Deluxe King

Rate Plan:
BAR Breakfast

Nightly Rates:
10-Oct 180,000
11-Oct 180,000
12-Oct 220,000

Room Subtotal:
580,000

Status:
Confirmed
```

---

# 87. Reservation Reports

Minimum reports:

1. Reservation List
2. Arrival Report
3. Departure Report
4. Reservation by Status
5. Reservation by Booking Source
6. Reservation by Room Type
7. Reservation by Rate Plan
8. Reservation by Stay Type
9. Hourly Reservation Report
10. Day-Use Reservation Report
11. Cancellation Report
12. No-Show Report
13. Waitlist Report
14. Tentative / Expiring Reservation Report
15. Reservation Modification Report
16. Reservation Rate Override Report
17. Corporate Reservation Report
18. Travel Agent Reservation Report
19. Group Reservation Report
20. Future Occupancy / Pickup Report

---

# 88. Performance

## NFR-PERF-001
Normal availability searches should normally return within approximately 1–2 seconds under expected operating load.

## NFR-PERF-002
Recommended indexes:

```text
TenantId
PropertyId
Status
StartDateTime
EndDateTime
RoomTypeId
AssignedRoomId
PrimaryGuestId
ReservationNumber
BookingSourceId
```

---

# 89. Security

## NFR-SEC-001
All Reservation APIs require authentication.

## NFR-SEC-002
Tenant isolation is mandatory.

## NFR-SEC-003
Property / Branch scope is validated server-side.

## NFR-SEC-004
Rate overrides require explicit permission.

## NFR-SEC-005
Sensitive guest data follows Guest Management permissions.

---

# 90. MVP Scope — P0

1. Availability Search
2. Overnight Reservation
3. Hourly Reservation
4. Day-Use Reservation
5. Guest Search / Selection
6. Room Type Selection
7. Rate Plan Selection
8. Rate Calculation
9. Rate Snapshot
10. Reservation Number
11. Reservation Status
12. Create Reservation
13. Confirm Reservation
14. Modify Reservation
15. Cancel Reservation
16. No-Show
17. Optional Physical Room Assignment
18. Booking Source
19. Occupancy Validation
20. Special Requests
21. Internal Notes
22. Basic Guarantee / Deposit Tracking
23. Duplicate Booking Warning
24. Inventory Conflict Prevention
25. Search / Filters
26. Audit Logging
27. Basic Reports

---

# 91. P1 Enhancements

1. Multi-Room Reservation
2. Group Reservation
3. Group Room Block
4. Waitlist
5. Tentative Expiry
6. Controlled Overbooking
7. Rooming List
8. Corporate Reservation
9. Travel Agent Reservation
10. Reservation Calendar / Tape Chart
11. Hourly Timeline View
12. Advanced Guarantee Rules
13. Confirmation PDF
14. Email / SMS Trigger
15. Reservation Hold
16. Advanced Duplicate Detection
17. Cross-Property Search

---

# 92. P2 Enterprise Enhancements

1. OTA / Channel Manager integration
2. Website Booking Engine
3. Corporate Booking Portal
4. Travel Agent Portal
5. Automated Waitlist Conversion
6. Advanced Forecasting
7. Revenue Pickup Analytics
8. Central Reservation Office
9. Multi-Property Itinerary
10. AI-assisted room / rate recommendations

---

# 93. Recommended Development Order

```text
1. Reservation Header
      ↓
2. Reservation Room Line
      ↓
3. Availability Search
      ↓
4. Guest Search / Selection
      ↓
5. Rate Search / Selection
      ↓
6. Rate Snapshot
      ↓
7. Overnight Booking
      ↓
8. Hourly Booking
      ↓
9. Day-Use Booking
      ↓
10. Confirmation
      ↓
11. Modification
      ↓
12. Cancellation
      ↓
13. No-Show
      ↓
14. Room Assignment
      ↓
15. Guarantee / Deposit Tracking
      ↓
16. Notes / Requests
      ↓
17. Audit / History
      ↓
18. Reports
      ↓
19. P1 Group / Waitlist / Calendar
```

---

# 94. Completion Criteria

Reservation Management is MVP-complete when:

- Users can search availability.
- Overnight availability is calculated correctly.
- Hourly availability uses DateTime overlap.
- Day-use policy is enforced.
- Users can select an existing or new guest.
- Users can select Room Type and Rate Plan.
- Reservation pricing is stored as a historical snapshot.
- Users can create and confirm reservations.
- Users can modify reservations.
- Modifications trigger availability and price revalidation.
- Users can cancel reservations.
- Users can process no-shows.
- Physical rooms may be assigned without conflicts.
- Property Stay Policy is respected.
- OOO rooms cannot be assigned.
- Duplicate booking warnings are shown.
- Organizational scope is enforced.
- Reservation changes are audited.
- Reservation data is ready for future Front Desk / Check-In.

---

# 95. Final Functional Outcome

After Module 6 is complete, the ERP can answer:

```text
Who is booking?
Which hotel?
What stay type?
When are they staying?
What room type?
Is inventory available?
What rate plan applies?
What is the confirmed price?
Is the booking guaranteed?
Has a physical room been assigned?
What is the reservation status?
```

The Reservation module becomes the bridge between:

```text
Guest
+
Room Inventory
+
Rate
+
Date / Time
=
Confirmed Booking
```

For hourly/day-use hotels, the critical architecture rule is:

```text
Availability must use DateTime,
not only Date.
```

This allows the same physical room to be sold multiple times on the same day when there is no overlap and the required turnaround buffer is respected.

---

# 96. Repository Implementation Note

The repository's delivered P0 scope, API and portal route, permission setup, additive schema migration, validation, and remaining integration limits are documented in [Module 6 Reservation Management implementation](module-6-reservation-management-implementation.md). This implementation supports one room per reservation. Multi-room/group workflows, Front Desk check-in/out and folio integration, payment processing, automated cancellation penalties, tentative expiry, channel integration, and P1/P2 analytics are not represented as delivered capabilities.
