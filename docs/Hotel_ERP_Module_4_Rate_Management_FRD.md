# Hotel ERP — Module 4: Rate Management
## Functional Requirements Document (FRD)

**Product:** Multi-Property Hotel ERP  
**Module:** Module 4 — Rate Management  
**Version:** 1.0  
**Document Type:** Functional Requirements Document  
**Priority:** Critical / Core PMS Pricing Foundation  
**Target Users:** Hotels, Resorts, Serviced Apartments, Hotel Groups, Multi-Property Hospitality Businesses  

---

# 1. Purpose

The Rate Management module defines how room prices are configured, calculated, controlled, and exposed to other hotel modules.

It provides the pricing foundation required by:

- Reservation Management
- Front Desk
- Online Booking Engine
- Channel Manager
- Corporate Booking
- Travel Agency Booking
- Group Booking
- Billing
- Revenue Management
- Reporting

The module answers questions such as:

- What is the selling price of a room type?
- Does the price change by date, season, weekday, occupancy, package, or customer type?
- Is breakfast included?
- Is the rate refundable?
- Is there a minimum-stay requirement?
- Are there special corporate or promotional prices?
- Are taxes and service charges included or excluded?
- Can a user override the rate?
- Which rate should be offered to which guest or channel?

---

# 2. Business Objective

The objective of this module is to provide a flexible and controlled pricing engine for hotel rooms.

The system shall allow authorized users to:

1. Create rate plans.
2. Define room prices by room type.
3. Create seasonal rates.
4. Create weekday/weekend pricing.
5. Define occupancy-based pricing.
6. Configure extra adult, child, and extra-bed charges.
7. Create corporate rates.
8. Create promotional rates.
9. Configure meal plans and packages.
10. Define cancellation and refund rules.
11. Apply minimum/maximum stay rules.
12. Configure booking windows.
13. Define blackout dates.
14. Configure tax/service-charge behavior.
15. Control rate overrides.
16. Support multi-property and multi-branch pricing.
17. Maintain effective dates and rate history.
18. Expose valid rates to Reservation and Front Desk modules.

---

# 3. Dependencies

## 3.1 Module 1 — Organization & Property Setup

Required entities:

- Tenant
- Company
- Property
- Branch
- Currency
- Tax
- Business Date
- Financial settings

## 3.2 Module 2 — User, Role & Permission Management

Rate operations must be permission-controlled.

Example permissions:

```text
RATE.PLAN.VIEW
RATE.PLAN.CREATE
RATE.PLAN.UPDATE
RATE.PLAN.ACTIVATE

RATE.PRICE.VIEW
RATE.PRICE.CREATE
RATE.PRICE.UPDATE

RATE.RESTRICTION.MANAGE
RATE.PROMOTION.MANAGE

RATE.OVERRIDE
RATE.OVERRIDE.APPROVE
```

## 3.3 Module 3 — Room Management

Rate Management requires:

- Room Type
- Property
- Branch
- Occupancy rules
- Extra-bed eligibility

Rates should normally be assigned to `RoomType`, not individual physical rooms.

---

# 4. Scope

## 4.1 In Scope

The module includes:

1. Rate Plan Management
2. Room Type Rate Assignment
3. Base Rate Configuration
4. Seasonal Rates
5. Weekday / Weekend Rates
6. Date-Specific Overrides
7. Occupancy-Based Pricing
8. Adult / Child Pricing
9. Extra Adult Charges
10. Extra Child Charges
11. Extra Bed Charges
12. Meal Plan Pricing
13. Package Rates
14. Corporate Rates
15. Travel Agent Rates
16. Promotional Rates
17. Member / Loyalty Rates
18. Long-Stay Rates
19. Early-Bird Rates
20. Last-Minute Rates
21. Stay Restrictions
22. Minimum Length of Stay
23. Maximum Length of Stay
24. Closed to Arrival
25. Closed to Departure
26. Booking Window Rules
27. Blackout Dates
28. Cancellation Policy
29. Refund Policy
30. No-Show Policy
31. Deposit / Guarantee Rules
32. Tax and Service Charge Inclusion
33. Rate Override Controls
34. Rate Priority / Eligibility
35. Rate History
36. Search and Filter
37. Rate Calendar
38. Reporting
39. Audit Logging
40. API Exposure to Reservation / Front Desk

---

# 5. Out of Scope

The following functions are not directly handled by Module 4:

- Creating a reservation
- Assigning a physical room
- Checking room availability against existing bookings
- Check-in
- Check-out
- Guest folio posting
- Payment processing
- OTA connectivity
- Dynamic AI pricing
- Revenue forecasting

However, these modules consume rate information from Rate Management.

---

# 6. Core Concepts

## 6.1 Rate Plan

A **Rate Plan** defines the commercial rules of a room price.

Examples:

```text
BAR
Best Available Rate

BB
Bed & Breakfast

NRF
Non-Refundable

CORP
Corporate Rate

WEEKEND
Weekend Special

LONGSTAY
Long Stay Rate
```

A rate plan may define:

- Refundability
- Meal inclusion
- Cancellation policy
- Deposit requirement
- Booking restrictions
- Eligible customer/channel
- Tax treatment
- Service-charge treatment

## 6.2 Room Type Rate

A rate plan is assigned a price for one or more room types.

Example:

```text
Rate Plan: BAR

Standard King: 120,000 MMK
Deluxe King:   180,000 MMK
Suite:         300,000 MMK
```

## 6.3 Rate Rule

A **Rate Rule** modifies or limits a rate based on conditions.

Examples:

```text
Weekend +10%
December High Season +20%
Minimum Stay = 2 nights
Book 14 days early = -10%
```

---

# 7. Main Entities

Recommended entities:

```text
RatePlan
RatePlanRoomType
RateCalendar
RateSeason
RateRestriction
RateOccupancyRule
RateExtraCharge
MealPlan
RatePackage
RateCustomerEligibility
RateChannelEligibility
CancellationPolicy
DepositPolicy
RatePromotion
RateOverride
RateAuditHistory
```

Supporting entities:

```text
Property
Branch
RoomType
Currency
Tax
CorporateCustomer (later module)
TravelAgent (later module)
```

---

# 8. Rate Plan Management

## FR-RATE-001 — Create Rate Plan

Authorized users shall be able to create rate plans.

### Required Fields

- Rate Plan Code
- Rate Plan Name
- Property
- Currency
- Rate Type
- Status

### Optional Fields

- Branch
- Description
- Meal Plan
- Refundability
- Cancellation Policy
- Deposit Policy
- Tax Inclusion
- Service Charge Inclusion
- Start Date
- End Date
- Booking Start Date
- Booking End Date
- Display Order
- Public / Private Indicator

Example:

```text
Code: BAR-BB
Name: Best Available Rate with Breakfast
Property: Golden Hotel Yangon
Currency: MMK
Meal Plan: Breakfast
Refundable: Yes
Status: Active
```

### Acceptance Criteria

- Rate Plan Code must be unique within the property.
- Rate Plan Name is required.
- Currency is required.
- Start date must not be after end date.
- Inactive rate plans cannot be used for new bookings.
- Historical booking prices must not change when the rate plan is later modified.

---

## FR-RATE-002 — Edit Rate Plan

Authorized users shall be able to edit rate-plan configuration.

Changes must be audited.

Price changes shall not retroactively change already confirmed bookings.

---

## FR-RATE-003 — Activate / Deactivate Rate Plan

Statuses:

```text
Draft
Active
Inactive
Expired
```

Only Active rate plans may be selected for new reservations.

---

# 9. Rate Types

## FR-RATE-004

The system shall support rate-plan types including:

```text
Public
Corporate
Travel Agent
Group
Promotional
Member
Package
Internal
Complimentary
```

The list may be configurable.

---

# 10. Base Room Type Rate

## FR-PRICE-001 — Assign Price to Room Type

Authorized users shall be able to assign a base price to a room type.

Example:

```text
Rate Plan: BAR
Room Type: Deluxe King
Base Price: 180,000 MMK
```

Fields:

- Rate Plan
- Room Type
- Base Occupancy
- Base Price
- Currency
- Effective From
- Effective To
- Status

---

## FR-PRICE-002 — Multiple Room Types

A rate plan may be assigned to multiple room types.

| Room Type | Price |
|---|---:|
| Standard King | 120,000 |
| Deluxe King | 180,000 |
| Family Room | 220,000 |
| Suite | 300,000 |

---

# 11. Rate Calendar

## FR-CAL-001 — Daily Rate Calendar

The system shall provide a calendar where users can view and manage daily room-type prices.

| Date | Standard | Deluxe | Suite |
|---|---:|---:|---:|
| Oct 10 | 120,000 | 180,000 | 300,000 |
| Oct 11 | 120,000 | 180,000 | 300,000 |
| Oct 12 | 140,000 | 210,000 | 340,000 |

Users with permission shall be able to update one date or a date range.

---

## FR-CAL-002 — Date Range Update

The system shall allow a user to apply pricing to a date range.

```text
From: 20-Dec-2026
To:   05-Jan-2027

Deluxe King:
220,000 MMK
```

---

# 12. Seasonal Rate Management

## FR-SEASON-001 — Create Season

Authorized users shall be able to define seasons.

Examples:

```text
Low Season
High Season
Peak Season
Thingyan Holiday
Christmas / New Year
```

Fields:

- Season Code
- Season Name
- Start Date
- End Date
- Priority
- Status

---

## FR-SEASON-002 — Seasonal Price

A season may define:

- Fixed Price
- Percentage Increase
- Percentage Discount
- Fixed Adjustment

Examples:

```text
High Season:
+20%

Low Season:
-15%
```

or:

```text
Deluxe King
High Season Price:
220,000 MMK
```

---

# 13. Weekday / Weekend Pricing

## FR-DAY-001

The system shall support different rates by day of week.

Example:

```text
Monday–Thursday:
180,000 MMK

Friday–Sunday:
210,000 MMK
```

Days included in “weekend” shall be configurable by property.

---

# 14. Date-Specific Overrides

## FR-DATE-001

Authorized users shall be able to override the price for specific dates.

Example:

```text
31-Dec-2026
Deluxe King
Rate: 300,000 MMK
```

Date-specific override should have higher priority than base rate and normal seasonal rate.

---

# 15. Rate Priority

## FR-PRIORITY-001

When multiple pricing rules apply, the system shall use a deterministic priority.

Recommended order:

```text
1. Manual Date-Specific Override
2. Eligible Contract / Promotion
3. Seasonal Rate
4. Weekday / Weekend Rule
5. Base Room Type Rate
```

The exact priority must be documented and applied consistently.

---

# 16. Occupancy-Based Pricing

## FR-OCC-001

The system shall support pricing based on occupancy.

Example:

```text
Deluxe King

1 Adult:
160,000

2 Adults:
180,000

2 Adults + 1 Child:
195,000
```

---

## FR-OCC-002 — Base Occupancy

A rate plan shall define base occupancy.

Example:

```text
Base Occupancy:
2 Adults
```

The base room price covers this occupancy.

Additional occupants may generate extra charges.

---

# 17. Extra Adult Charge

## FR-EXTRA-001

The system shall support an extra-adult charge.

Example:

```text
Base:
2 Adults = 180,000

3rd Adult:
+35,000
```

---

# 18. Extra Child Charge

## FR-EXTRA-002

The system shall support child pricing by configurable age band.

Example:

```text
Child 0–5:
Free

Child 6–11:
15,000

Age 12+:
Adult pricing
```

---

# 19. Extra Bed Charge

## FR-EXTRA-003

If a room type allows extra beds, the system shall support an extra-bed charge.

Example:

```text
Extra Bed:
40,000 MMK per night
```

Room Management determines whether extra beds are allowed.

---

# 20. Meal Plan Management

## FR-MEAL-001 — Meal Plans

The system shall support meal plans such as:

```text
RO — Room Only
BB — Bed & Breakfast
HB — Half Board
FB — Full Board
AI — All Inclusive
```

---

## FR-MEAL-002 — Meal Plan Price

Meal costs may be:

- Included in the room rate
- Added per person
- Added per room
- Added per night

Example:

```text
Room Only:
180,000

Bed & Breakfast:
205,000
```

---

# 21. Package Rate

## FR-PKG-001

The system shall support packages.

Example:

```text
Weekend Couple Package

2 Nights
Breakfast Included
Airport Pickup
Dinner for Two
Late Checkout
```

Package price:

```text
500,000 MMK
```

A package may include:

- Room
- Meals
- Spa
- Transfer
- Event ticket
- Other hotel services

---

# 22. Corporate Rate

## FR-CORP-001

The system shall support contracted rates for corporate customers.

Example:

```text
Company:
ABC Trading Co., Ltd.

Deluxe King:
150,000 MMK

Normal BAR:
180,000 MMK
```

Corporate-rate fields:

- Corporate Customer
- Rate Plan
- Room Type
- Contract Start
- Contract End
- Contracted Rate
- Booking Restrictions
- Credit / Payment Terms Reference
- Status

Customer-master integration may be implemented in a later CRM/Sales module.

---

# 23. Travel Agent Rate

## FR-TA-001

The system shall support travel-agent rates.

Example:

```text
Travel Agent:
XYZ Travel

Standard:
100,000

Deluxe:
150,000
```

Support:

- Nett Rate
- Commissionable Rate
- Commission Percentage
- Contract Dates

---

# 24. Promotional Rate

## FR-PROMO-001

Authorized users shall be able to create promotions.

Examples:

```text
10% Weekend Discount
Stay 3 Pay 2
Early Bird 15%
Last Minute 10%
New Year Package
```

Fields:

- Promotion Code
- Promotion Name
- Promotion Type
- Booking Period
- Stay Period
- Applicable Property
- Applicable Room Types
- Applicable Rate Plans
- Discount Type
- Discount Value
- Minimum Stay
- Maximum Stay
- Status

---

# 25. Promotion Types

## FR-PROMO-002

Support:

```text
Percentage Discount
Fixed Amount Discount
Fixed Promotional Rate
Free Night
Value-Added Package
```

---

# 26. Early Bird Rate

## FR-PROMO-003

Example:

```text
Book at least 30 days before arrival
→ 15% Discount
```

---

# 27. Last-Minute Rate

## FR-PROMO-004

Example:

```text
Book within 2 days of arrival
→ 10% Discount
```

---

# 28. Long-Stay Rate

## FR-PROMO-005

Example:

```text
Stay 7+ nights
→ 12% Discount
```

or:

```text
Monthly Rate:
1,800,000 MMK
```

---

# 29. Stay Restrictions

## FR-REST-001 — Minimum Length of Stay

The system shall support Minimum Length of Stay (MinLOS).

Example:

```text
During New Year:
Minimum Stay = 3 Nights
```

---

## FR-REST-002 — Maximum Length of Stay

The system shall support Maximum Length of Stay (MaxLOS).

Example:

```text
Promotional Rate:
Maximum Stay = 7 Nights
```

---

# 30. Closed to Arrival

## FR-REST-003

The system shall support `Closed To Arrival (CTA)`.

Example:

```text
31-Dec-2026:
No new arrival allowed
```

Existing guests may continue staying.

---

# 31. Closed to Departure

## FR-REST-004

The system shall support `Closed To Departure (CTD)`.

Example:

```text
01-Jan-2027:
No checkout allowed under this rate
```

---

# 32. Booking Window

## FR-REST-005

The system shall support:

- Minimum Advance Booking Days
- Maximum Advance Booking Days

Example:

```text
Early Bird:
Minimum Advance = 30 days
```

---

# 33. Blackout Dates

## FR-BLACKOUT-001

The system shall allow dates to be excluded from a rate or promotion.

Example:

```text
Promotion:
10% Member Discount

Blackout:
24-Dec
25-Dec
31-Dec
01-Jan
```

---

# 34. Cancellation Policy

## FR-CANCEL-001

The system shall support configurable cancellation policies.

Example:

```text
Free cancellation until 24 hours before arrival.
After that: charge 1 night.
```

Supported penalty models may include:

```text
Free Cancellation
Non-Refundable
First Night Charge
Percentage Charge
Full Stay Charge
Fixed Amount Charge
```

---

# 35. No-Show Policy

## FR-NOSHOW-001

The system shall define charges for no-show cases.

Example:

```text
No Show:
Charge first night
```

or:

```text
No Show:
100% of booking
```

---

# 36. Deposit / Guarantee Policy

## FR-DEP-001

The system shall support deposit requirements.

Examples:

```text
No Deposit
1 Night Deposit
50% Deposit
100% Prepayment
Fixed Deposit: 100,000 MMK
```

---

# 37. Refundability

## FR-REF-001

Rate plans shall support:

```text
Refundable
Partially Refundable
Non-Refundable
```

The cancellation policy defines exact conditions.

---

# 38. Tax Treatment

## FR-TAX-001

Rate plans shall indicate whether prices are:

```text
Tax Inclusive
Tax Exclusive
```

Tax configuration shall come from Module 1.

Example:

```text
Room Rate:
100,000

Tax Exclusive 5%:
Total = 105,000
```

or:

```text
Room Rate:
105,000

Tax Inclusive:
Tax is already included.
```

---

# 39. Service Charge

## FR-SVC-001

Rate plan shall define whether service charge is:

- Included
- Excluded
- Not Applicable

Example:

```text
Room Rate:        100,000
Service Charge:    10,000
Tax:                5,500
Total:             115,500
```

---

# 40. Public vs Private Rate

## FR-ELIG-001

The system shall distinguish:

```text
Public Rate
Private / Contracted Rate
```

Private rates may require:

- Corporate account
- Travel agent
- Promo code
- Member status
- Staff authorization

---

# 41. Rate Eligibility

## FR-ELIG-002

A rate may be limited by:

- Customer Type
- Corporate Customer
- Travel Agent
- Member Tier
- Booking Channel
- Promo Code
- Market Segment
- Source

---

# 42. Channel Eligibility

## FR-CHANNEL-001

Rate plans may specify channels such as:

```text
Front Desk
Call Center
Hotel Website
Booking Engine
OTA
Corporate Portal
Travel Agent
```

A rate not enabled for a channel must not be exposed to that channel.

---

# 43. Rate Override

## FR-OVR-001

Authorized users may override a calculated room rate.

Example:

```text
System Rate:
180,000

Approved Override:
165,000
```

Required information:

- Original Rate
- Override Rate
- Reason
- User
- Date/Time
- Approval Reference if needed

---

# 44. Rate Override Permission

Only users with:

```text
RATE.OVERRIDE
```

may perform manual overrides.

Managers may have:

```text
RATE.OVERRIDE.APPROVE
```

---

# 45. Override Limits

## FR-OVR-002

The system may support override limits.

Example:

```text
Front Desk Supervisor:
Max Discount = 10%

Hotel Manager:
Max Discount = 25%

General Manager:
Configured / unrestricted
```

---

# 46. Rate Lock on Booking

## FR-LOCK-001

When a reservation is confirmed, the system must store the booked price separately from the current Rate Management price.

Example:

```text
Booking created:
05-Oct

Booked Rate:
180,000

Rate later changed:
200,000

Existing Booking:
still 180,000
```

unless an authorized user explicitly reprices the reservation.

This rule is critical.

---

# 47. Multi-Night Pricing

## FR-CALC-001

Each stay date may have a different nightly price.

Example:

```text
10-Oct: 180,000
11-Oct: 180,000
12-Oct: 220,000
```

3-night room subtotal:

```text
580,000 MMK
```

The system must not assume one price for the entire stay.

---

# 48. Rate Calculation Output

## FR-CALC-002

The rate engine shall return at minimum:

- Rate Plan
- Room Type
- Stay Date
- Nightly Base Rate
- Occupancy Charges
- Extra Bed Charge
- Package Charge
- Discount
- Service Charge
- Tax
- Nightly Total
- Stay Total
- Applied Rules

---

# 49. Recommended Rate Calculation Flow

```text
Room Type
   ↓
Eligible Rate Plans
   ↓
Date Valid?
   ↓
Channel / Customer Eligible?
   ↓
Stay Restrictions Pass?
   ↓
Base Price
   ↓
Season / Day Rule
   ↓
Date Override
   ↓
Occupancy Adjustment
   ↓
Promotion / Contract
   ↓
Extras
   ↓
Service Charge
   ↓
Tax
   ↓
Final Rate
```

---

# 50. Rate Search

## FR-SRCH-001

Users shall be able to search rate plans by:

- Code
- Name
- Property
- Branch
- Room Type
- Rate Type
- Status
- Currency
- Meal Plan
- Date
- Public / Private
- Customer Eligibility

---

# 51. Rate Filters

Example:

```text
Property: Golden Hotel Yangon
Room Type: Deluxe King
Rate Type: Public
Status: Active
Stay Date: 10-Oct-2026
```

---

# 52. Rate Calendar Screen

Recommended UI:

```text
             Oct 10   Oct 11   Oct 12   Oct 13
Standard     120,000  120,000  140,000  140,000
Deluxe       180,000  180,000  210,000  210,000
Suite        300,000  300,000  350,000  350,000
```

Users should be able to:

- Select date range
- Select room type
- Apply fixed amount
- Apply percentage adjustment
- Add restrictions
- Copy rates to other dates

---

# 53. Copy Rate

## FR-COPY-001

Authorized users shall be able to copy rate configuration.

Examples:

```text
Copy October rates
→ November
```

or:

```text
Copy Deluxe rate
→ Executive Room
```

with confirmation before saving.

---

# 54. Rate History

## FR-HIST-001

The system shall preserve rate-change history.

Fields:

```text
Rate Plan
Room Type
Date / Date Range
Old Price
New Price
Changed By
Changed At
Reason
```

---

# 55. Audit Logging

## FR-AUD-001

The system shall audit:

```text
Rate Plan Created
Rate Plan Updated
Rate Plan Activated
Rate Plan Deactivated

Price Created
Price Updated

Season Created
Season Updated

Promotion Created
Promotion Updated

Restriction Added
Restriction Removed

Rate Override Performed
```

---

# 56. Permissions

Recommended permission codes:

```text
RATE.PLAN.VIEW
RATE.PLAN.CREATE
RATE.PLAN.UPDATE
RATE.PLAN.ACTIVATE
RATE.PLAN.DEACTIVATE

RATE.PRICE.VIEW
RATE.PRICE.CREATE
RATE.PRICE.UPDATE

RATE.CALENDAR.VIEW
RATE.CALENDAR.UPDATE

RATE.SEASON.VIEW
RATE.SEASON.MANAGE

RATE.PROMOTION.VIEW
RATE.PROMOTION.MANAGE

RATE.RESTRICTION.VIEW
RATE.RESTRICTION.MANAGE

RATE.CANCELLATION.VIEW
RATE.CANCELLATION.MANAGE

RATE.OVERRIDE
RATE.OVERRIDE.APPROVE

RATE.REPORT.VIEW
RATE.REPORT.EXPORT
```

---

# 57. Property / Branch Scope Security

## FR-SEC-001

Users shall only view or manage rates for properties and branches within their authorized scope.

Example:

```text
Yangon Revenue Manager

Allowed:
✓ Yangon Hotel Rates

Not Allowed:
✗ Mandalay Hotel Rates
```

unless group-level access is granted.

---

# 58. Business Rules

## BR-001
Every rate plan must belong to a property.

## BR-002
Every room-type price must belong to a valid room type.

## BR-003
Only active room types may receive new rate assignments.

## BR-004
Rate effective date ranges must be valid.

## BR-005
Inactive rate plans cannot be used for new bookings.

## BR-006
Existing confirmed booking prices must not change automatically after a rate update.

## BR-007
Date-specific rates override general base rates.

## BR-008
All rate calculations must use property currency unless explicitly configured otherwise.

## BR-009
Rate overrides require permission.

## BR-010
All critical rate changes must be audited.

## BR-011
Users may only manage rates within their organizational scope.

## BR-012
Tax and service-charge calculations must use active configuration.

## BR-013
Stay restrictions must be validated before a rate is offered.

---

# 59. Validation Rules

## VAL-001
Rate Plan Code is required.

## VAL-002
Rate Plan Name is required.

## VAL-003
Property is required.

## VAL-004
Currency is required.

## VAL-005
Base price must not be negative.

## VAL-006
Discount percentage must be within configured allowed limits.

## VAL-007
Start date cannot be after end date.

## VAL-008
Minimum stay must be greater than zero.

## VAL-009
Maximum stay cannot be lower than minimum stay.

## VAL-010
Booking end date cannot be before booking start date.

## VAL-011
Overlapping rules must be resolved by explicit priority.

## VAL-012
Extra adult/child rates must comply with room occupancy rules.

---

# 60. Integration — Room Management

Rate Management shall consume:

- Room Type
- Occupancy Rules
- Extra Bed Allowed
- Property
- Branch

Rates should normally be linked to Room Type rather than physical Room.

---

# 61. Integration — Reservation Management

Reservation Management shall request valid rates based on:

```text
Property
Room Type
Arrival Date
Departure Date
Adults
Children
Channel
Customer Type
Corporate Account
Travel Agent
Promo Code
```

Rate Management shall return:

- Eligible rate plans
- Nightly prices
- Restrictions
- Cancellation policy
- Deposit policy
- Taxes / service charge
- Final total

---

# 62. Integration — Front Desk

Front Desk shall use Rate Management for:

- Walk-in rates
- Stay extensions
- Room changes
- Manual rate overrides
- Late booking prices

---

# 63. Integration — Billing

Billing should receive the booked nightly rate from Reservation / Front Desk.

Billing should not recalculate historical room price from the current rate table.

---

# 64. Integration — Channel Manager

Future Channel Manager integration may use:

- Public Rate Plans
- Daily Rates
- Restrictions
- CTA / CTD
- MinLOS / MaxLOS
- Channel eligibility

Channel mapping is a later module.

---

# 65. Reports

The module shall provide at minimum:

1. Rate Plan List
2. Room Type Rate List
3. Daily Rate Calendar
4. Seasonal Rate Report
5. Promotion Report
6. Corporate Rate Report
7. Travel Agent Rate Report
8. Rate Restriction Report
9. Rate Override Report
10. Rate Change History
11. Active / Inactive Rate Plans
12. Rate Comparison by Room Type

---

# 66. Main Screens

Recommended screens:

1. Rate Plan List
2. Create Rate Plan
3. Edit Rate Plan
4. Rate Plan Detail
5. Rate Calendar
6. Seasonal Rate Setup
7. Occupancy Pricing
8. Extra Charge Setup
9. Meal Plan Setup
10. Promotion Setup
11. Corporate Rate Setup
12. Travel Agent Rate Setup
13. Restriction Setup
14. Cancellation Policy Setup
15. Deposit Policy Setup
16. Rate Override History
17. Rate Reports

---

# 67. Recommended Menu Structure

```text
Hotel Operations
│
└── Rate Management
    │
    ├── Rate Plans
    ├── Rate Calendar
    ├── Seasons
    ├── Promotions
    ├── Occupancy Pricing
    ├── Extra Charges
    ├── Meal Plans
    ├── Restrictions
    ├── Cancellation Policies
    ├── Corporate Rates
    ├── Travel Agent Rates
    └── Rate Reports
```

---

# 68. Suggested Database Model

## RatePlan

```text
Id
TenantId
CompanyId
PropertyId
BranchId

Code
Name
Description

RateType
CurrencyId
MealPlanId

RefundabilityType
CancellationPolicyId
DepositPolicyId

TaxInclusive
ServiceChargeInclusive

StartDate
EndDate

BookingStartDate
BookingEndDate

IsPublic
Priority
Status

CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

---

# 69. RatePlanRoomType

```text
Id
RatePlanId
RoomTypeId

BaseOccupancyAdults
BaseOccupancyChildren

BaseRate

EffectiveFrom
EffectiveTo

IsActive
```

---

# 70. RateCalendar

```text
Id
RatePlanId
RoomTypeId
StayDate

RateAmount

SourceType
Priority

IsClosed
IsActive

CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

---

# 71. RateSeason

```text
Id
TenantId
PropertyId

Code
Name

StartDate
EndDate

AdjustmentType
AdjustmentValue

Priority
IsActive
```

---

# 72. RateRestriction

```text
Id
RatePlanId
RoomTypeId

StartDate
EndDate

MinLOS
MaxLOS

ClosedToArrival
ClosedToDeparture

MinAdvanceDays
MaxAdvanceDays

IsActive
```

---

# 73. RateOccupancyRule

```text
Id
RatePlanId
RoomTypeId

AdultCount
ChildCount

AdjustmentType
AdjustmentValue

EffectiveFrom
EffectiveTo

IsActive
```

---

# 74. RateExtraCharge

```text
Id
RatePlanId
RoomTypeId

ChargeType
ChargeAmount
ChargeBasis

EffectiveFrom
EffectiveTo

IsActive
```

Charge types:

```text
ExtraAdult
ExtraChild
ExtraBed
```

Charge basis:

```text
PerNight
PerStay
PerPersonPerNight
PerPersonPerStay
```

---

# 75. MealPlan

```text
Id
TenantId

Code
Name
Description

PricingBasis
DefaultPrice

IsActive
```

---

# 76. CancellationPolicy

```text
Id
TenantId

Code
Name
Description

FreeCancellationHours

PenaltyType
PenaltyValue

NoShowPenaltyType
NoShowPenaltyValue

IsActive
```

---

# 77. DepositPolicy

```text
Id
TenantId

Code
Name

DepositType
DepositValue
DueRule

IsActive
```

---

# 78. RatePromotion

```text
Id
TenantId
PropertyId

Code
Name

PromotionType
DiscountType
DiscountValue

BookingStartDate
BookingEndDate

StayStartDate
StayEndDate

MinLOS
MaxLOS

PromoCodeRequired

Priority
IsActive
```

---

# 79. RateOverride

```text
Id
ReservationId
PropertyId
RoomTypeId

OriginalRate
OverrideRate

Reason

RequestedBy
ApprovedBy

CreatedAt
```

`ReservationId` will be nullable until Reservation Management exists.

---

# 80. Recommended Relationships

```text
Property
   │
   └── RatePlan
          │
          ├── RoomType
          ├── RateCalendar
          ├── Restrictions
          ├── Promotions
          ├── Cancellation Policy
          └── Deposit Policy
```

Room pricing:

```text
RatePlan
   *
   │
   *
RoomType
```

implemented through:

```text
RatePlanRoomType
```

---

# 81. Recommended API Endpoints

## Rate Plans

```text
GET    /api/v1/rates/rate-plans
POST   /api/v1/rates/rate-plans
GET    /api/v1/rates/rate-plans/{id}
PUT    /api/v1/rates/rate-plans/{id}

POST   /api/v1/rates/rate-plans/{id}/activate
POST   /api/v1/rates/rate-plans/{id}/deactivate
```

## Rate Calendar

```text
GET  /api/v1/rates/calendar
PUT  /api/v1/rates/calendar
POST /api/v1/rates/calendar/bulk-update
```

## Seasons

```text
GET  /api/v1/rates/seasons
POST /api/v1/rates/seasons
PUT  /api/v1/rates/seasons/{id}
```

## Promotions

```text
GET  /api/v1/rates/promotions
POST /api/v1/rates/promotions
PUT  /api/v1/rates/promotions/{id}
```

## Restrictions

```text
GET  /api/v1/rates/restrictions
POST /api/v1/rates/restrictions
PUT  /api/v1/rates/restrictions/{id}
```

## Rate Query

Future Reservation-facing endpoint:

```text
POST /api/v1/rates/search
```

Request example:

```json
{
  "propertyId": "property-id",
  "roomTypeId": "room-type-id",
  "arrivalDate": "2026-10-10",
  "departureDate": "2026-10-13",
  "adults": 2,
  "children": 1,
  "channel": "FRONT_DESK"
}
```

---

# 82. Rate Search Response

Example conceptual response:

```json
{
  "ratePlanCode": "BAR-BB",
  "roomType": "Deluxe King",
  "currency": "MMK",
  "nights": [
    { "date": "2026-10-10", "rate": 180000 },
    { "date": "2026-10-11", "rate": 180000 },
    { "date": "2026-10-12", "rate": 220000 }
  ],
  "roomSubtotal": 580000,
  "extraCharges": 30000,
  "serviceCharge": 61000,
  "tax": 33550,
  "grandTotal": 704550
}
```

Exact tax logic depends on property configuration.

---

# 83. Calculation Consistency

## NFR-CALC-001

The same input conditions must produce the same rate result unless configuration changes.

Rate calculations must be deterministic and testable.

---

# 84. Performance

## NFR-PERF-001

Rate search for a normal booking request should normally complete within 1 second under expected operating load.

## NFR-PERF-002

Rate Calendar queries should support date-range indexing.

Recommended indexed fields include:

```text
TenantId
PropertyId
RatePlanId
RoomTypeId
StayDate
Status
```

---

# 85. Security

## NFR-SEC-001
All rate-administration APIs shall require authentication.

## NFR-SEC-002
Tenant isolation shall be enforced.

## NFR-SEC-003
Property / branch scope shall be validated server-side.

## NFR-SEC-004
Manual rate overrides must require dedicated permissions.

---

# 86. Data Integrity

## NFR-DATA-001
Historical booked rates must remain stable even if source-rate configuration changes.

## NFR-DATA-002
Foreign-key integrity shall be enforced for:

- Property
- Branch
- Room Type
- Currency
- Rate Plan
- Policy references

---

# 87. Multi-Property Support

Each property may maintain independent rates.

Example:

```text
Golden Hotel Yangon
Deluxe King:
180,000 MMK

Golden Hotel Mandalay
Deluxe King:
150,000 MMK
```

Group-level users may view and compare rates across properties.

---

# 88. MVP Scope — P0

The first Rate Management version should include:

1. Rate Plan CRUD
2. Room Type Base Rates
3. Effective Dates
4. Rate Calendar
5. Weekday / Weekend Pricing
6. Seasonal Pricing
7. Adult / Child Base Occupancy
8. Extra Adult Charge
9. Extra Child Charge
10. Extra Bed Charge
11. Meal Plan
12. Tax / Service Charge inclusion flags
13. MinLOS
14. MaxLOS
15. CTA
16. CTD
17. Basic Cancellation Policy
18. Basic Deposit Policy
19. Rate Override Permission
20. Search / Filter
21. Audit Logging
22. Property / Branch Security
23. Basic Reports

---

# 89. P1 Enhancements

Add after MVP:

1. Corporate Rates
2. Travel Agent Rates
3. Promotions
4. Promo Codes
5. Early Bird
6. Last Minute
7. Long Stay
8. Blackout Dates
9. Rate Copy
10. Advanced Occupancy Pricing
11. Member Rates
12. Package Rates
13. Rate Approval Workflow
14. Rate Comparison
15. Advanced Rate History

---

# 90. P2 Enterprise Enhancements

Later:

1. Dynamic Pricing
2. Revenue Management Integration
3. Competitor Rate Shopping
4. Demand-Based Pricing
5. AI Rate Recommendation
6. OTA Rate Mapping
7. Channel-Specific Margin Rules
8. Derived Rates
9. Rate Fences
10. Group-Wide Central Rate Governance

---

# 91. Recommended Development Order

```text
1. Meal Plan
      ↓
2. Cancellation Policy
      ↓
3. Deposit Policy
      ↓
4. Rate Plan
      ↓
5. Rate Plan ↔ Room Type
      ↓
6. Base Rate
      ↓
7. Rate Calendar
      ↓
8. Weekday / Weekend Rules
      ↓
9. Seasonal Rates
      ↓
10. Occupancy Charges
      ↓
11. Extra Charges
      ↓
12. Restrictions
      ↓
13. Rate Calculation Service
      ↓
14. Override Security
      ↓
15. Audit / History
      ↓
16. Reports
      ↓
17. P1 Commercial Rates
```

---

# 92. Example Setup Flow

```text
Create Meal Plans
      ↓
Create Cancellation Policy
      ↓
Create Deposit Policy
      ↓
Create Rate Plan
      ↓
Assign Room Types
      ↓
Set Base Rates
      ↓
Set Seasonal Rates
      ↓
Configure Weekend Prices
      ↓
Set Extra Adult / Child Charges
      ↓
Set Restrictions
      ↓
Activate Rate Plan
```

---

# 93. Example Rate Setup

```text
Property:
Golden Hotel Yangon

Rate Plan:
BAR-BB

Room Type:
Deluxe King

Base Rate:
180,000 MMK

Base Occupancy:
2 Adults

Extra Adult:
35,000

Extra Child:
15,000

Extra Bed:
40,000

Meal Plan:
Breakfast Included

Tax:
Exclusive

Service Charge:
10%

Cancellation:
Free until 24 hours before arrival

Min Stay:
1 Night
```

---

# 94. Example Weekend Pricing

```text
Monday–Thursday
180,000

Friday–Sunday
210,000
```

Guest stays:

```text
Thursday:
180,000

Friday:
210,000

Saturday:
210,000
```

Room subtotal:

```text
600,000 MMK
```

---

# 95. Example Seasonal Pricing

```text
Normal Rate:
180,000

High Season:
+20%

Calculated:
216,000
```

If 31-Dec has a date-specific override:

```text
31-Dec:
300,000
```

the date-specific price wins.

---

# 96. Example Rate Selection Flow

Future Reservation Module:

```text
Guest requests:
Deluxe King

10-Oct → 13-Oct
2 Adults
1 Child
```

Rate Management checks:

```text
Active Rate Plans?
      ↓
Valid Stay Dates?
      ↓
Room Type Eligible?
      ↓
Occupancy Valid?
      ↓
Restrictions Pass?
      ↓
Promotion / Corporate Eligibility?
      ↓
Calculate Each Night
      ↓
Tax + Service Charge
      ↓
Return Final Rate Options
```

Reservation may then show:

```text
BAR Room Only
580,000

BAR Breakfast
640,000

Non-Refundable
520,000
```

---

# 97. Completion Criteria

Module 4 shall be considered functionally complete for MVP when:

- Rate plans can be created and maintained.
- Room types can receive rates.
- Daily prices can be configured.
- Seasonal pricing works.
- Weekday / weekend pricing works.
- Adult / child / extra-bed charges work.
- Meal plans can be linked.
- Cancellation and deposit rules can be linked.
- Stay restrictions can be configured.
- Taxes and service-charge inclusion are defined.
- Rate search returns valid nightly pricing.
- Rate overrides are permission-controlled.
- Rate changes are audited.
- Users can only manage authorized properties/branches.
- Existing confirmed booking prices can later be stored independently from changing rate configuration.
- The Reservation module can consume valid rate results.

---

# 98. Final Functional Outcome

After Module 4 is complete, the system should be able to answer:

```text
Property:
Golden Hotel Yangon

Room Type:
Deluxe King

Stay:
10-Oct to 13-Oct

Guests:
2 Adults + 1 Child

Question:
"What valid prices can we sell?"
```

The system can return:

```text
BAR Room Only
Night 1: 180,000
Night 2: 180,000
Night 3: 220,000

BAR Breakfast
Night 1: 200,000
Night 2: 200,000
Night 3: 240,000

Non-Refundable
Night 1: 165,000
Night 2: 165,000
Night 3: 200,000
```

with:

- Occupancy charges
- Restrictions
- Cancellation terms
- Taxes
- Service charges
- Final stay total

This becomes the pricing engine used by Reservation, Front Desk, Booking Engine, Corporate Sales, and future Channel Manager modules.

---



# 99A. Stay Type / Pricing Mode

## FR-STAY-001 — Supported Stay Types

The system shall support multiple stay/pricing modes per property and rate plan:

```text
Overnight
Hourly
Day Use
Hybrid
```

Definitions:

- **Overnight** — traditional hotel stay that crosses the property's business-night boundary.
- **Hourly** — stay charged by configured hour blocks such as 1 hour, 2 hours, 3 hours, 6 hours, etc.
- **Day Use** — stay allowed only within configured same-day operating hours and normally cannot continue overnight.
- **Hybrid** — property supports both overnight and hourly/day-use stays.

Each property shall be configurable to allow one or more stay types.

Example:

```text
Hotel A:
✓ Overnight
✓ Hourly
✓ Day Use

Hotel B:
✗ Overnight
✓ Hourly
✓ Day Use
```

---

# 99B. Property Stay Policy

## FR-STAY-002 — Property-Level Stay Policy

The system shall allow authorized administrators to configure stay policies at property level.

Fields:

- Allow Overnight Stay
- Allow Hourly Stay
- Allow Day Use
- Default Stay Type
- Day Use Start Time
- Day Use End Time
- Latest Day Use Check-In Time
- Maximum Hourly Stay Duration
- Allow Cross-Midnight Hourly Stay
- Grace Period Minutes
- Extension Policy
- Overnight Conversion Policy
- Status

Example:

```text
Allow Overnight Stay: No
Allow Hourly Stay: Yes
Allow Day Use: Yes

Day Use Start: 06:00
Day Use End: 21:00
Latest Check-In: 18:00

Max Hourly Duration: 6 Hours
Cross-Midnight: Not Allowed
```

---

# 99C. Hourly Rate Plan

## FR-HR-001 — Create Hourly Rate Plan

Authorized users shall be able to create hourly rate plans based on Room Type.

Example:

```text
Rate Plan:
3-Hour Day Use

Room Type:
Standard Room

Duration:
3 Hours

Price:
35,000 MMK
```

Fields:

- Rate Plan
- Room Type
- Duration Hours
- Duration Minutes
- Price
- Currency
- Applicable Days of Week
- Applicable Time Window
- Effective From
- Effective To
- Tax Inclusion
- Service Charge Inclusion
- Extension Rule
- Status

---

## FR-HR-002 — Multiple Hour Blocks

The system shall support multiple hourly packages for the same room type.

Example:

```text
Standard Room

1 Hour  = 15,000
3 Hours = 35,000
6 Hours = 60,000
```

Example for Deluxe:

```text
Deluxe Room

1 Hour  = 20,000
3 Hours = 45,000
6 Hours = 75,000
```

---

# 99D. Hourly Rate by Day of Week

## FR-HR-003 — Day-Based Hourly Pricing

Hourly rates shall support different prices by day of week.

Example:

```text
Standard Room — 3 Hours

Monday–Thursday:
35,000 MMK

Friday:
40,000 MMK

Saturday–Sunday:
45,000 MMK
```

Property administrators shall be able to define which days share the same rate.

---

# 99E. Hourly Rate by Time Window

## FR-HR-004 — Time-of-Day Pricing

The system shall optionally support different hourly rates based on check-in time.

Example:

```text
3-Hour Standard Room

06:00–12:00
30,000 MMK

12:01–18:00
35,000 MMK

18:01–21:00
40,000 MMK
```

This feature should be P1 unless required in MVP.

---

# 99F. Day-Use Rate

## FR-DAYUSE-001 — Day-Use Pricing

The system shall support Day-Use rate plans that allow same-day stays without overnight accommodation.

Example:

```text
Day Use Deluxe Room

Check-In:
08:00

Check-Out:
18:00

Price:
70,000 MMK
```

Day-use rate fields:

- Room Type
- Day Use Start Time
- Day Use End Time
- Latest Check-In Time
- Fixed Price
- Applicable Days
- Effective Date Range
- Tax / Service Charge Rules
- Extension Rule
- Status

---

# 99G. Day-Only Hotel Policy

## FR-DAYUSE-002 — No Overnight Stay

A property may be configured as **Day-Use Only**.

When:

```text
Allow Overnight Stay = No
```

the system shall:

- Prevent creation/activation of overnight rate plans for that property.
- Prevent overnight reservations in the future Reservation module.
- Prevent a day-use stay from crossing the configured overnight boundary.
- Allow only Hourly and/or Day-Use rate plans.
- Reject attempts to extend a stay into overnight unless the property is reconfigured or an explicitly supported policy applies.

Example:

```text
Property:
City Day Hotel

Allowed:
✓ 3-Hour Stay
✓ 6-Hour Stay
✓ 08:00–18:00 Day Use

Not Allowed:
✗ Overnight Stay
```

---

# 99H. Hourly Stay Calculation

## FR-HR-005 — Hourly Price Calculation

For an hourly stay, the system shall calculate price using the selected hourly package.

Example:

```text
Check-In:
10:00

Selected Package:
3 Hours

Planned Check-Out:
13:00

Price:
35,000 MMK
```

The system shall expose/store pricing data including:

- Selected Duration
- Planned Start Time
- Planned End Time
- Package Price
- Extension Rule
- Applicable Tax / Service Charge

Actual check-in/check-out timestamps will be owned by future Reservation / Front Desk modules.

---

# 99I. Hourly Extension

## FR-HR-006 — Extend Hourly Stay

The rate engine shall support pricing for hourly stay extensions.

Possible configured extension models:

```text
Per Additional Hour
Next Package Upgrade
Fixed Extension Charge
Recalculate to Best Matching Package
```

Example:

```text
3 Hours = 35,000
Extra Hour = 12,000

2 Extra Hours = 24,000

Final Room Charge = 59,000 MMK
```

The actual extension action will be performed by a future Reservation / Front Desk module; Rate Management supplies the calculation rules.

---

# 99J. Extension Grace Period

## FR-HR-007 — Grace Period

Property may define a grace period.

Example:

```text
Grace Period:
15 Minutes
```

If planned checkout is 13:00 and actual checkout is 13:10, no extension charge is applied.

If checkout occurs after 13:15, the configured extension rule applies.

---

# 99K. Hourly Stay Overrun

## FR-HR-008 — Overstay Handling

When the guest exceeds the selected duration, pricing shall follow the configured policy.

Supported policies may include:

```text
Charge Per Extra Hour
Charge Next Hour Block
Upgrade to Next Package
Convert to Day Use
Convert to Overnight
Require Manager Decision
```

Conversion to Overnight shall only be available if the property allows overnight stays.

---

# 99L. Cross-Midnight Rule

## FR-HR-009 — Cross-Midnight Hourly Stay

The property shall define whether an hourly stay may cross midnight.

Example:

```text
Check-In: 22:00
Package: 3 Hours
Planned Checkout: 01:00
```

If `Allow Cross-Midnight Hourly Stay = No`, the rate must not be offered for that start time.

If allowed, future Reservation / Front Desk modules shall preserve the booking as an hourly stay while respecting hotel business-date rules.

---

# 99M. Rate Plan Applicability by Stay Type

## FR-STAY-003

Every rate plan shall include a Stay Type:

```text
Overnight
Hourly
Day Use
```

A rate plan shall only be returned when the requested stay type matches.

Example:

```text
Request:
3-Hour Stay

Show:
✓ 3-Hour Standard
✓ 3-Hour Deluxe

Do Not Show:
✗ BAR Overnight
✗ Corporate Overnight
```

---

# 99N. Hourly Availability Interaction

## FR-HR-010

Future Reservation / Front Desk modules must evaluate hourly bookings using date **and time**, not date only.

Example:

```text
Room 101

Booking A:
09:00–12:00

Booking B:
13:00–16:00
```

Both bookings may use the same room on the same date if turnover rules are satisfied.

Therefore hourly availability shall use:

```text
StartDateTime
EndDateTime
```

rather than only:

```text
ArrivalDate
DepartureDate
```

---

# 99O. Turnaround / Cleaning Buffer

## FR-HR-011 — Room Turnaround Buffer

The property may configure a cleaning/turnaround buffer between hourly stays.

Example:

```text
Hourly Booking:
09:00–12:00

Cleaning Buffer:
30 Minutes

Next Earliest Booking:
12:30
```

This configuration shall be exposed to future Reservation and Housekeeping modules.

---

# 99P. Hourly Rate Calendar

## FR-HR-012

The Rate Calendar shall support nightly and hourly/day-use pricing views.

Example:

```text
Standard Room — Sunday

3 Hour: 45,000
6 Hour: 70,000
Day Use: 90,000
Overnight: 120,000
```

If overnight is disabled:

```text
Overnight: Not Available
```

---

# 99Q. Hourly Promotions

## FR-HR-013

Promotions may apply specifically to Hourly or Day-Use rate plans.

Examples:

```text
Weekday 3-Hour Special
10% Off

Morning Day-Use Special
06:00–12:00
30,000 MMK

Stay 6 Hours
Free Coffee / Meal
```

---

# 99R. Hourly Rate Restrictions

## FR-HR-014

Hourly rate plans may support:

- Minimum duration
- Maximum duration
- Allowed check-in window
- Latest checkout time
- Applicable day of week
- Blackout dates
- Room type restrictions
- Customer/channel restrictions

---

# 99S. Hourly / Day-Use Cancellation Policy

## FR-HR-015

Hourly and Day-Use rate plans may use different cancellation rules from overnight stays.

Example:

```text
3-Hour Rate:
Free cancellation until 1 hour before planned arrival.

After that:
50% charge.
```

---

# 99T. Hourly / Day-Use Deposit Policy

## FR-HR-016

The system shall support deposit rules such as:

```text
No Deposit
Fixed Deposit
Percentage Deposit
Full Prepayment
```

for Hourly and Day-Use rate plans.

---

# 99U. Hourly Rate Override

## FR-HR-017

Users with the appropriate permission may override hourly/day-use prices.

The future transaction must record:

- Original Package
- Original Price
- Override Price
- Reason
- User
- Date/Time
- Approval if required

---

# 99V. New Permission Codes

Add recommended permissions:

```text
RATE.HOURLY.VIEW
RATE.HOURLY.CREATE
RATE.HOURLY.UPDATE
RATE.HOURLY.ACTIVATE

RATE.DAYUSE.VIEW
RATE.DAYUSE.CREATE
RATE.DAYUSE.UPDATE
RATE.DAYUSE.ACTIVATE

RATE.STAY_POLICY.VIEW
RATE.STAY_POLICY.UPDATE

RATE.HOURLY.OVERRIDE
RATE.HOURLY.EXTEND
```

---

# 99W. Additional Business Rules

## BR-014
Hourly rates must be linked to a valid Room Type.

## BR-015
Hourly package duration must be greater than zero.

## BR-016
Hourly and Day-Use rates must comply with property stay policy.

## BR-017
A property configured as Day-Use Only must not offer overnight rate plans.

## BR-018
Hourly stays that cross midnight must be rejected unless explicitly allowed.

## BR-019
Extension charges must be calculated according to the active extension policy.

## BR-020
Grace period must be applied before overstay charges.

## BR-021
Hourly availability must be evaluated using date and time.

## BR-022
Confirmed hourly booking prices must remain unchanged when source rates later change.

## BR-023
Cleaning/turnaround buffer must be considered before the same room can be assigned again.

---

# 99X. Additional Validation Rules

## VAL-013
Hourly duration must be greater than zero.

## VAL-014
Day-Use end time must be after start time unless cross-midnight Day Use is explicitly supported.

## VAL-015
Latest check-in time must not exceed configured Day-Use end time.

## VAL-016
Hourly rate must not be negative.

## VAL-017
Cross-midnight stay must comply with property policy.

## VAL-018
A Day-Use Only property cannot activate Overnight rate plans.

## VAL-019
Extension configuration must contain a valid charge method.

## VAL-020
Hourly package duration must not exceed the property's maximum hourly stay unless an authorized exception is supported.

---

# 99Y. Suggested Additional Database Entities

## PropertyStayPolicy

```text
Id
TenantId
PropertyId

AllowOvernight
AllowHourly
AllowDayUse

DefaultStayType

DayUseStartTime
DayUseEndTime
LatestDayUseCheckInTime

MaxHourlyDurationMinutes
AllowCrossMidnightHourly

GracePeriodMinutes

ExtensionPolicyType
OvernightConversionPolicy

IsActive

CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

## HourlyRateTier

```text
Id

RatePlanId
RoomTypeId

DurationMinutes
Price

ApplicableDayMask

StartTime
EndTime

EffectiveFrom
EffectiveTo

IsActive
```

## HourlyExtensionRule

```text
Id

RatePlanId
RoomTypeId

ExtensionType
UnitMinutes
ChargeAmount

GracePeriodMinutes

MaxExtensions

IsActive
```

---

# 99Z. Updated MVP Scope for Myanmar-Market Hotels

The Rate Management MVP should now include:

1. Rate Plan CRUD
2. Stay Type: Overnight / Hourly / Day Use
3. Property Stay Policy
4. Room Type Base Rates
5. 3-Hour Rate Support
6. Configurable Hour Blocks
7. Hourly Rate by Room Type
8. Hourly Rate by Day of Week
9. Day-Use Rate
10. Day-Use Only Property Mode
11. Effective Dates
12. Rate Calendar
13. Weekday / Weekend Pricing
14. Seasonal Pricing
15. Adult / Child / Extra Bed Charges
16. Meal Plan
17. Tax / Service Charge Rules
18. MinLOS / MaxLOS for Overnight
19. CTA / CTD for Overnight
20. Basic Cancellation Policy
21. Basic Deposit Policy
22. Hourly Grace Period
23. Hourly Extension Pricing
24. Cross-Midnight Policy
25. Turnaround / Cleaning Buffer
26. Rate Override Permissions
27. Audit Logging
28. Property / Branch Security
29. Basic Reports

---

# 99AA. Updated Development Order

Recommended sequence:

```text
1. Property Stay Policy
      ↓
2. Meal Plan
      ↓
3. Cancellation Policy
      ↓
4. Deposit Policy
      ↓
5. Rate Plan + Stay Type
      ↓
6. Rate Plan ↔ Room Type
      ↓
7. Overnight Base Rate
      ↓
8. Hourly Rate Tier
      ↓
9. Day-Use Rate
      ↓
10. Rate Calendar
      ↓
11. Weekday / Weekend Rules
      ↓
12. Seasonal Rates
      ↓
13. Occupancy / Extra Charges
      ↓
14. Hourly Extension Rules
      ↓
15. Grace Period
      ↓
16. Cross-Midnight Rules
      ↓
17. Stay Restrictions
      ↓
18. Rate Calculation Service
      ↓
19. Override Security
      ↓
20. Audit / History
      ↓
21. Reports
```

---

# 99AB. Example Myanmar Hotel Setup

Example property:

```text
Property:
Yangon City Hotel

Stay Policy:
✓ Hourly
✓ Day Use
✓ Overnight
```

Rates:

```text
Standard Room

3 Hours
Mon–Thu: 30,000
Fri–Sun: 35,000

6 Hours
Mon–Thu: 50,000
Fri–Sun: 60,000

Day Use
08:00–18:00
70,000

Overnight
120,000
```

Another property:

```text
Property:
City Day Stay

Stay Policy:
✓ Hourly
✓ Day Use
✗ Overnight
```

Rates:

```text
Standard Room

3 Hours:
30,000

6 Hours:
50,000

Day Use:
70,000

Overnight:
Not Allowed
```

This allows the same ERP product to support both traditional hotels and day-use/hourly accommodation businesses.

---

# 99AC. Updated Rate Management Responsibility

The Rate Management module must now answer:

```text
What type of stay is requested?
Overnight / Hourly / Day Use

Is this stay type allowed by the property?

Which room type is requested?

What duration is requested?

What day/date/time is it?

Which rate plan applies?

What package price applies?

Are there extension or grace-period rules?

Can the stay cross midnight?

What taxes/service charges apply?

What is the final price?
```

This keeps stay policy and pricing logic centralized before Reservation Management is implemented.


# 99. Summary

Module 4 is responsible for:

```text
"What price should we sell this room type for?"
"Which rate plan applies?"
"Does the price change by date?"
"What is included?"
"Who is eligible?"
"What restrictions apply?"
"What happens if the guest cancels?"
"What taxes/service charges apply?"
"Can the user override the price?"
```

It should not decide whether the room is physically available for the guest. That responsibility belongs to Reservation / Availability logic.

The clean architecture is:

```text
Room Management
→ What rooms/types exist?

Rate Management
→ What do those room types cost?

Reservation
→ Which room/rate can the guest book for specific dates?
```
