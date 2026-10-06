# Hotel ERP — Module 7: Front Desk
## Functional Requirements Document (FRD)

**Product:** Multi-Property Hotel ERP  
**Module:** Module 7 — Front Desk  
**Version:** 1.0  
**Document Type:** Functional Requirements Document  
**Priority:** Critical / Core PMS Operations  
**Target Users:** Hotels, Resorts, Serviced Apartments, Hourly Hotels, Day-Use Hotels, Hotel Groups

---

# 1. Purpose

The Front Desk module manages the operational lifecycle of a guest stay from arrival through room assignment and check-in until the guest is ready for checkout.

It converts a reservation into an active stay.

```text
Reservation
   +
Guest Management
   +
Room Management
   +
Rate Management
   +
Deposit / Guarantee Information
        ↓
Front Desk Stay
```

The module answers:

- Has the guest arrived?
- Is the room ready?
- Which physical room is assigned?
- Has identity been verified?
- Has the required deposit/guarantee been satisfied?
- Has the guest checked in?
- Did the guest change room?
- Did the guest extend the stay?
- Is the guest due out?
- Is an hourly guest overstaying?
- Is the stay ready for checkout?

---

# 2. Business Objective

The system shall allow authorized front-desk users to:

1. View arrivals.
2. Search reservations.
3. Register walk-in guests.
4. Verify guest details.
5. Verify identity documents.
6. Assign physical rooms.
7. Change assigned rooms.
8. Check guests in.
9. Extend stays.
10. Handle early arrival.
11. Handle late arrival.
12. Handle early departure.
13. Handle late checkout requests.
14. Manage hourly/day-use stay timing.
15. Track in-house guests.
16. Track due-outs.
17. Track room readiness.
18. Capture operational notes.
19. Capture registration-card information.
20. Track key/card issuance.
21. Record vehicle / transport details if required.
22. Link deposits / guarantees.
23. Trigger room status changes.
24. Maintain stay history and audit logs.

---

# 3. Dependencies

## 3.1 Module 1 — Organization & Property Setup

Requires Tenant, Company, Property, Branch, Business Date, standard check-in/check-out time, and time zone.

## 3.2 Module 2 — User, Role & Permission Management

Example permissions:

```text
FRONTDESK.ARRIVAL.VIEW
FRONTDESK.CHECKIN.CREATE
FRONTDESK.WALKIN.CREATE
FRONTDESK.ROOM.ASSIGN
FRONTDESK.ROOM.CHANGE
FRONTDESK.STAY.EXTEND
FRONTDESK.EARLY_CHECKIN
FRONTDESK.LATE_CHECKOUT
FRONTDESK.OVERRIDE
FRONTDESK.INHOUSE.VIEW
FRONTDESK.REPORT.VIEW
```

## 3.3 Module 3 — Room Management

Uses Room, Room Type, operational status, sellability, OOO/OOS, Building/Floor, and room features.

## 3.4 Rate Management

Uses Stay Type, hourly/day-use rules, extension rules, grace period, overnight-conversion rules, rate plans, and extra charges.

## 3.5 Guest Management

Uses Guest Profile, ID documents, VIP, preferences, restrictions, and notes.

## 3.6 Reservation Management

Uses Reservation, planned arrival/departure, room type, rate snapshot, deposit requirement, guarantee status, and special requests.

---

# 4. Scope

## 4.1 In Scope

1. Front Desk Dashboard
2. Arrival List
3. In-House Guest List
4. Due-Out List
5. Walk-In Guest
6. Reservation Lookup
7. Pre-Check-In Review
8. Guest Verification
9. ID Verification
10. Guest Registration Card
11. Physical Room Assignment
12. Room Change
13. Check-In
14. Early Check-In
15. Late Arrival Handling
16. Stay Extension
17. Early Departure
18. Late Checkout Request
19. Hourly Stay Monitoring
20. Day-Use Stay Monitoring
21. Grace Period Handling
22. Stay Overrun / Extension
23. Key / Key Card Tracking
24. Deposit / Guarantee Validation
25. Special Requests
26. Front Desk Notes
27. Companion / Occupant Confirmation
28. Vehicle / Transport Details
29. Wake-Up Call Request
30. Room Status Integration
31. Stay Status History
32. Audit Logging
33. Front Desk Reports

---

# 5. Out of Scope

- Full guest folio accounting
- Restaurant POS
- Payment settlement
- Night Audit
- Housekeeping task assignment
- Maintenance work orders
- OTA synchronization
- Accounting journal posting

---

# 6. Core Concept

A Reservation is a planned stay. A Front Desk Stay represents the actual operational stay.

```text
Reservation
   ↓
Guest Arrives
   ↓
Front Desk Review
   ↓
Room Assigned
   ↓
Check-In
   ↓
In-House Stay
   ↓
Checkout Preparation
```

---

# 7. Front Desk Dashboard

## FR-FD-001

The dashboard shall show:

- Today's Arrivals
- Today's Departures
- In-House Guests
- Expected Hourly Arrivals
- Hourly Guests Nearing End Time
- Late Arrivals
- No-Show Candidates
- Rooms Ready
- Rooms Dirty
- Rooms Cleaning
- Rooms OOO / OOS
- Unassigned Reservations
- VIP Arrivals
- Restricted Guest Alerts
- Outstanding Deposit / Guarantee Alerts

---

# 8. Arrival List

## FR-FD-002

Filters:

- Property
- Branch
- Arrival Date
- Stay Type
- Status
- Room Type
- Assigned Room
- VIP
- Booking Source
- Deposit Status
- Guarantee Status

---

# 9. Reservation Lookup

## FR-FD-003

Search by:

- Reservation Number
- Guest Name
- Phone
- Email
- Room Number
- External Reference
- Arrival Date
- Company
- Travel Agent

---

# 10. Pre-Check-In Review

## FR-FD-004

Before check-in, show:

- Reservation status
- Primary guest
- Companions
- Identity status
- Stay type
- Arrival / departure
- Room type
- Assigned room
- Rate plan
- Deposit requirement
- Guarantee status
- VIP status
- Restriction warnings
- Special requests
- Notes

---

# 11. Check-In Eligibility

## FR-CI-001

A reservation may be checked in only if:

- Reservation is valid.
- Guest is active and not blocked without override.
- Stay date/time is valid.
- Property allows requested stay type.
- Assigned room is valid.
- Room is sellable.
- Room is ready or authorized override exists.
- Required guarantee conditions are met according to property policy.

---

# 12. Room Readiness

## FR-CI-002

Recommended ready states:

```text
Vacant Clean
Inspected
```

Normally disallowed:

```text
Vacant Dirty
Cleaning
Occupied
Out of Order
Out of Service
Inactive
```

---

# 13. Physical Room Assignment

## FR-ROOM-001

Authorized users shall assign a physical room. System shall validate:

- Property
- Branch
- Room Type
- Sellability
- Operational status
- Reservation overlap
- OOO / OOS
- Turnaround buffer
- Guest preferences where possible

---

# 14. Room Suggestions

## FR-ROOM-002

Suggested rooms may consider:

- Reserved Room Type
- Clean / Ready status
- Guest preference
- Floor preference
- Smoking preference
- Accessibility
- Connecting room request
- Building preference

---

# 15. Room Type Upgrade / Downgrade

## FR-ROOM-003

The system shall:

1. Check availability.
2. Check new rate.
3. Show price difference.
4. Require approval if complimentary upgrade or discount.
5. Save reason.
6. Reprice or preserve original rate according to selected action.

---

# 16. Room Change

## FR-ROOM-004

Required:

- Current Room
- New Room
- Reason
- Effective DateTime
- Changed By

Example reasons:

```text
Guest Request
Maintenance Issue
Noise Complaint
Upgrade
Operational Move
Management Decision
```

---

# 17. Old Room Status after Move

## FR-ROOM-005

Normally:

```text
Old Room → Vacant Dirty
New Room → Occupied
```

---

# 18. Check-In

## FR-CI-003

Check-In shall record:

- Stay ID
- Reservation ID
- Guest ID
- Room ID
- Check-In DateTime
- Checked-In By
- Occupants
- Registration confirmation
- Key/card information
- Deposit / guarantee status
- Notes

Reservation status becomes `Checked-In`.

---

# 19. Actual vs Planned Check-In

## FR-CI-004

Store both:

```text
Planned Arrival
Actual Check-In
```

---

# 20. Early Check-In

## FR-EARLY-001

Possible outcomes:

```text
Allowed Free
Allowed with Charge
Manager Approval Required
Not Allowed
```

System shall check room readiness, prior occupancy, pricing rule, and approval.

---

# 21. Late Arrival

## FR-LATE-001

Support:

```text
Late Arrival Expected
```

Fields:

- Expected Arrival Time
- Contact Confirmation
- Notes

---

# 22. Walk-In Guest

## FR-WALKIN-001

Flow:

```text
Search Guest
    ↓
Select Stay Type
    ↓
Search Availability
    ↓
Select Room Type
    ↓
Select Rate
    ↓
Assign Room
    ↓
Capture ID
    ↓
Deposit / Guarantee
    ↓
Check-In
```

---

# 23. Walk-In Rate

## FR-WALKIN-002

Walk-in rates shall come from Rate Management. Manual override requires permission.

---

# 24. Hourly Check-In

## FR-HR-001

Store:

- Actual Check-In DateTime
- Package Duration
- Planned Check-Out DateTime
- Grace Period
- Extension Rule
- Current Extension Status

---

# 25. Hourly Countdown / Alert

## FR-HR-002

Categories:

```text
Ending in 30 Minutes
Within Grace Period
Overdue
Extended
```

---

# 26. Hourly Stay Extension

## FR-HR-003

System shall:

1. Check room availability after current end time.
2. Check conflict with next reservation.
3. Apply configured extension pricing.
4. Calculate new planned end time.
5. Show added charge.
6. Save extension history.

---

# 27. Hourly Overstay

## FR-HR-004

When current time exceeds planned end + grace period, status becomes `Overdue` and applicable extension charge is calculated.

---

# 28. Day-Use Stay

## FR-DAY-001

Must respect:

- Day-use window
- Latest permitted end time
- Overnight restriction
- Extension rules
- Room availability

---

# 29. Stay Extension — Overnight

## FR-EXT-001

System shall:

1. Check room availability.
2. Check room continuity.
3. Recalculate additional nights.
4. Check restrictions.
5. Show new total.
6. Confirm extension.
7. Update departure.

---

# 30. Early Departure

## FR-EXT-002

System shall:

- Record new departure.
- Evaluate policy.
- Recalculate future charges if allowed.
- Release future inventory.
- Preserve original booking history.

---

# 31. Late Checkout

## FR-LCO-001

Possible rules:

```text
Free Until 13:00
50% Day Rate Until 18:00
Full Night After 18:00
Custom Hourly Charge
```

---

# 32. Late Checkout Validation

## FR-LCO-002

Check:

- Next reservation
- Cleaning buffer
- Room availability
- Property policy
- Approval
- Additional charge

---

# 33. In-House Guest List

## FR-INH-001

Show:

- Guest
- Room
- Room Type
- Check-In
- Planned Check-Out
- Stay Type
- VIP
- Special requests
- Stay status

---

# 34. Due-Out List

## FR-INH-002

For hourly stays, due-out must be DateTime-based.

---

# 35. Stay Status

Recommended:

```text
Expected Arrival
Checked-In
In-House
Due-Out
Extended
Overdue
Room Change Pending
Checkout Pending
Checked-Out
```

---

# 36. Guest Registration Card

## FR-REG-001

Capture:

- Guest Name
- Guest ID / Reservation
- Address
- Nationality
- ID Document
- Arrival
- Departure
- Room
- Occupants
- Signature reference if used
- Front Desk User
- Terms acknowledgment if configured

---

# 37. Companion / Occupant Confirmation

## FR-REG-002

At check-in, staff may confirm or update actual occupants. Occupancy and rate must be revalidated if needed.

---

# 38. Guest Identity Verification

## FR-ID-001

Front Desk shall be able to:

- View authorized masked/full ID information
- Add new identity document
- Mark identity as verified
- Record document used at check-in

---

# 39. VIP and Restriction Warning

## FR-GUEST-001

VIP should be visibly indicated. Restrictions shall show warnings according to permission and scope.

---

# 40. Deposit / Guarantee Validation

## FR-GUA-001

Before check-in, show:

- Deposit Required
- Deposit Paid
- Remaining Required
- Guarantee Status
- Guarantee Type

Property policy may block, warn, or require override.

---

# 41. Key / Key Card Management

## FR-KEY-001

Fields:

- Stay
- Room
- Key/Card Number
- Quantity
- Issued At
- Issued By
- Returned At
- Status

---

# 42. Key Status

```text
Issued
Returned
Lost
Deactivated
Replaced
```

---

# 43. Vehicle Information

## FR-VEH-001

Optional:

- Vehicle Number
- Vehicle Type
- Parking Slot
- Driver Name
- Notes

---

# 44. Wake-Up Call Request

## FR-WAKE-001

Fields:

- Room
- Requested Time
- Date
- Notes
- Status

---

# 45. Special Requests

Examples:

```text
Extra Bed
Baby Cot
Airport Pickup
High Floor
Quiet Room
Late Arrival
Connecting Room
```

Statuses:

```text
Requested
Confirmed
Completed
Unable to Fulfill
```

---

# 46. Front Desk Notes

## FR-NOTE-001

Types:

```text
General
Front Desk
Management
Housekeeping
Billing
Security
```

---

# 47. Room Status Integration

## FR-ROOM-006

Typical transitions:

```text
Check-In:
Vacant Clean → Occupied

Check-Out:
Occupied → Vacant Dirty

Room Change:
Old Room → Vacant Dirty
New Room → Occupied
```

---

# 48. Housekeeping Integration

Front Desk consumes room-cleaning status and may request priority cleaning. Full housekeeping workflow belongs to the Housekeeping module.

---

# 49. Maintenance Integration

If assigned room becomes unavailable, Front Desk shall show a warning and may suggest alternative rooms.

---

# 50. Check-Out Preparation

## FR-CO-001

Before actual checkout, review:

- Guest
- Room
- Planned departure
- Key return
- Billing/Folio status
- Mini-bar/service pending indicator when integrated
- Deposit/refund indicator

---

# 51. Early Check-Out for Hourly Stay

## FR-CO-002

Actual checkout time shall be stored. Package price normally remains as booked unless policy says otherwise.

---

# 52. Actual Check-Out Trigger

When checkout completes:

```text
Stay → Checked-Out
Reservation → Checked-Out
Room → Vacant Dirty
```

---

# 53. Front Desk Search

Search by:

- Guest Name
- Room
- Reservation Number
- Phone
- Stay Type
- Check-In DateTime
- Check-Out DateTime
- Status
- VIP
- Company
- Travel Agent

---

# 54. Front Desk Room Board

## FR-BOARD-001

Example:

```text
101  VC
102  IN-HOUSE
103  VD
104  CLEANING
105  DUE-OUT
106  OOO
```

Hourly timeline may show:

```text
Room 101
10:00–13:00 Aung Min
13:00–13:30 Cleaning
14:00–17:00 John Smith
```

---

# 55. Shift Handover Support

## FR-SHIFT-001

P1 may support:

- Outstanding Arrivals
- Due-Outs
- VIP Notes
- Pending Issues
- Handover Notes
- From User
- To User

---

# 56. Audit Logging

## FR-AUD-001

Audit:

```text
Guest Checked-In
Room Assigned
Room Changed
Early Check-In Approved
Late Checkout Approved
Stay Extended
Hourly Stay Extended
Walk-In Created
ID Verified
Deposit Override
Key Issued
Key Returned
Guest Occupancy Updated
Checkout Pending
```

---

# 57. Business Rules

## BR-001
Check-in requires an active valid guest/stay context.

## BR-002
Room must belong to selected property.

## BR-003
Room must be sellable.

## BR-004
OOO room cannot be assigned.

## BR-005
Room must not conflict with another stay/reservation.

## BR-006
Room type should match reservation unless authorized change occurs.

## BR-007
Occupancy must respect room capacity.

## BR-008
Guest restrictions must be evaluated before check-in.

## BR-009
Deposit/guarantee policy must be evaluated before check-in.

## BR-010
Room status changes shall be automatic where possible.

## BR-011
Hourly stays use DateTime, not date-only logic.

## BR-012
Hourly extension must check next reservation conflict.

## BR-013
Late checkout must check next reservation and cleaning buffer.

## BR-014
Walk-in price must come from Rate Management unless authorized override.

## BR-015
All critical actions must be audited.

---

# 58. Validation Rules

## VAL-001
Guest is required.

## VAL-002
Room is required before final check-in unless property workflow allows deferred assignment.

## VAL-003
Actual check-in DateTime is required.

## VAL-004
Assigned room must be valid and active.

## VAL-005
Room must not be OOO during stay.

## VAL-006
Hourly planned end must be after actual check-in.

## VAL-007
Stay extension must not create overlap.

## VAL-008
Room change reason is required.

## VAL-009
Early-check-in override reason is required when approval is needed.

## VAL-010
Late-checkout override reason is required when approval is needed.

---

# 59. Suggested Database Model

## Stay

```text
Id
TenantId
CompanyId
PropertyId
BranchId
ReservationId nullable
PrimaryGuestId
StayNumber
StayType
RoomTypeId
CurrentRoomId
PlannedArrivalDateTime
PlannedDepartureDateTime
ActualCheckInDateTime
ActualCheckOutDateTime nullable
Status
RatePlanId
CurrencyId
DepositStatus
GuaranteeStatus
CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

## StayGuest

```text
Id
StayId
GuestId nullable
GuestNameSnapshot
OccupantType
Age nullable
IsPrimary
IdentityVerified
CreatedAt
CreatedBy
```

## StayRoomHistory

```text
Id
StayId
FromRoomId nullable
ToRoomId
EffectiveDateTime
Reason
ChangedAt
ChangedBy
```

## StayExtension

```text
Id
StayId
OldDepartureDateTime
NewDepartureDateTime
ExtensionType
AdditionalAmount
RateReference
Reason
ApprovedBy nullable
CreatedAt
CreatedBy
```

## HourlyStayDetail

```text
Id
StayId
PackageDurationMinutes
OriginalPlannedEndDateTime
CurrentPlannedEndDateTime
GracePeriodMinutes
ExtensionPolicyType
TotalExtensionMinutes
TotalExtensionCharge
Status
```

## StayKey

```text
Id
StayId
RoomId
KeyIdentifier
Quantity
IssuedAt
IssuedBy
ReturnedAt nullable
Status
```

## StayNote

```text
Id
StayId
NoteType
NoteText
VisibilityScope
CreatedAt
CreatedBy
```

## StayStatusHistory

```text
Id
StayId
PreviousStatus
NewStatus
Reason
ChangedAt
ChangedBy
```

## GuestRegistration

```text
Id
StayId
GuestId
IdentityDocumentId nullable
AddressSnapshot
NationalitySnapshot
SignatureReference nullable
TermsAccepted
RegisteredAt
RegisteredBy
```

---

# 60. Recommended Relationships

```text
Reservation
    │
    └── Stay
         ├── StayGuest
         ├── StayRoomHistory
         ├── StayExtension
         ├── HourlyStayDetail
         ├── StayKey
         ├── StayNote
         ├── GuestRegistration
         └── StayStatusHistory
```

---

# 61. Recommended API Endpoints

## Dashboard

```text
GET /api/v1/front-desk/dashboard
GET /api/v1/front-desk/arrivals
GET /api/v1/front-desk/in-house
GET /api/v1/front-desk/due-outs
```

## Check-In

```text
POST /api/v1/front-desk/check-in
```

## Walk-In

```text
POST /api/v1/front-desk/walk-ins
```

## Room Assignment

```text
POST /api/v1/front-desk/stays/{stayId}/assign-room
POST /api/v1/front-desk/stays/{stayId}/change-room
```

## Extension

```text
POST /api/v1/front-desk/stays/{stayId}/extend
POST /api/v1/front-desk/stays/{stayId}/late-checkout
```

## Keys

```text
POST /api/v1/front-desk/stays/{stayId}/keys
POST /api/v1/front-desk/stays/{stayId}/keys/{keyId}/return
```

---

# 62. Check-In Flow

```text
1. Search Reservation / Walk-In
        ↓
2. Verify Guest
        ↓
3. Verify Identity
        ↓
4. Review Deposit / Guarantee
        ↓
5. Check Room Readiness
        ↓
6. Assign Room
        ↓
7. Confirm Occupants
        ↓
8. Capture Registration
        ↓
9. Issue Key
        ↓
10. Check-In
        ↓
11. Room → Occupied
```

---

# 63. Walk-In Flow

```text
Search / Create Guest
        ↓
Select Stay Type
        ↓
Search Available Room Type
        ↓
Select Rate
        ↓
Assign Physical Room
        ↓
Identity / Registration
        ↓
Deposit / Guarantee
        ↓
Check-In
```

---

# 64. Hourly Front Desk Flow

```text
Guest Arrives
    ↓
Check-In 10:00
    ↓
3-Hour Package
    ↓
Planned End 13:00
    ↓
Alert 12:30
    ↓
Guest Chooses Checkout or Extend
    ↓
If Extend:
Check Future Availability
    ↓
Apply Extension Price
```

---

# 65. Room Change Flow

```text
Guest in Room 205
        ↓
Requests Move
        ↓
Search Suitable Rooms
        ↓
Select Room 305
        ↓
Validate Availability
        ↓
Confirm Move
        ↓
205 → Vacant Dirty
305 → Occupied
        ↓
Save History
```

---

# 66. MVP Scope — P0

1. Front Desk Dashboard
2. Arrival List
3. Reservation Lookup
4. In-House List
5. Due-Out List
6. Walk-In
7. Guest Verification
8. Basic ID Verification
9. Room Assignment
10. Room Change
11. Check-In
12. Overnight Stay Extension
13. Hourly Stay Extension
14. Early Check-In
15. Late Checkout
16. Hourly Countdown / Overdue Indicator
17. Day-Use Handling
18. Occupancy Confirmation
19. Key Tracking
20. Registration Card
21. Notes / Requests
22. Room Status Integration
23. Audit Logging
24. Basic Reports

---

# 67. P1 Enhancements

1. Shift Handover
2. Digital Registration Signature
3. Door Lock Integration
4. Wake-Up Call Tasks
5. Vehicle / Parking Integration
6. Advanced Room Suggestion
7. Auto Room Assignment
8. Mobile Front Desk
9. Queue Management
10. Self Check-In / Kiosk Handoff
11. Advanced VIP Arrival Handling
12. Automated Hourly Alerts

---

# 68. P2 Enterprise Enhancements

1. Passport / ID Scanner Integration
2. Digital Key
3. Government Guest Registration Integration
4. Multi-Property Front Desk
5. Centralized Arrival Desk
6. AI Room Assignment Suggestions
7. Smart Upsell Suggestions
8. Concierge Integration
9. Advanced Guest Journey Dashboard

---

# 69. Recommended Development Order

```text
1. Stay Entity
      ↓
2. Arrival List
      ↓
3. Room Readiness Check
      ↓
4. Room Assignment
      ↓
5. Check-In
      ↓
6. In-House List
      ↓
7. Walk-In
      ↓
8. Room Change
      ↓
9. Stay Extension
      ↓
10. Hourly Extension
      ↓
11. Early Check-In
      ↓
12. Late Checkout
      ↓
13. Registration Card
      ↓
14. Key Tracking
      ↓
15. Notes / Requests
      ↓
16. Due-Out List
      ↓
17. Audit / History
      ↓
18. Reports
```

---

# 70. Example Overnight Check-In

```text
Reservation:
RES-000125

Guest:
John Smith

Room Type:
Deluxe King

Assigned Room:
205

Arrival:
06-Oct 14:00

Departure:
08-Oct 12:00

Deposit:
Paid

Room Status:
Vacant Clean

Action:
Check-In
```

Result:

```text
Stay:
In-House

Room 205:
Occupied
```

---

# 71. Example Hourly Check-In

```text
Guest:
Aung Min

Stay Type:
Hourly

Room:
101

Package:
3 Hours

Actual Check-In:
10:05

Planned End:
13:05

Grace:
15 Minutes
```

At 12:35:

```text
30 Minutes Remaining
```

At 13:10:

```text
Within Grace Period
```

At 13:25:

```text
Overdue
Extension Charge Applies
```

---

# 72. Completion Criteria

Front Desk is complete for MVP when:

- Front Desk can see arrivals.
- Reservations can be searched.
- Walk-ins can be created.
- Guest and identity can be verified.
- Rooms can be assigned.
- Invalid rooms cannot be assigned.
- Guests can be checked in.
- Room status changes automatically.
- In-house guests can be viewed.
- Rooms can be changed.
- Overnight stays can be extended.
- Hourly stays can be extended.
- Hourly end-time alerts work.
- Late checkout is controlled.
- Guest registration details are captured.
- Keys can be tracked.
- Due-outs can be viewed.
- Critical actions are audited.
- Data is ready for Billing / Folio / Checkout modules.

---

# 73. Final Functional Outcome

After Module 7 is complete, the ERP can answer:

```text
Has the guest arrived?
Can they check in now?
Which room are they actually staying in?
Is the room ready?
Has identity been verified?
Has the deposit/guarantee requirement been met?
When did they actually check in?
Are they in-house?
Do they want to extend?
Are they due out?
Are they overstaying an hourly package?
Did they change room?
```

Front Desk is the operational bridge between:

```text
Reservation
   ↓
Actual Guest Stay
   ↓
Billing / Checkout
```

For hourly/day-use hotels, the critical concepts are:

```text
Actual Check-In DateTime
Current Planned End DateTime
Grace Period
Extension Pricing
Next Reservation Conflict
Cleaning Buffer
```

These must be DateTime-based, not date-only.


---

The repository's delivered P0 workflow, API, permissions, additive schema, validation, and remaining integration limits are documented in [Module 7 Front Desk implementation](module-7-front-desk-implementation.md).
