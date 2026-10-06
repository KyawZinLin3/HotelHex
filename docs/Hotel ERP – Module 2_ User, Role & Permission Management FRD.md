# Functional Requirements Document (FRD)

## Module 2 — User, Role & Permission Management

**Product:** Multi-Property Hotel ERP  
**Module:** User, Role & Permission Management  
**Version:** 1.0  
**Document Type:** Functional Requirements Document  
**Priority:** Critical / Foundation Security Module  
**Target Users:** Hotel Groups, Hotel Chains, Resorts, Multi-Branch Businesses

---

# 1. Purpose

The User, Role & Permission Management module controls:

- Who can log in
- What a user can see
- What a user can do
- Which company the user can access
- Which hotel/property the user can access
- Which branch the user can access
- Which menus should be displayed
- Which business actions the user can perform

The module shall provide centralized Role-Based Access Control (RBAC) for the entire Hotel ERP.

---

# 2. Main Concept

The security model shall answer two questions.

## 2.1 What can the user do?

Controlled by:

```text
User
 ↓
Role
 ↓
Permission
```

Example:

```text
User: Su Su

Role:
Front Desk Officer

Permissions:
✓ Reservation View
✓ Reservation Create
✓ Guest View
✓ Guest Create
✓ Check-In
✓ Check-Out

✗ Refund
✗ Payroll View
✗ User Management
```

## 2.2 Where can the user do it?

Controlled by organizational access:

```text
User
 ↓
Company
 ↓
Property
 ↓
Branch
```

Example:

```text
Su Su

Allowed:
✓ Golden Hotel Yangon

Not Allowed:
✗ Golden Hotel Mandalay
✗ Golden Hotel Bagan
```

Therefore:

```text
Effective Access
=
Role Permissions
+
Organization Scope
```

---

# 3. Objectives

The system shall support:

1. User creation and management
2. Custom role creation
3. Permission definition
4. Role-to-permission mapping
5. User-to-role mapping
6. Multiple roles per user
7. Property and branch access
8. Different roles by property/branch
9. Menu authorization
10. Action-level authorization
11. Default property/branch assignment
12. User activation/deactivation
13. Account locking
14. Password management
15. Session management
16. Audit logging
17. Permission validation on APIs
18. Security administration

---

# 4. Scope

## 4.1 In Scope

The module shall include:

- Users
- Roles
- Permissions
- System menus
- Role permissions
- User role assignments
- Organization scope
- Property assignment
- Branch assignment
- Login access
- Password controls
- Account status
- Menu visibility
- API authorization
- Audit history

---

# 5. Out of Scope

The following are not part of this module:

- Employee payroll
- Attendance
- Employee performance
- Room reservation
- Inventory transactions
- Financial transactions

Employee records may later be linked to user accounts through the HR module.

---

# 6. User Types

The system shall support at least:

```text
Super Administrator
Tenant Administrator
Group Administrator
Company Administrator
Property Administrator
Branch Administrator
Standard User
Auditor / Read-Only User
```

Roles shall not be limited to these predefined examples.

Clients shall be able to create custom business roles.

---

# 7. Main Entities

The module shall contain the following core entities:

```text
User

Role

Permission

Menu

RolePermission

UserRoleAssignment

UserOrganizationAccess

MenuPermission

LoginHistory

UserSession

AuditLog
```

---

# 8. User Management

## FR-USR-001 — Create User

Authorized administrators shall be able to create users.

### Required Fields

- Username
- Full Name
- User Status

### Optional Fields

- Employee
- Email
- Phone
- Job Title
- Department
- Preferred Language
- Profile Image
- Default Company
- Default Property
- Default Branch

---

## FR-USR-002 — Unique Username

Username must be unique within the tenant.

Example:

```text
susu
aungaung
manager01
```

Duplicate username creation shall not be permitted.

---

## FR-USR-003 — Email Validation

If email is provided, the system shall validate its format.

Email uniqueness may be configurable depending on the authentication model.

---

# 9. User Status

## FR-USR-004 — Account Status

User accounts shall support:

```text
Pending
Active
Inactive
Locked
Suspended
```

### Active

User can log in normally.

### Inactive

User cannot log in.

### Locked

User has been automatically or manually locked.

### Suspended

User access has temporarily been disabled.

---

# 10. User Activation / Deactivation

## FR-USR-005

Authorized administrators shall be able to activate or deactivate users.

Deactivated users shall immediately lose access to protected ERP functions.

Historical transactions created by the user must remain unchanged.

---

# 11. User Editing

## FR-USR-006

Authorized administrators shall be able to modify:

- Full name
- Email
- Phone
- Department
- Role assignment
- Property assignment
- Branch assignment
- Default location
- Status

Changes shall be audited.

---

# 12. User Deletion

## FR-USR-007

Users referenced by system transactions shall not be physically deleted.

Use:

```text
IsActive = false
```

or account status instead.

---

# 13. Role Management

## FR-ROLE-001 — Create Role

Authorized administrators shall be able to create custom roles.

Fields:

```text
Role Code
Role Name
Description
Role Type
Scope
Status
```

Example:

```text
Role Code:
FRONT_DESK

Role Name:
Front Desk Officer
```

---

# 14. Predefined Roles

The software may provide default templates such as:

```text
Front Desk Officer
Front Desk Supervisor

Reservation Officer

Housekeeper
Housekeeping Supervisor

Restaurant Cashier

Storekeeper

Procurement Officer

Accountant
Finance Manager

HR Officer

IT Administrator

Hotel Manager
General Manager

Auditor
```

Administrators may create additional roles.

---

# 15. System Roles

## FR-ROLE-002

Certain critical roles may be marked as:

```text
System Role
```

Example:

```text
Super Administrator
Tenant Administrator
```

System roles cannot be deleted by ordinary administrators.

---

# 16. Role Status

## FR-ROLE-003

Roles shall support:

```text
Active
Inactive
```

Inactive roles cannot be newly assigned.

Users who depend only on inactive roles shall not receive permissions from those roles.

---

# 17. Permission Management

## FR-PERM-001 — Permission Definition

Each ERP business capability shall have an individual permission.

Permission structure should follow:

```text
MODULE.RESOURCE.ACTION
```

Examples:

```text
RESERVATION.BOOKING.VIEW
RESERVATION.BOOKING.CREATE
RESERVATION.BOOKING.UPDATE
RESERVATION.BOOKING.CANCEL

FRONTDESK.CHECKIN.CREATE
FRONTDESK.CHECKOUT.CREATE

HOUSEKEEPING.ROOM_STATUS.UPDATE

BILLING.PAYMENT.CREATE
BILLING.REFUND.CREATE

PROCUREMENT.PO.APPROVE

HR.PAYROLL.VIEW
```

---

# 18. Standard Permission Actions

Common actions shall include:

```text
VIEW
CREATE
UPDATE
DELETE
APPROVE
REJECT
CANCEL
VOID
REFUND
PRINT
EXPORT
IMPORT
ASSIGN
POST
CLOSE
REOPEN
OVERRIDE
```

Not every module requires every action.

---

# 19. Fine-Grained Permissions

The system should support business-specific permissions rather than only CRUD.

Example:

```text
RESERVATION.CREATE

RESERVATION.CANCEL

ROOM.RATE_OVERRIDE

FRONTDESK.EARLY_CHECKIN

FRONTDESK.LATE_CHECKOUT

BILLING.DISCOUNT

BILLING.REFUND

CASHIER.CLOSE_SHIFT

NIGHT_AUDIT.RUN
```

This is important because hotel permissions depend heavily on business actions.

---

# 20. Role-to-Permission Mapping

## FR-RP-001

Administrator shall be able to assign multiple permissions to a role.

Relationship:

```text
Role
  *
  │
  *
Permission
```

---

## FR-RP-002 — Permission Matrix

The UI should provide a permission matrix.

Example:

| Feature | View | Create | Update | Cancel | Approve |
|---|---:|---:|---:|---:|---:|
| Reservation | ✓ | ✓ | ✓ | ✓ | — |
| Guest | ✓ | ✓ | ✓ | — | — |
| Billing | ✓ | ✓ | ✗ | ✗ | ✗ |
| Refund | ✓ | ✗ | ✗ | ✗ | ✗ |
| Procurement | ✗ | ✗ | ✗ | ✗ | ✗ |

---

# 21. Role Permission Selection

Administrators shall be able to:

- Select all permissions for a module
- Remove all permissions
- Select individual permissions
- Search permissions
- Filter by module
- Copy permissions from another role

---

# 22. User-to-Role Mapping

## FR-UR-001

The system shall allow one user to have one or multiple roles.

Relationship:

```text
User
  *
  │
  *
Role
```

Example:

```text
User:
Kyaw Kyaw

Roles:
✓ Front Desk Supervisor
✓ Night Auditor
```

---

# 23. Multiple Role Permission Rule

## FR-UR-002

When a user has multiple roles, permissions shall normally be combined.

Example:

```text
Role A:
Reservation.View
Reservation.Create

Role B:
Reservation.Cancel

Effective Permissions:

Reservation.View
Reservation.Create
Reservation.Cancel
```

---

# 24. Recommended Permission Strategy

Version 1 should use:

```text
Allow-Based Permissions
```

If permission exists:

```text
ALLOW
```

If permission does not exist:

```text
DENY
```

Avoid complex explicit `Allow + Deny` conflicts in the first version unless required by enterprise clients.

---

# 25. Organizational Scope Assignment

## FR-SCOPE-001

User access shall be assignable by:

- Company
- Property
- Branch

Example:

```text
User:
Aung Aung

Company:
Golden Hotels Co., Ltd.

Properties:
✓ Yangon
✓ Mandalay

Branches:
✓ Yangon Main Branch
✓ Mandalay Main Branch
```

---

# 26. Role Assignment by Organization

## FR-SCOPE-002

The system should support assigning roles within an organizational scope.

Example:

```text
User:
Kyaw Kyaw

Golden Hotel Yangon
Role:
Hotel Manager

Golden Hotel Mandalay
Role:
Auditor
```

This means a user does not necessarily have the same role everywhere.

---

# 27. Recommended Assignment Entity

Use an entity similar to:

```text
UserRoleAssignment

Id

UserId
RoleId

CompanyId
PropertyId
BranchId

EffectiveFrom
EffectiveTo

IsActive
```

---

# 28. Scope Levels

Role scope may support:

```text
Tenant
Group
Company
Property
Branch
```

Example:

```text
Group CFO
Scope:
Group

Hotel Manager
Scope:
Property

Restaurant Manager
Scope:
Branch
```

---

# 29. Permission Evaluation

When a user performs an action, the system shall evaluate:

```text
1. Is user active?

2. Does user have access to the requested organization?

3. Does one of the user's valid roles provide the required permission?

4. Is the role assignment active?

5. Has the assignment expired?

6. If all checks pass:
   Allow

Otherwise:
   Deny
```

---

# 30. Example Permission Evaluation

User:

```text
Su Su
```

Role:

```text
Front Desk Officer
```

Permission:

```text
FRONTDESK.CHECKIN.CREATE
```

Assigned branch:

```text
Yangon Main Branch
```

Request:

```text
Check in guest
at Yangon Main Branch
```

Result:

```text
ALLOW
```

If she attempts:

```text
Check in guest
at Mandalay Branch
```

Result:

```text
DENY
```

even though she technically has `CHECKIN.CREATE`.

---

# 31. Menu Management

## FR-MENU-001 — Menu Definition

ERP menus shall be registered within the system.

Fields:

```text
Menu Code
Menu Name
Parent Menu
Route
Icon
Display Order
Required Permission
Status
Visibility
```

---

# 32. Menu Hierarchy

Example:

```text
Hotel Operations
│
├── Dashboard
├── Reservation
├── Front Desk
├── Rooms
└── Housekeeping

Finance
│
├── General Ledger
├── Accounts Receivable
└── Accounts Payable

Administration
│
├── Users
├── Roles
└── Organization Setup
```

---

# 33. Menu Creation Recommendation

System menus should primarily be created and maintained by the software provider.

Client administrators should normally be able to:

- Show/hide available menus
- Change display order
- Change labels if enabled
- Configure role access

Client administrators should not normally define arbitrary application routes.

---

# 34. Menu Permission Mapping

## FR-MENU-002

Menus shall be linked to permissions.

Example:

```text
Menu:
Reservation

Required Permission:
RESERVATION.BOOKING.VIEW
```

If the user does not have that permission:

```text
Reservation menu = hidden
```

---

# 35. Backend Authorization Requirement

## FR-SEC-001

Menu hiding shall not be treated as security.

Every protected backend API must independently validate permissions.

Example:

```text
POST
/api/v1/reservations

Required Permission:
RESERVATION.BOOKING.CREATE
```

Unauthorized request:

```text
HTTP 403 Forbidden
```

---

# 36. User Organization Selector

## FR-SCOPE-003

Users with access to more than one property shall see a property selector.

Example:

```text
Current Property:

[ Golden Hotel Yangon ▼ ]
```

Available:

```text
Golden Hotel Yangon
Golden Hotel Mandalay
```

Only authorized properties shall appear.

---

# 37. Branch Selector

## FR-SCOPE-004

If multiple branches exist within a property, user shall be able to select an authorized branch.

Example:

```text
Property:
Golden Hotel Yangon

Branch:
[ Main Hotel ▼ ]
```

---

# 38. Default Organization

## FR-SCOPE-005

Each user may have:

- Default Company
- Default Property
- Default Branch

After login, the system shall open the user's default organizational context if available.

---

# 39. User Login

## FR-AUTH-001

Active users shall be able to authenticate using approved login credentials.

Possible methods:

```text
Username + Password

Email + Password
```

Other methods may be added later.

---

# 40. Password Requirements

## FR-AUTH-002

Password policy shall be configurable.

Recommended minimum:

- Minimum length
- Uppercase requirement
- Lowercase requirement
- Number requirement
- Special-character requirement
- Password history
- Expiry policy if required

---

# 41. Password Reset

## FR-AUTH-003

The system shall support secure password reset.

Administrative password reset shall be audited.

The system should require the user to change a temporary password on next login.

---

# 42. Force Password Change

## FR-AUTH-004

Administrator shall be able to enable:

```text
MustChangePassword = true
```

User must change the password before accessing the ERP.

---

# 43. Failed Login Attempts

## FR-AUTH-005

System shall track failed login attempts.

After a configurable threshold:

```text
Account → Locked
```

Example:

```text
Maximum Failed Attempts:
5
```

---

# 44. Account Unlock

## FR-AUTH-006

Authorized administrators may unlock an account.

Automatic unlock after a configurable duration may also be supported.

---

# 45. Session Management

## FR-SESSION-001

System shall create a user session after successful login.

Session shall include:

```text
UserId
TenantId
Login Time
Last Activity
Device Information
IP Address where appropriate
Session Status
```

---

# 46. Session Timeout

## FR-SESSION-002

Inactive sessions shall expire after a configurable duration.

Example:

```text
Session Timeout:
30 minutes
```

---

# 47. Force Logout

## FR-SESSION-003

Administrators with appropriate permissions shall be able to terminate active sessions.

Use cases:

- Employee leaves company
- Stolen device
- Security incident
- Role changed urgently

---

# 48. Effective Permission Refresh

## FR-SEC-002

When user permissions or roles are changed, the system shall ensure the new security configuration takes effect within an appropriate security boundary.

The system may require:

- Session refresh
- Token refresh
- Re-login

depending on the architecture.

---

# 49. Permission Administration Security

Permissions related to security administration shall themselves require permissions.

Examples:

```text
SECURITY.USER.VIEW

SECURITY.USER.CREATE

SECURITY.USER.UPDATE

SECURITY.USER.DISABLE

SECURITY.ROLE.VIEW

SECURITY.ROLE.CREATE

SECURITY.ROLE.UPDATE

SECURITY.PERMISSION.ASSIGN
```

---

# 50. Privilege Escalation Prevention

## FR-SEC-003

Administrators must not be able to assign permissions greater than their allowed administrative scope unless explicitly authorized.

Example:

A Property Administrator should not be able to create a Group Administrator.

---

# 51. Tenant Isolation

## FR-SEC-004

Users from one tenant must never access users, roles, permissions, or transactions from another tenant.

Example:

```text
Tenant A
Golden Hotel Group

Tenant B
Royal Hotel Group
```

Tenant A administrators cannot access Tenant B.

---

# 52. Super Administrator

## FR-SEC-005

Platform Super Administrator shall be treated separately from hotel-client administration.

The SaaS provider's platform administrators should not be exposed as ordinary client users.

---

# 53. Role Templates

## FR-ROLE-004

The system may provide role templates.

Example:

```text
Front Desk Officer Template

Reservation.View
Reservation.Create
Reservation.Update
Guest.View
Guest.Create
CheckIn.Create
CheckOut.Create
```

Administrator may copy the template and customize it.

---

# 54. Copy Role

## FR-ROLE-005

Administrators shall be able to duplicate an existing role.

Example:

```text
Front Desk Officer

Copy →

Senior Front Desk Officer
```

Then add additional permissions.

---

# 55. Role Assignment Effective Dates

## FR-UR-003

Role assignments may support:

```text
Effective From
Effective To
```

Example:

```text
Temporary Night Auditor

From:
01-Oct-2026

To:
31-Oct-2026
```

After expiry, permission automatically becomes inactive.

---

# 56. Temporary Access

## FR-UR-004

Administrators may grant temporary access where required.

Temporary access shall:

- Have an expiry date
- Be auditable
- Automatically expire

---

# 57. Read-Only Role

## FR-ROLE-006

System shall support read-only roles.

Example:

```text
Auditor

✓ View
✓ Export where permitted

✗ Create
✗ Update
✗ Delete
✗ Approve
✗ Refund
```

---

# 58. Sensitive Actions

Sensitive permissions shall be individually controlled.

Examples:

```text
BILLING.REFUND

BILLING.VOID

RATE.OVERRIDE

ROOM.COMPLIMENTARY

PROCUREMENT.APPROVE

PAYROLL.VIEW

PAYROLL.PROCESS

USER.PERMISSION_ASSIGN

NIGHT_AUDIT.RUN
```

These must not automatically be included simply because a user has basic module access.

---

# 59. Approval vs Permission

Permissions determine whether the user can perform or initiate an action.

Approval workflows determine whether another person must approve it.

Example:

```text
User has:
BILLING.DISCOUNT.CREATE

Discount:
15%

Business Rule:
Discount > 10% requires Manager approval.
```

Therefore:

```text
Permission ≠ Approval Workflow
```

Both systems work together.

---

# 60. User Search

## FR-USR-008

User list shall support searching by:

- Username
- Name
- Email
- Role
- Company
- Property
- Branch
- Department
- Status

---

# 61. User Filters

Example filters:

```text
Property: Yangon Hotel

Role: Front Desk Officer

Status: Active
```

---

# 62. Role Search

## FR-ROLE-007

Roles shall be searchable by:

- Role code
- Role name
- Role type
- Scope
- Status

---

# 63. Permission Search

## FR-PERM-002

Permission configuration shall support searching by:

```text
Module
Feature
Action
Permission Code
```

---

# 64. Audit Logging

## FR-AUD-001

Security-related activities shall be audited.

At minimum:

```text
User Created

User Updated

User Activated

User Deactivated

Account Locked

Account Unlocked

Password Reset

Role Created

Role Updated

Role Activated

Role Deactivated

Permission Added to Role

Permission Removed from Role

Role Assigned to User

Role Removed from User

Branch Access Added

Branch Access Removed
```

---

# 65. Audit Information

Audit records should contain:

```text
Event
Entity Type
Entity ID
Old Value
New Value
Performed By
Date/Time
Tenant
Company
Property
Branch
IP Address where appropriate
```

---

# 66. Login History

## FR-AUD-002

The system shall record login events.

Examples:

```text
Successful Login

Failed Login

Logout

Session Expired

Account Locked
```

---

# 67. Role Permission History

## FR-AUD-003

The system shall preserve history of permission changes.

Example:

```text
04-Oct-2026 14:32

Role:
Front Desk Supervisor

Permission Added:
BILLING.DISCOUNT

Changed By:
Admin01
```

---

# 68. Recommended Database Entities

```text
Users

Roles

Permissions

RolePermissions

UserRoleAssignments

Menus

MenuPermissions

LoginHistories

UserSessions

AuditLogs
```

---

# 69. User Entity

Suggested fields:

```text
Id
TenantId

Username
PasswordHash

FullName
Email
Phone

EmployeeId

DefaultCompanyId
DefaultPropertyId
DefaultBranchId

Status

FailedLoginCount
LockedUntil
MustChangePassword

LastLoginAt

CreatedAt
CreatedBy

UpdatedAt
UpdatedBy
```

---

# 70. Role Entity

```text
Id
TenantId

Code
Name
Description

RoleType
ScopeType

IsSystemRole
IsActive

CreatedAt
CreatedBy

UpdatedAt
UpdatedBy
```

---

# 71. Permission Entity

```text
Id

Code

Module
Resource
Action

Description

IsActive
```

Example:

```text
Code:
RESERVATION.BOOKING.CREATE

Module:
Reservation

Resource:
Booking

Action:
Create
```

---

# 72. RolePermission Entity

```text
Id
RoleId
PermissionId

CreatedAt
CreatedBy
```

Unique constraint:

```text
RoleId + PermissionId
```

---

# 73. UserRoleAssignment Entity

Recommended:

```text
Id

UserId
RoleId

CompanyId
PropertyId
BranchId

EffectiveFrom
EffectiveTo

IsActive

CreatedAt
CreatedBy
```

---

# 74. Menu Entity

```text
Id

Code
Name

ParentMenuId

Route
Icon

DisplayOrder

RequiredPermissionId

IsVisible
IsActive
```

---

# 75. Recommended Relationship

```text
                    User
                     │
                     │
                     N
                     │
             UserRoleAssignment
                     │
                     N
                     │
                    Role
                     │
                     │
                     N
                     │
              RolePermission
                     │
                     N
                     │
                 Permission
```

Organization:

```text
UserRoleAssignment
        │
        ├── Company
        ├── Property
        └── Branch
```

---

# 76. Authorization Flow

Every protected request should conceptually follow:

```text
Request
   ↓
Authenticate User
   ↓
Check User Status
   ↓
Resolve Tenant
   ↓
Resolve Property / Branch
   ↓
Load Applicable Roles
   ↓
Calculate Effective Permissions
   ↓
Check Required Permission
   ↓
ALLOW / DENY
```

---

# 77. Example Backend Flow

Request:

```text
POST /api/v1/reservations
```

Required:

```text
RESERVATION.BOOKING.CREATE
```

Backend checks:

```text
Authenticated?
      ↓
User Active?
      ↓
Branch Authorized?
      ↓
Permission Available?
      ↓

YES → Process request

NO → 403 Forbidden
```

---

# 78. Example Frontend Flow

After login:

```text
Get Current User
       ↓
Get Organization Access
       ↓
Get Effective Permissions
       ↓
Generate Accessible Navigation
       ↓
Enable/Disable Actions
```

Example:

User has:

```text
RESERVATION.BOOKING.VIEW
```

but not:

```text
RESERVATION.BOOKING.CREATE
```

UI:

```text
Reservations ✓

[New Reservation] button ✗
```

---

# 79. Important Security Rule

Frontend access control is only for user experience.

Backend access control is mandatory for security.

Never rely only on:

```text
Hide Button
Hide Menu
```

Always validate the operation on the API.

---

# 80. Recommended Main Screens

## Security Administration

```text
Administration
│
├── Users
├── Roles
├── Permission Matrix
├── User Access Assignment
├── Active Sessions
├── Login History
└── Security Audit Logs
```

---

# 81. User List Screen

Suggested columns:

| Username | Name | Role | Default Property | Status | Last Login |
|---|---|---|---|---|---|

Actions:

```text
View
Edit
Assign Roles
Manage Access
Reset Password
Lock
Deactivate
```

---

# 82. Create User Screen

Suggested sections:

### Basic Information

```text
Username
Full Name
Email
Phone
Employee
```

### Organization

```text
Default Company
Default Property
Default Branch
```

### Security

```text
Roles
Status
Temporary Password
Must Change Password
```

---

# 83. Role List Screen

Columns:

```text
Role Code
Role Name
Scope
Users
Status
```

Actions:

```text
View
Edit
Configure Permissions
Copy Role
Deactivate
```

---

# 84. Role Permission Screen

Recommended UI:

```text
Role: Front Desk Supervisor

Hotel Operations

Reservation
[x] View
[x] Create
[x] Update
[x] Cancel

Guest
[x] View
[x] Create
[x] Update

Front Desk
[x] Check-In
[x] Check-Out
[x] Room Change

Billing
[x] View
[x] Receive Payment
[ ] Refund
[ ] Void
```

---

# 85. User Access Screen

Example:

```text
User:
Kyaw Kyaw
```

| Company | Property | Branch | Role |
|---|---|---|---|
| Golden Hotels | Yangon Hotel | Main | Hotel Manager |
| Golden Hotels | Mandalay Hotel | Main | Auditor |

---

# 86. Validation Rules

## VAL-001

Username is required.

## VAL-002

Duplicate username is not permitted.

## VAL-003

Role code must be unique within tenant scope.

## VAL-004

A role must contain at least one permission before being used unless explicitly allowed.

## VAL-005

Expired role assignments must not provide permissions.

## VAL-006

Inactive roles must not provide permissions.

## VAL-007

Inactive users cannot authenticate.

## VAL-008

Users cannot select unauthorized branches.

---

# 87. Business Rules

## BR-001

Every user belongs to one tenant.

## BR-002

A user may have multiple roles.

## BR-003

A role may contain multiple permissions.

## BR-004

A permission may be assigned to multiple roles.

## BR-005

Role assignments may be organization-specific.

## BR-006

A user's effective permissions are determined from active, valid role assignments.

## BR-007

Organization access and functional permission must both pass.

## BR-008

Menu visibility must respect permissions.

## BR-009

Backend endpoints must independently validate authorization.

## BR-010

Security-related configuration changes must be audited.

## BR-011

Users referenced by transactions cannot be permanently deleted.

## BR-012

Users may not assign privileges above their own authorized administrative scope unless explicitly permitted.

---

# 88. Recommended API Endpoints

### Users

```text
GET    /api/v1/security/users
POST   /api/v1/security/users
GET    /api/v1/security/users/{id}
PUT    /api/v1/security/users/{id}

POST   /api/v1/security/users/{id}/activate
POST   /api/v1/security/users/{id}/deactivate
POST   /api/v1/security/users/{id}/lock
POST   /api/v1/security/users/{id}/unlock
POST   /api/v1/security/users/{id}/reset-password
```

### Roles

```text
GET    /api/v1/security/roles
POST   /api/v1/security/roles
GET    /api/v1/security/roles/{id}
PUT    /api/v1/security/roles/{id}
```

### Permissions

```text
GET /api/v1/security/permissions
```

### Role Permissions

```text
GET /api/v1/security/roles/{id}/permissions

PUT /api/v1/security/roles/{id}/permissions
```

### User Role Assignment

```text
GET /api/v1/security/users/{id}/assignments

POST /api/v1/security/users/{id}/assignments

DELETE /api/v1/security/users/{id}/assignments/{assignmentId}
```

---

# 89. Recommended MVP Scope

For the first production version, implement:

## P0 — Must Have

1. User CRUD
2. User status
3. Role CRUD
4. Permission master
5. Role-permission mapping
6. User-role mapping
7. Multiple roles per user
8. User-property mapping
9. User-branch mapping
10. Default property/branch
11. Permission-based menu visibility
12. Backend permission validation
13. Login
14. Password reset
15. Account locking
16. Audit logging

---

# 90. P1 — Next

Add:

1. Different roles per branch
2. Role templates
3. Copy role
4. Effective-from/to dates
5. Temporary access
6. Session management
7. Force logout
8. Login history
9. Property/branch switcher
10. Security reports

---

# 91. P2 — Enterprise Enhancements

Add later:

1. MFA
2. SSO
3. Microsoft Entra ID / Active Directory integration
4. Passwordless authentication
5. IP restrictions
6. Device policies
7. Approval for privilege changes
8. Advanced security alerts
9. Separation-of-duties rules
10. Privileged access management

---

# 92. Recommended Development Order

```text
1. Permission Master
        ↓
2. Role
        ↓
3. Role ↔ Permission
        ↓
4. User
        ↓
5. User ↔ Role
        ↓
6. User ↔ Property / Branch
        ↓
7. Authentication
        ↓
8. Authorization Middleware
        ↓
9. Frontend Permission Handling
        ↓
10. Menu Filtering
        ↓
11. Security Audit Logs
        ↓
12. Session Management
```

---

# 93. Module Completion Criteria

Module 2 shall be considered functionally complete when:

- Administrator can create users.
- Administrator can create custom roles.
- Permissions can be assigned to roles.
- Users can have multiple roles.
- Users can be mapped to properties and branches.
- User access is restricted to authorized branches.
- Role permissions control system actions.
- Menus are filtered according to permissions.
- Buttons/actions respect permissions.
- Backend APIs reject unauthorized requests.
- Disabled users cannot log in.
- Passwords can be reset securely.
- Accounts can be locked/unlocked.
- Security configuration changes are audited.
- Different hotel users can safely operate within the same ERP installation.

---

# 94. Final Recommended Access Model

The final structure should be:

```text
                    Tenant
                       │
                       │
                     User
                    /    \
                   /      \
                Roles    Organization
                  │         │
            Permissions   Company
                  │         ↓
                Menus     Property
                            ↓
                           Branch
```

The practical authorization formula is:

```text
Can User Perform Action?

        ↓

User Active?
        +
Correct Tenant?
        +
Authorized Property?
        +
Authorized Branch?
        +
Required Permission?
        +
Assignment Still Valid?

        ↓

YES → ALLOW

NO → DENY
```

This model provides a strong foundation for the rest of the Hotel ERP.