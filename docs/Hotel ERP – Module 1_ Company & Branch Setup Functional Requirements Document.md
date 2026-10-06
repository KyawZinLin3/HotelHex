# Functional Requirements Document (FRD)

## Module 1 — Company & Branch Setup

**Product:** Multi-Property Hotel ERP  
**Module:** Company & Branch Setup  
**Version:** 1.0  
**Document Type:** Functional Requirements Document  
**Target Users:** Hotel Groups, Hotel Chains, Independent Hotels, Resorts  
**Priority:** Critical / Foundation Module

---

# 1. Purpose

The Company & Branch Setup module provides the organizational foundation of the Hotel ERP.

The module shall allow a business group to configure and manage:

- Business groups
- Legal companies
- Hotel properties
- Branches
- Buildings
- Floors
- Departments
- Cost centers
- Profit centers
- Addresses
- Contact information
- Currencies
- Tax configurations
- Financial settings
- Business dates
- Operating hours
- Branch-level settings

All operational modules must reference the correct organizational entity.

For example:

Company → Property → Branch → Department → Operational Transaction

---

# 2. Business Objective

The module shall enable a hotel group to centrally manage multiple hotels while allowing each property or branch to operate independently.

Example:

```text
Golden Hospitality Group

├── Golden Hotel Yangon
│   ├── Front Office
│   ├── Housekeeping
│   ├── Restaurant
│   ├── Finance
│   └── Engineering
│
├── Golden Hotel Mandalay
│   ├── Front Office
│   ├── Housekeeping
│   ├── Restaurant
│   └── Finance
│
└── Golden Resort Ngwe Saung
    ├── Front Office
    ├── Housekeeping
    ├── F&B
    └── Recreation
```

Head Office shall be able to manage and report across all properties.

---

# 3. Scope

## 3.1 In Scope

The module includes:

1. Business Group Management
2. Company Management
3. Hotel Property Management
4. Branch Management
5. Building Management
6. Floor Management
7. Department Management
8. Cost Center Management
9. Profit Center Management
10. Address Management
11. Contact Management
12. Currency Configuration
13. Tax Configuration
14. Business Date Configuration
15. Financial Year Configuration
16. Operating Hours
17. Document Number Configuration
18. Branch Settings
19. Property Status Management
20. Organization Hierarchy
21. User-to-Branch Assignment
22. Branch-Level Access Control
23. Audit History
24. Organization Reports

---

# 4. Out of Scope

The following functions are not part of Module 1:

- Room reservation
- Guest registration
- Check-in
- Check-out
- Housekeeping
- Payroll
- Accounting transactions
- Procurement transactions
- POS transactions
- Inventory transactions

However, those modules will use the organizational data configured here.

---

# 5. Organization Hierarchy

The system shall support the following hierarchy:

```text
Business Group
    │
    ├── Company
    │     │
    │     ├── Property / Hotel
    │     │     │
    │     │     ├── Branch
    │     │     │    │
    │     │     │    ├── Building
    │     │     │    │     └── Floor
    │     │     │    │
    │     │     │    └── Department
    │     │     │          ├── Cost Center
    │     │     │          └── Profit Center
```

Example:

```text
ABC Hospitality Group
      │
      └── ABC Hotels Co., Ltd.
             │
             ├── ABC Hotel Yangon
             │       │
             │       ├── Main Building
             │       │     ├── Floor 1
             │       │     ├── Floor 2
             │       │     └── Floor 3
             │       │
             │       ├── Front Office
             │       ├── Housekeeping
             │       ├── F&B
             │       └── Finance
             │
             └── ABC Hotel Mandalay
```

---

# 6. User Roles

The module should support at minimum:

| Role | Responsibility |
|---|---|
| Super Administrator | Full system access |
| Group Administrator | Manage all companies/properties |
| Company Administrator | Manage assigned company |
| Property Administrator | Manage assigned hotel |
| Branch Manager | Manage assigned branch |
| Finance Administrator | View financial configuration |
| HR Administrator | View organization/department structures |
| IT Administrator | Configure system settings |
| Auditor | Read-only access |

---

# 7. Business Group Management

## FR-ORG-001 — Create Business Group

The system shall allow authorized users to create a business group.

Required fields:

- Group Code
- Group Name

Optional fields:

- Registration Name
- Registration Number
- Logo
- Address
- Country
- Phone
- Email
- Website
- Description

Example:

```text
Group Code: GHG
Group Name: Golden Hospitality Group
```

### Acceptance Criteria

- Group code must be unique.
- Group name is mandatory.
- System must record Created By and Created Date.
- Inactive groups cannot be selected in new transactions.

---

## FR-ORG-002 — Update Business Group

Authorized users shall be able to modify group information.

The system must audit:

- Old value
- New value
- Changed by
- Changed date/time

---

## FR-ORG-003 — Activate / Deactivate Group

The administrator shall be able to activate or deactivate a business group.

The system shall prevent deletion if the group has dependent data.

---

# 8. Company Management

## FR-CMP-001 — Create Company

The system shall allow companies to be created under a business group.

Fields:

### General Information

- Company Code
- Legal Company Name
- Trading Name
- Registration Number
- Tax Registration Number
- Incorporation Date
- Business Type
- Country
- Default Currency
- Default Language
- Time Zone

### Contact

- Phone
- Secondary Phone
- Email
- Website

### Address

- Address Line 1
- Address Line 2
- Township/City
- State/Region
- Postal Code
- Country

### Branding

- Company Logo
- Receipt Logo
- Invoice Logo

---

## FR-CMP-002 — Company Code

Every company must have a unique company code.

Example:

```text
GH01
GH02
GH03
```

Company code should not normally be editable after transactions exist.

---

## FR-CMP-003 — Company Status

Company status shall include:

```text
Active
Inactive
Suspended
```

---

## FR-CMP-004 — Company Default Currency

Each company must have one base currency.

Example:

```text
Myanmar Company → MMK
Thailand Company → THB
Singapore Company → SGD
```

---

# 9. Hotel Property Management

A property represents an individual hotel, resort, serviced apartment, or similar hospitality establishment.

## FR-PROP-001 — Create Property

Fields:

- Property Code
- Property Name
- Company
- Property Type
- Star Rating
- Opening Date
- Number of Rooms
- Address
- Phone
- Email
- Website
- Time Zone
- Default Currency
- Check-in Time
- Check-out Time
- Property Status

Property types:

```text
Hotel
Resort
Boutique Hotel
Hostel
Serviced Apartment
Guest House
Villa
Other
```

---

## FR-PROP-002 — Property Code

Each property shall have a unique property code within the company.

Example:

```text
YGN01
MDY01
BAG01
NGS01
```

---

## FR-PROP-003 — Property Branding

Each property may maintain:

- Logo
- Invoice header
- Receipt header
- Email branding
- Hotel description

---

## FR-PROP-004 — Property Status

Statuses:

```text
Pre-Opening
Active
Temporarily Closed
Inactive
```

Inactive properties shall not accept new reservations.

---

# 10. Branch Management

A property may contain one or more operational branches.

Example:

```text
Golden Resort

Main Hotel Branch
Beach Villa Branch
Event Center Branch
```

## FR-BRN-001 — Create Branch

Fields:

- Branch Code
- Branch Name
- Property
- Branch Type
- Address
- Contact Information
- Opening Date
- Operating Hours
- Currency
- Tax Configuration
- Status

---

## FR-BRN-002 — Branch Types

Examples:

```text
Hotel
Restaurant
Spa
Resort
Warehouse
Head Office
Central Kitchen
Event Center
Other
```

---

## FR-BRN-003 — Branch Status

Statuses:

```text
Active
Inactive
Temporarily Closed
```

---

## FR-BRN-004 — Main Branch

The system shall allow one branch to be marked as the main branch of the property.

---

# 11. Building Management

## FR-BLD-001 — Create Building

Properties shall support multiple buildings.

Fields:

- Building Code
- Building Name
- Property
- Branch
- Number of Floors
- Description
- Status

Example:

```text
Building A
Building B
Beach Wing
Garden Wing
Main Tower
```

---

# 12. Floor Management

## FR-FLR-001 — Create Floor

Fields:

- Floor Code
- Floor Name
- Building
- Floor Number
- Description
- Status

Example:

```text
G — Ground Floor
01 — First Floor
02 — Second Floor
03 — Third Floor
```

This information shall later be referenced by the Room Management module.

---

# 13. Department Management

## FR-DEPT-001 — Create Department

The administrator shall be able to define departments by branch.

Fields:

- Department Code
- Department Name
- Company
- Property
- Branch
- Parent Department
- Manager
- Cost Center
- Status

Typical hotel departments:

```text
Front Office
Reservation
Housekeeping
Food & Beverage
Kitchen
Finance
Accounting
Human Resources
IT
Engineering
Maintenance
Security
Sales
Marketing
Procurement
Warehouse
Spa
Recreation
Banquet
Management
```

---

## FR-DEPT-002 — Department Hierarchy

Departments may contain child departments.

Example:

```text
Food & Beverage
│
├── Restaurant
├── Bar
├── Kitchen
├── Banquet
└── Room Service
```

---

# 14. Cost Center Management

## FR-CC-001 — Create Cost Center

Fields:

- Cost Center Code
- Name
- Company
- Property
- Branch
- Department
- Description
- Active Status

Example:

```text
CC-FO      Front Office
CC-HK      Housekeeping
CC-FNB     Food & Beverage
CC-ENG     Engineering
```

Cost centers will later be used by:

- Accounting
- Budgeting
- Procurement
- Inventory
- Payroll

---

# 15. Profit Center Management

## FR-PC-001 — Create Profit Center

Revenue-generating departments may be configured as profit centers.

Examples:

```text
Rooms
Restaurant
Bar
Spa
Banquet
Laundry
```

Fields:

- Profit Center Code
- Name
- Property
- Branch
- Department
- Status

---

# 16. Currency Configuration

## FR-CUR-001 — Base Currency

Each company must define a base currency.

---

## FR-CUR-002 — Supported Currencies

Administrator shall configure currencies accepted by the property.

Example:

```text
MMK
USD
THB
SGD
EUR
CNY
```

---

## FR-CUR-003 — Currency Information

Fields:

- Currency Code
- Currency Name
- Symbol
- Decimal Places
- Exchange Rate
- Effective Date
- Status

---

# 17. Tax Configuration

## FR-TAX-001 — Create Tax Type

The system shall allow configurable taxes.

Fields:

- Tax Code
- Tax Name
- Tax Rate
- Calculation Method
- Effective Date
- Expiry Date
- Applicable Company
- Applicable Branch
- Status

Example:

```text
Tax Code: CT5
Tax Name: Commercial Tax
Rate: 5%
```

---

## FR-TAX-002 — Tax Calculation Type

Support:

```text
Exclusive
Inclusive
```

---

## FR-TAX-003 — Service Charge

Service charges shall be configurable independently from tax.

Example:

```text
Room Rate:      100,000
Service Charge:  10,000
Tax:              5,500
Total:           115,500
```

---

# 18. Business Date Management

Hotels require a business date separate from the server date.

## FR-DATE-001 — Business Date

Each property shall maintain a current business date.

Example:

```text
System Date:
04-Oct-2026 01:30 AM

Hotel Business Date:
03-Oct-2026
```

This is required because Night Audit may not yet have been completed.

---

## FR-DATE-002 — Business Date Change

Normal users shall not manually modify the business date.

Business date shall normally advance through the Night Audit process.

---

# 19. Financial Year

## FR-FY-001 — Financial Year Setup

Administrator shall configure financial years.

Fields:

- Financial Year Code
- Start Date
- End Date
- Status

Example:

```text
FY2026

01-Jan-2026
to
31-Dec-2026
```

---

# 20. Operating Hours

## FR-OPR-001 — Branch Operating Hours

Configure:

- Opening time
- Closing time
- 24-hour operation
- Holiday hours

Hotels may operate 24/7 while restaurants or spas have their own operating hours.

---

# 21. Standard Hotel Times

## FR-OPR-002 — Default Check-In / Check-Out

Property shall define:

```text
Check-In Time:  14:00
Check-Out Time: 12:00
```

These defaults will later be consumed by reservation/front-office modules.

---

# 22. Number Sequence Configuration

## FR-SEQ-001 — Document Numbering

Administrators shall configure document numbering.

Example:

```text
Reservation:
YGN-RES-2026-000001

Invoice:
YGN-INV-2026-000001

Receipt:
YGN-RCP-2026-000001

Purchase Order:
YGN-PO-2026-000001
```

Configuration options:

- Prefix
- Branch code
- Document code
- Year
- Sequence length
- Reset frequency

Reset options:

```text
Never
Yearly
Monthly
Daily
```

---

# 23. Branch Configuration

Each branch may have its own settings.

## FR-SET-001 — Branch-Level Settings

Examples:

- Default currency
- Taxes
- Service charge
- Default language
- Time zone
- Check-in time
- Check-out time
- Default warehouse
- Default cashier
- Invoice template
- Receipt template
- Email settings

---

# 24. User Branch Assignment

## FR-USR-001 — Assign User to Branch

A user may be assigned to:

- One branch
- Multiple branches
- All branches

Example:

```text
User: Rick

Accessible Properties:
✓ Yangon Hotel
✓ Mandalay Hotel
✗ Bagan Hotel
```

---

## FR-USR-002 — Default Branch

Users assigned to multiple branches must have a default branch.

---

# 25. Branch Data Isolation

## FR-SEC-001 — Branch Data Security

Users shall only see data belonging to authorized branches.

Example:

A Yangon front-desk employee must not see Mandalay reservations unless explicitly authorized.

---

## FR-SEC-002 — Group-Level Access

Authorized Head Office users may access multiple properties.

---

# 26. Branch Switching

## FR-SEC-003 — Property / Branch Selector

Authorized users shall be able to change the active property or branch.

Example UI:

```text
Golden Hospitality Group

Property:
[ Golden Hotel Yangon ▼ ]

Branch:
[ Main Hotel ▼ ]
```

After switching branch, all operational pages shall use that branch context.

---

# 27. Approval Structure

## FR-APP-001 — Branch Approval Hierarchy

Administrator shall define approval authorities.

Example:

```text
Department Manager
        ↓
Branch Manager
        ↓
General Manager
        ↓
Head Office
```

Detailed approval rules will be implemented in the Workflow module.

---

# 28. Organization Status Rules

The following records shall support activation/deactivation:

- Company
- Property
- Branch
- Building
- Floor
- Department
- Cost Center
- Profit Center

Records referenced by transactions must not be physically deleted.

Use:

```text
Active = true / false
```

instead of hard deletion.

---

# 29. Search & Filtering

## FR-SRC-001

Users shall be able to search organizations by:

- Code
- Name
- Company
- Property
- Branch
- Status

---

## FR-SRC-002

Lists shall support filtering and sorting.

Example filters:

```text
Company: All
Property: Yangon Hotel
Status: Active
```

---

# 30. Audit Logging

## FR-AUD-001

The system shall audit important configuration changes.

Store:

- Entity
- Record ID
- Action
- Old Value
- New Value
- User
- Date/time
- Branch
- IP/device information where appropriate

Actions include:

```text
CREATE
UPDATE
ACTIVATE
DEACTIVATE
```

---

# 31. Duplicate Validation

## FR-VAL-001

System shall prevent duplicate codes within the configured scope.

Examples:

- Company Code
- Property Code
- Branch Code
- Department Code
- Cost Center Code

---

# 32. Required Field Validation

System must validate mandatory fields before saving.

Example:

```text
Property Name is required.
Property Code is required.
Company is required.
```

Errors shall be displayed clearly to the user.

---

# 33. Dependency Validation

The system shall prevent invalid hierarchy configurations.

Example:

A floor cannot exist without a building.

```text
Company
  ↓
Property
  ↓
Branch
  ↓
Building
  ↓
Floor
```

---

# 34. Delete Rules

Records shall not be deleted when referenced by business transactions.

Example:

If `YGN01` already has reservations:

```text
Delete Property ❌

Deactivate Property ✓
```

---

# 35. Organization Dashboard

The organization dashboard should display:

- Number of companies
- Number of properties
- Number of active branches
- Total rooms
- Number of departments
- Number of active users

Example:

```text
Golden Hospitality Group

Companies              2
Hotels                  8
Branches               11
Total Rooms           642
Departments            84
Active Users          327
```

---

# 36. Reports

Module 1 shall provide:

### Organization Reports

- Company List
- Property List
- Branch List
- Department List
- Organization Structure
- Cost Center List
- Profit Center List
- User Branch Access
- Active/Inactive Organizations

Reports shall support:

- Screen view
- Print
- PDF export
- Excel export

subject to user permission.

---

# 37. Recommended Main Screens

The frontend should include the following screens.

### Administration

```text
Organization
│
├── Business Groups
├── Companies
├── Properties
├── Branches
├── Buildings
├── Floors
├── Departments
├── Cost Centers
└── Profit Centers
```

### Configuration

```text
Configuration
│
├── Currencies
├── Taxes
├── Financial Years
├── Operating Hours
├── Business Date
├── Number Sequences
└── Branch Settings
```

---

# 38. Recommended Company Setup Wizard

For better UX, first-time configuration should use a setup wizard.

```text
Step 1
Company Information

        ↓

Step 2
Hotel / Property

        ↓

Step 3
Branch

        ↓

Step 4
Buildings & Floors

        ↓

Step 5
Departments

        ↓

Step 6
Currency & Tax

        ↓

Step 7
Business Settings

        ↓

Setup Complete
```

---

# 39. Suggested Data Entities

Core database entities:

```text
BusinessGroup

Company

Property

Branch

Building

Floor

Department

CostCenter

ProfitCenter

Currency

ExchangeRate

Tax

FinancialYear

BusinessDate

NumberSequence

BranchSetting

Address

Contact

UserBranch

AuditLog
```

---

# 40. Suggested Relationships

```text
BusinessGroup
    1
    │
    N
Company
    1
    │
    N
Property
    1
    │
    N
Branch
    │
    ├───────────────┐
    │               │
    N               N
Building        Department
    │               │
    N               ├── CostCenter
Floor               │
                    └── ProfitCenter
```

---

# 41. Common Fields

Major entities should contain:

```text
Id
Code
Name
Description

CreatedAt
CreatedBy

UpdatedAt
UpdatedBy

IsActive

CompanyId
PropertyId
BranchId
```

Only include organizational IDs where logically appropriate.

---

# 42. Multi-Tenant Consideration

If the ERP will eventually be sold as SaaS to different hotel companies, every customer's information must be isolated using a tenant structure.

Recommended top-level architecture:

```text
Tenant
  │
  └── Business Group
        │
        └── Company
             │
             └── Property
                  │
                  └── Branch
```

Example:

```text
Tenant A
Golden Hospitality Group

Tenant B
Royal Hotels Group

Tenant C
Myanmar Resorts Group
```

Tenant A must never access Tenant B's data.

---

# 43. Permission Requirements

Recommended permission codes:

```text
ORG.GROUP.VIEW
ORG.GROUP.CREATE
ORG.GROUP.UPDATE

ORG.COMPANY.VIEW
ORG.COMPANY.CREATE
ORG.COMPANY.UPDATE

ORG.PROPERTY.VIEW
ORG.PROPERTY.CREATE
ORG.PROPERTY.UPDATE

ORG.BRANCH.VIEW
ORG.BRANCH.CREATE
ORG.BRANCH.UPDATE

ORG.DEPARTMENT.VIEW
ORG.DEPARTMENT.CREATE
ORG.DEPARTMENT.UPDATE

ORG.CONFIG.VIEW
ORG.CONFIG.UPDATE
```

Permissions should support:

```text
View
Create
Edit
Activate
Deactivate
Export
```

---

# 44. Non-Functional Requirements

## NFR-001 — Performance

Standard organization list pages should normally load within 2 seconds under expected operating loads.

## NFR-002 — Security

All APIs shall require authentication except explicitly public endpoints.

## NFR-003 — Authorization

Every protected operation must validate user permission and organizational scope.

## NFR-004 — Auditability

Sensitive administrative modifications must be audited.

## NFR-005 — Data Integrity

Foreign-key relationships shall prevent invalid organizational references.

## NFR-006 — Scalability

Architecture should support:

- Multiple companies
- Hundreds of properties
- Thousands of branches/departments
- Large numbers of users

without requiring architectural redesign.

---

# 45. Main Business Rules

### BR-001

Each Property must belong to one Company.

### BR-002

Each Branch must belong to one Property.

### BR-003

Each Building must belong to one Property/Branch.

### BR-004

Each Floor must belong to one Building.

### BR-005

Each Department must belong to an organizational scope.

### BR-006

Inactive branches cannot create new operational transactions.

### BR-007

Records referenced by transactions cannot be permanently deleted.

### BR-008

Users can only access authorized organizational units.

### BR-009

Property codes must be unique within their appropriate business scope.

### BR-010

The business date shall normally advance through Night Audit.

---

# 46. Example API Structure

Recommended endpoints:

```text
/api/v1/organization/groups

/api/v1/organization/companies

/api/v1/organization/properties

/api/v1/organization/branches

/api/v1/organization/buildings

/api/v1/organization/floors

/api/v1/organization/departments

/api/v1/organization/cost-centers

/api/v1/organization/profit-centers
```

Configuration:

```text
/api/v1/config/currencies

/api/v1/config/taxes

/api/v1/config/financial-years

/api/v1/config/business-date

/api/v1/config/number-sequences

/api/v1/config/branch-settings
```

---

# 47. Suggested Menu Structure

```text
Dashboard

Hotel Operations

Sales

Inventory

Procurement

Finance

HR

Reports

Administration
   │
   ├── Organization
   │     ├── Companies
   │     ├── Properties
   │     ├── Branches
   │     ├── Buildings
   │     ├── Floors
   │     ├── Departments
   │     ├── Cost Centers
   │     └── Profit Centers
   │
   ├── Users & Roles
   │
   └── Configuration
         ├── Currency
         ├── Tax
         ├── Financial Year
         ├── Business Date
         └── Number Sequence
```

---

# 48. Module Completion Criteria

Module 1 shall be considered complete when:

- Company can be created.
- Property can be created.
- Multiple branches can be created.
- Buildings and floors can be configured.
- Departments can be configured.
- Cost centers can be configured.
- Profit centers can be configured.
- Currency can be configured.
- Taxes can be configured.
- Financial year can be configured.
- Business date can be maintained.
- Users can be assigned to branches.
- Branch access restrictions work.
- Records support activation/deactivation.
- Audit logs capture administrative changes.
- Organization hierarchy can be viewed.
- Other ERP modules can reference Company/Property/Branch IDs.

---

# 49. Recommended MVP Scope

For the first development version, implement:

**P0 — Must Have**

1. Company
2. Property
3. Branch
4. Building
5. Floor
6. Department
7. Currency
8. Tax
9. Business Date
10. User Branch Assignment
11. Branch Selector
12. Audit Fields

**P1 — Next**

13. Cost Center
14. Profit Center
15. Financial Year
16. Number Sequence
17. Branch Settings
18. Organization Dashboard

**P2 — Enterprise Enhancement**

19. Business Group
20. Multi-company consolidation configuration
21. Advanced approval hierarchy
22. Complex organization structures

---

# 50. Recommended Development Order

```text
1. Tenant foundation
       ↓
2. Company
       ↓
3. Property
       ↓
4. Branch
       ↓
5. Building
       ↓
6. Floor
       ↓
7. Department
       ↓
8. Currency
       ↓
9. Tax
       ↓
10. Business Date
       ↓
11. User ↔ Branch Mapping
       ↓
12. Access Control
       ↓
13. Branch Selector
       ↓
14. Audit Logging
```

Once these are stable, development can move to:

**Module 2 — Property, Room & Room-Type Management.**

---

# 51. Final Functional Outcome

After completing Module 1, the Hotel ERP should be capable of representing structures such as:

```text
Golden Hospitality Group
│
├── Golden Hotels Co., Ltd.
│
│   ├── Golden Hotel Yangon
│   │   ├── Main Branch
│   │   │
│   │   ├── Main Building
│   │   │   ├── Floor 1
│   │   │   ├── Floor 2
│   │   │   └── Floor 3
│   │   │
│   │   └── Departments
│   │       ├── Front Office
│   │       ├── Housekeeping
│   │       ├── F&B
│   │       ├── Finance
│   │       └── Engineering
│   │
│   └── Golden Hotel Mandalay
│
└── Golden Resorts Co., Ltd.
    └── Golden Resort Ngwe Saung
```

This organizational structure becomes the foundation for every subsequent Hotel ERP module.