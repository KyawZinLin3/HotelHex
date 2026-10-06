# Hotel ERP — Module 5: Guest Management
## Functional Requirements Document (FRD)

**Product:** Multi-Property Hotel ERP  
**Module:** Module 5 — Guest Management  
**Version:** 1.0  
**Document Type:** Functional Requirements Document  
**Priority:** Critical / Core PMS Foundation  
**Target Users:** Hotels, Resorts, Serviced Apartments, Hotel Groups, Multi-Property Hospitality Businesses

---

# 1. Purpose

The Guest Management module maintains a centralized and reusable guest profile for hotel operations.

It provides the master guest information required by later modules such as:

- Reservation Management
- Front Desk / Check-In / Check-Out
- Billing / Guest Folio
- CRM
- Loyalty
- Guest Feedback
- Corporate Sales
- Marketing
- Reporting

The module answers questions such as:

- Who is the guest?
- Is this a returning guest?
- What contact information is available?
- What identification document is used?
- Which properties has the guest stayed at?
- What preferences has the guest previously requested?
- Is the guest marked VIP or restricted?
- Are there duplicate guest profiles?
- Who changed sensitive guest information?

---

# 2. Business Objective

The system shall allow authorized users to:

1. Create guest profiles.
2. Search existing guests before creating duplicates.
3. Maintain personal and contact information.
4. Maintain identification documents.
5. Store addresses.
6. Store guest preferences.
7. Maintain VIP classifications.
8. Maintain guest tags and segments.
9. Maintain internal notes.
10. Track accompanying guests / relationships.
11. Track guest stay history.
12. Track guest communication preferences.
13. Restrict or flag guests where business rules allow.
14. Merge duplicate guest profiles.
15. Maintain guest documents / attachments.
16. Support multi-property guest profiles.
17. Protect sensitive guest data.
18. Audit important changes.
19. Provide guest information to Reservation and Front Desk modules.

---

# 3. Dependencies

## 3.1 Module 1 — Organization & Property Setup

Guest activity may be associated with:

- Tenant
- Company
- Property
- Branch

The guest master should normally be tenant-wide so the same guest can be recognized across multiple properties.

## 3.2 Module 2 — User, Role & Permission Management

Example permissions:

```text
GUEST.PROFILE.VIEW
GUEST.PROFILE.CREATE
GUEST.PROFILE.UPDATE
GUEST.PROFILE.MERGE

GUEST.IDENTITY.VIEW
GUEST.IDENTITY.UPDATE

GUEST.NOTE.VIEW
GUEST.NOTE.CREATE

GUEST.RESTRICTION.VIEW
GUEST.RESTRICTION.MANAGE

GUEST.REPORT.VIEW
GUEST.REPORT.EXPORT
```

## 3.3 Module 3 — Room Management

Guest Management does not directly manage rooms, but stay history will later reference room and room-type information.

## 3.4 Rate Management

Guest Management may later help determine eligible rates such as:

- Corporate Rate
- Member Rate
- VIP Rate
- Promotional Rate

The guest profile itself must not calculate room rates.

---

# 4. Scope

## 4.1 In Scope

1. Guest Profile Management
2. Guest Type Classification
3. Personal Information
4. Contact Information
5. Address Management
6. Identity Document Management
7. Nationality / Country
8. Guest Preferences
9. VIP Management
10. Guest Tags / Segments
11. Internal Notes
12. Guest Status
13. Restricted / Do-Not-Rent Status
14. Accompanying Guest Relationships
15. Stay History View
16. Guest Documents / Attachments
17. Communication Preferences
18. Marketing Consent
19. Duplicate Detection
20. Guest Profile Merge
21. Guest Search
22. Guest Audit History
23. Guest Reports
24. Multi-Property Guest Recognition
25. Data Protection / Masking
26. Retention / Anonymization Support

---

# 5. Out of Scope

- Reservation creation
- Room assignment
- Check-in / check-out
- Folio charges
- Payments
- Loyalty point calculation
- Marketing campaign execution
- Complaint workflow
- Government submission workflow

---

# 6. Core Concept

A Guest Profile represents a reusable person record.

Example:

```text
Guest:
U Aung Min

Phone:
09xxxxxxxxx

Nationality:
Myanmar

Preferred Language:
Myanmar

VIP:
No

Stay History:
Yangon Hotel — 3 stays
Mandalay Hotel — 1 stay
```

The same guest should not be recreated for every stay.

---

# 7. Guest Master Scope

## FR-GST-001 — Tenant-Level Guest Master

A guest profile shall normally belong to the tenant/hotel group.

Example:

```text
Golden Hospitality Group

Guest: John Smith

Stay 1: Yangon Hotel
Stay 2: Mandalay Hotel
Stay 3: Bagan Resort
```

Property-specific notes and restrictions shall remain scoped where needed.

---

# 8. Create Guest

## FR-GST-002 — Create Guest Profile

Required configurable fields:

- Full Name
- Guest Type
- Status

At least one contact or identity value may be required by property policy:

- Phone
- Email
- NRC / National ID
- Passport

Optional fields:

- Title
- First Name
- Middle Name
- Last Name
- Display Name
- Date of Birth
- Gender if operationally required
- Nationality
- Preferred Language
- Occupation
- Company
- Phone
- Email
- Address
- Notes
- VIP Level
- Guest Tags

The system should avoid collecting unnecessary personal data.

---

# 9. Guest Name

## FR-GST-003

Support flexible naming:

```text
Title
FirstName
MiddleName
LastName
FullName
DisplayName
```

`FullName` shall support naming conventions where first/last-name structure is not appropriate.

---

# 10. Guest Type

## FR-GST-004

Examples:

```text
Individual
Corporate Guest
Travel Agent Guest
Group Guest
Walk-In
Member
VIP
Staff / Internal
Other
```

Guest Type is classification only.

---

# 11. Guest Status

## FR-GST-005

Statuses:

```text
Active
Inactive
Restricted
Archived
```

---

# 12. Contact Information

## FR-CONTACT-001 — Phone

Support:

- Primary Phone
- Secondary Phone
- Country Code
- Phone Type
- Verification Status if used

Phone values should be normalized where possible.

## FR-CONTACT-002 — Email

Support:

- Primary Email
- Secondary Email
- Format validation
- Verification Status if used

## FR-CONTACT-003 — Preferred Contact Method

Examples:

```text
Phone
Email
SMS
Messaging App
None
```

---

# 13. Address Management

## FR-ADDR-001

Support one or more addresses.

Fields:

- Address Type
- Address Line 1
- Address Line 2
- Township / City
- State / Region
- Postal Code
- Country
- Is Primary

Address Types:

```text
Home
Work
Billing
Other
```

---

# 14. Identity Document Management

## FR-ID-001 — Identity Documents

Supported examples:

```text
Myanmar NRC
Passport
National ID
Driving Licence
Other Government ID
```

## FR-ID-002 — Myanmar NRC

Store normalized NRC information when operationally required.

Masked display example:

```text
Full:
12/ABC(N)123456

Masked:
12/ABC(N)******
```

## FR-ID-003 — Passport

Fields may include:

- Passport Number
- Country of Issue
- Nationality
- Issue Date
- Expiry Date
- Document Image
- Is Primary

The system should warn when an expiry date is in the past.

## FR-ID-004 — Multiple Documents

A guest may have multiple identity documents with one marked Primary.

---

# 15. Sensitive Data Masking

## FR-SEC-001

Sensitive fields shall support masking.

Examples:

```text
Passport:
AB*****89

NRC:
12/ABC(N)******

Phone:
09******123
```

Dedicated permissions may allow full display:

```text
GUEST.IDENTITY.VIEW_FULL
GUEST.CONTACT.VIEW_FULL
```

---

# 16. Guest Preferences

## FR-PREF-001

Operational preferences may include:

```text
Preferred Room Type
Preferred Bed Type
Smoking / Non-Smoking Preference
Preferred Floor
High Floor
Low Floor
Near Elevator
Away From Elevator
Quiet Room
Preferred Language
Pillow Preference
```

Preferences are requests, not guarantees.

---

# 17. VIP Management

## FR-VIP-001

Support configurable VIP levels:

```text
VIP 1
VIP 2
VIP 3
VVIP
```

Fields:

- VIP Level
- Effective From
- Effective To
- Reason / Note
- Approved By
- Status

## FR-VIP-002

VIP changes require permission and must be audited.

---

# 18. Guest Tags / Segmentation

## FR-TAG-001

Examples:

```text
Returning Guest
Business Traveler
Family Traveler
Long Stay
Direct Booking
Corporate
Frequent Guest
```

---

# 19. Guest Notes

## FR-NOTE-001

Fields:

- Note Type
- Note
- Property Scope
- Visibility
- Created By
- Created At
- Active / Resolved

Example types:

```text
General
Front Desk
Housekeeping
Billing
Service
Management
```

## FR-NOTE-002 — Note Visibility

Examples:

```text
Group-Wide
Property Only
Management Only
Department Only
```

---

# 20. Restricted / Do-Not-Rent Status

## FR-REST-001

Authorized users may create a restriction based on business policy and applicable law.

Fields:

- Restriction Type
- Reason
- Property / Group Scope
- Effective From
- Effective To
- Approved By
- Supporting Reference
- Status

## FR-REST-002 — Restriction Warning

Later Reservation / Front Desk flow shall show an appropriate warning, for example:

```text
Guest has an active property-level restriction.
Manager approval required.
```

Sensitive details must remain permission-controlled.

## FR-REST-003 — Restriction Scope

Possible scope:

```text
Specific Property
All Properties in Company
Entire Hotel Group
```

---

# 21. Communication Preferences

## FR-COMM-001

Examples:

```text
Booking Confirmation by Email
Booking Confirmation by SMS
Preferred Language
```

Transactional communication preferences shall remain separate from marketing consent.

---

# 22. Marketing Consent

## FR-CONSENT-001

Fields:

- Marketing Email Consent
- Marketing SMS Consent
- Marketing Messaging Consent
- Consent Date
- Consent Source
- Withdrawn Date
- Status

Consent withdrawal shall be supported.

---

# 23. Guest Relationships / Accompanying Guests

## FR-REL-001

Optional relationship types:

```text
Spouse
Parent
Child
Travel Companion
Assistant
Other
```

Relationships should only record what was explicitly provided.

---

# 24. Stay History

## FR-HIST-001

Guest profile shall display stay history created by Reservation / Front Desk modules.

Example:

| Property | Arrival | Departure | Room Type | Status |
|---|---|---|---|---|
| Yangon Hotel | 01-Oct | 03-Oct | Deluxe King | Checked Out |
| Mandalay Hotel | 10-Aug | 12-Aug | Standard | Checked Out |

## FR-HIST-002 — Stay Summary

May show:

```text
Total Stays
Total Nights
Last Stay
First Stay
Properties Visited
Cancellation Count
No-Show Count
```

Financial spend must require appropriate permissions.

---

# 25. Guest Documents / Attachments

## FR-DOC-001

Examples:

```text
Passport Image
NRC Image
Signed Registration Form
Other Operational Document
```

Fields:

- Document Type
- File
- Expiry Date if applicable
- Property Scope
- Uploaded By
- Uploaded At

## FR-DOC-002 — Document Security

Documents shall:

- Require authentication
- Be authorization controlled
- Avoid public URLs
- Be encrypted at rest where supported
- Be auditable when required

---

# 26. Guest Search

## FR-SRCH-001

Search by:

- Full Name
- Phone
- Email
- NRC
- Passport
- Guest ID
- Company
- VIP Level
- Guest Type
- Status
- Tag

Search results shall mask sensitive identifiers unless permission allows full view.

## FR-SRCH-002 — Quick Guest Search

Example:

```text
Search:
Aung Min

Result:
Aung Min
09******123
Myanmar
Returning Guest
Last Stay: 03-Oct-2026
```

---

# 27. Duplicate Detection

## FR-DUP-001

Potential match fields:

- Phone
- Email
- Passport Number
- NRC / National ID
- Name + Date of Birth
- Name + Phone

Example warning:

```text
Possible existing guest found:

Aung Min
Phone: 09******123

[Use Existing Guest]
[Review]
[Create New Anyway]
```

## FR-DUP-002 — Duplicate Scoring

P1 may support:

```text
Exact Passport Match → Very High
Exact Phone Match → High
Name + DOB Match → Medium
Name Only → Low
```

Weak matches must not be auto-merged.

---

# 28. Guest Profile Merge

## FR-MERGE-001

Users with permission may merge confirmed duplicate profiles.

Permission:

```text
GUEST.PROFILE.MERGE
```

Before merge, show:

- Source Profile
- Target Profile
- Conflicting Fields
- Identities
- Contacts
- Notes
- Preferences
- Stay References

## FR-MERGE-002 — Merge Rules

After merge:

- Future references point to master guest.
- Historical transaction integrity is preserved.
- Original IDs remain traceable.
- Merge action is fully audited.

---

# 29. Guest Unique Identifier

## FR-GST-006

Each guest shall receive an immutable internal ID / Guest Number.

Example:

```text
GST-2026-000001
```

Phone/email/document number must not be the database primary key.

---

# 30. Multi-Property Guest Recognition

## FR-MULTI-001

A guest created at one property may be recognized by other authorized properties within the same tenant.

## FR-MULTI-002 — Property-Specific Information

Tenant-wide examples:

```text
Name
Phone
Email
Identity Documents
Preferred Language
```

Property-specific examples:

```text
Room Preference
Internal Notes
Restriction
Local VIP Treatment
```

---

# 31. Audit Logging

## FR-AUD-001

Audit:

```text
Guest Created
Guest Updated
Identity Added
Identity Updated
VIP Changed
Restriction Added
Restriction Removed
Guest Merged
Marketing Consent Updated
Sensitive Data Viewed where required
```

Audit data:

- Tenant
- Property / Branch if relevant
- Guest ID
- Action
- Old Value
- New Value
- Performed By
- Date / Time
- Source Module

Sensitive raw document values should not be written to logs.

---

# 32. Permissions

Recommended permission codes:

```text
GUEST.PROFILE.VIEW
GUEST.PROFILE.CREATE
GUEST.PROFILE.UPDATE
GUEST.PROFILE.DEACTIVATE
GUEST.PROFILE.MERGE

GUEST.CONTACT.VIEW
GUEST.CONTACT.VIEW_FULL
GUEST.CONTACT.UPDATE

GUEST.IDENTITY.VIEW
GUEST.IDENTITY.VIEW_FULL
GUEST.IDENTITY.CREATE
GUEST.IDENTITY.UPDATE

GUEST.PREFERENCE.VIEW
GUEST.PREFERENCE.UPDATE

GUEST.NOTE.VIEW
GUEST.NOTE.CREATE
GUEST.NOTE.UPDATE

GUEST.VIP.VIEW
GUEST.VIP.MANAGE

GUEST.RESTRICTION.VIEW
GUEST.RESTRICTION.MANAGE

GUEST.DOCUMENT.VIEW
GUEST.DOCUMENT.UPLOAD

GUEST.REPORT.VIEW
GUEST.REPORT.EXPORT
```

---

# 33. Organizational Scope Security

## FR-SEC-002

Guest master data may be tenant-wide, but operational notes, restrictions, and history shall respect the user's organizational access.

---

# 34. Business Rules

## BR-001
Every guest belongs to one tenant.

## BR-002
Every guest has a unique internal Guest ID.

## BR-003
Duplicate identity document numbers trigger duplicate review.

## BR-004
Reservation / Front Desk flows should search existing guests before creating new profiles.

## BR-005
Historical transactions remain intact when guest details change.

## BR-006
Sensitive identity fields require dedicated permissions.

## BR-007
Guest restrictions require reason, scope, and authorized user.

## BR-008
Marketing consent is separate from transactional communication.

## BR-009
Guest merge requires explicit permission.

## BR-010
Profiles referenced by historical transactions should be archived/anonymized rather than physically deleted.

## BR-011
Property-specific notes do not automatically become group-wide.

## BR-012
Guest preferences are not guarantees.

## BR-013
Identity-document attachments must not be publicly accessible.

---

# 35. Validation Rules

## VAL-001
Guest Name is required.

## VAL-002
Guest Status is required.

## VAL-003
Email format must be valid when provided.

## VAL-004
Phone should be normalized where possible.

## VAL-005
Identity expiry date cannot be before issue date.

## VAL-006
Date of birth cannot be in the future.

## VAL-007
Duplicate identity documents must be blocked or reviewed according to policy.

## VAL-008
Restriction end date cannot be before start date.

## VAL-009
VIP end date cannot be before start date.

## VAL-010
Consent withdrawal date cannot be before consent date.

---

# 36. Privacy & Data Minimization

## NFR-PRIV-001
Collect only guest data required for legitimate hotel operations.

## NFR-PRIV-002
Optional sensitive fields should not be mandatory unless legally or operationally necessary.

## NFR-PRIV-003
Sensitive fields shall be masked by default for users without elevated access.

---

# 37. Data Retention and Anonymization

## NFR-PRIV-004

Support configurable retention actions:

```text
Retain
Archive
Anonymize
Delete where legally permitted
```

## FR-PRIV-001 — Guest Anonymization

Example:

```text
Name:
ANONYMIZED GUEST

Phone:
Removed

Email:
Removed

Passport:
Removed / Masked

Historical Reservation:
Preserved
```

---

# 38. Main Screens

1. Guest List
2. Create Guest
3. Edit Guest
4. Guest Detail
5. Identity Documents
6. Contact & Address
7. Preferences
8. VIP / Tags
9. Internal Notes
10. Restrictions
11. Stay History
12. Documents
13. Duplicate Review
14. Merge Guest
15. Guest Audit History
16. Guest Reports

---

# 39. Guest Detail Screen

Suggested sections:

```text
Summary
Identity
Contact
Address
Preferences
VIP / Tags
Notes
Stay History
Restrictions
Documents
Audit
```

---

# 40. Recommended Menu Structure

```text
Hotel Operations
│
└── Guest Management
    ├── Guests
    ├── VIP Guests
    ├── Guest Tags
    ├── Restrictions
    ├── Duplicate Review
    └── Guest Reports
```

Configuration:

```text
Administration
└── Guest Configuration
    ├── Guest Types
    ├── VIP Levels
    ├── Document Types
    ├── Preference Types
    └── Tag Types
```

---

# 41. Suggested Database Model

## Guest

```text
Id
TenantId
GuestNumber

Title
FirstName
MiddleName
LastName
FullName
DisplayName

GuestType
DateOfBirth
Gender
NationalityCountryId
PreferredLanguage

VipLevelId
Status

CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

## GuestContact

```text
Id
GuestId
ContactType
CountryCode
Value
IsPrimary
IsVerified
IsActive
```

## GuestAddress

```text
Id
GuestId
AddressType
AddressLine1
AddressLine2
CityTownship
StateRegion
PostalCode
CountryId
IsPrimary
IsActive
```

## GuestIdentityDocument

```text
Id
GuestId

DocumentType
DocumentNumberEncrypted
DocumentNumberHash
MaskedDocumentNumber

CountryOfIssueId
IssueDate
ExpiryDate

IsPrimary
IsActive

DocumentFileId
```

## GuestPreference

```text
Id
GuestId
PreferenceType
PreferenceValue
PropertyId nullable
Priority
Notes
IsActive
```

## GuestVip

```text
Id
GuestId
VipLevelId
PropertyId nullable
EffectiveFrom
EffectiveTo
Reason
ApprovedBy
IsActive
```

## GuestTag

```text
Id
GuestId
TagId
PropertyId nullable
CreatedAt
CreatedBy
```

## GuestNote

```text
Id
GuestId
PropertyId nullable
BranchId nullable
DepartmentId nullable
NoteType
NoteText
VisibilityScope
IsResolved
IsActive
CreatedAt
CreatedBy
```

## GuestRestriction

```text
Id
GuestId
RestrictionType
Reason
ScopeType
CompanyId nullable
PropertyId nullable
EffectiveFrom
EffectiveTo
ApprovedBy
Status
```

## GuestRelationship

```text
Id
GuestId
RelatedGuestId
RelationshipType
IsActive
```

## GuestConsent

```text
Id
GuestId
ConsentType
IsGranted
GrantedAt
WithdrawnAt
Source
```

## GuestMergeHistory

```text
Id
SourceGuestId
TargetGuestId
MergeReason
MergedAt
MergedBy
```

---

# 42. Recommended Relationships

```text
Guest
 ├── GuestContact
 ├── GuestAddress
 ├── GuestIdentityDocument
 ├── GuestPreference
 ├── GuestVip
 ├── GuestTag
 ├── GuestNote
 ├── GuestRestriction
 ├── GuestConsent
 └── GuestRelationship
```

Later:

```text
Guest
 ├── Reservation
 ├── Stay
 └── Folio
```

---

# 43. Recommended API Endpoints

## Guests

```text
GET    /api/v1/guests
POST   /api/v1/guests
GET    /api/v1/guests/{id}
PUT    /api/v1/guests/{id}
POST   /api/v1/guests/{id}/archive
```

## Search

```text
GET /api/v1/guests/search
```

## Identity

```text
GET  /api/v1/guests/{id}/identities
POST /api/v1/guests/{id}/identities
PUT  /api/v1/guests/{id}/identities/{identityId}
```

## Preferences

```text
GET  /api/v1/guests/{id}/preferences
POST /api/v1/guests/{id}/preferences
PUT  /api/v1/guests/{id}/preferences/{preferenceId}
```

## Notes

```text
GET  /api/v1/guests/{id}/notes
POST /api/v1/guests/{id}/notes
PUT  /api/v1/guests/{id}/notes/{noteId}
```

## Restrictions

```text
GET  /api/v1/guests/{id}/restrictions
POST /api/v1/guests/{id}/restrictions
POST /api/v1/guests/{id}/restrictions/{restrictionId}/close
```

## Merge

```text
POST /api/v1/guests/merge/preview
POST /api/v1/guests/merge
```

---

# 44. Duplicate Search Flow

```text
Enter Name / Phone / ID
        ↓
Normalize Search Values
        ↓
Search Guest Master
        ↓
Potential Match?
     ┌────┴────┐
     │         │
    Yes        No
     │         │
  Review      Create
 Existing     Guest
```

---

# 45. Reservation Integration

Future Reservation module shall:

1. Search existing guest.
2. Select GuestId.
3. Use guest profile/contact/preferences.
4. Save booking-specific guest data where needed.
5. Not overwrite guest master automatically from every booking.

---

# 46. Front Desk Integration

Front Desk uses Guest Management for:

- Guest search
- Identity verification
- Returning guest recognition
- VIP display
- Preference display
- Restriction warning
- Companion selection

---

# 47. Billing Integration

Billing / Folio may reference:

- GuestId
- Billing Name
- Company
- Billing Address
- Tax information if relevant

Historical billing values should be snapshotted where required.

---

# 48. CRM / Loyalty Integration

Later modules may use:

- Guest profile
- Stay history
- Tags
- Preferred language
- Communication consent
- VIP status
- Membership status

Marketing must respect consent settings.

---

# 49. Reports

Minimum reports:

1. Guest Master List
2. New Guests by Date
3. Returning Guests
4. VIP Guest List
5. Guests by Nationality
6. Guests by Property
7. Restricted Guest List
8. Duplicate Guest Candidates
9. Guest Stay Summary
10. Guest Profile Change History
11. Marketing Consent Report
12. Archived Guest Report

Sensitive-data exports require dedicated permissions.

---

# 50. Performance

## NFR-PERF-001
Guest search should normally return within approximately 1–2 seconds under expected load.

## NFR-PERF-002
Indexes should support:

```text
TenantId
GuestNumber
NormalizedName
NormalizedPhone
Email
IdentityHash
Status
```

---

# 51. Security

## NFR-SEC-001
All Guest Management APIs require authentication.

## NFR-SEC-002
Tenant isolation is enforced server-side.

## NFR-SEC-003
Sensitive fields are permission controlled.

## NFR-SEC-004
Identity values should be encrypted at rest where supported.

## NFR-SEC-005
Guest attachments shall not be publicly accessible.

---

# 52. Concurrency

## NFR-CON-001

Use optimistic concurrency / row version / UpdatedAt validation to prevent accidental overwrite when multiple users edit the same profile.

---

# 53. MVP Scope — P0

1. Guest CRUD
2. Guest Number
3. Name
4. Phone
5. Email
6. Address
7. Nationality
8. Basic NRC / Passport
9. Guest Type
10. Guest Status
11. Basic Preferences
12. VIP Flag / Level
13. Guest Search
14. Duplicate Warning
15. Internal Notes
16. Tenant / Property Scope
17. Permission-Based Sensitive Data
18. Audit Logging
19. Basic Guest Reports
20. Stay History Read View after Reservation exists

---

# 54. P1 Enhancements

1. Multiple Identity Documents
2. Document Images
3. Advanced Preferences
4. Guest Tags
5. Restricted / Do-Not-Rent Workflow
6. Guest Relationships
7. Marketing Consent
8. Duplicate Scoring
9. Guest Merge
10. Guest Documents
11. Property-Specific VIP
12. Property-Specific Notes
13. Guest Anonymization
14. Advanced Audit History

---

# 55. P2 Enterprise Enhancements

1. Loyalty Integration
2. CRM Segmentation
3. Guest 360 Dashboard
4. Central Group Guest Profile
5. External CRM Sync
6. Identity Scanner Integration
7. Passport Scanner Integration
8. E-Sign Registration Form
9. Government / Immigration Reporting Integration
10. Advanced Data Retention Policies
11. Guest Portal
12. Self Check-In Identity Workflow

---

# 56. Recommended Development Order

```text
1. Guest Master
      ↓
2. Contact Information
      ↓
3. Address
      ↓
4. Identity Document
      ↓
5. Search
      ↓
6. Duplicate Check
      ↓
7. Preferences
      ↓
8. VIP
      ↓
9. Notes
      ↓
10. Sensitive Data Permissions
      ↓
11. Audit Logging
      ↓
12. Reports
      ↓
13. P1 Restriction / Merge / Consent
```

---

# 57. Example Guest Setup

```text
Guest Number:
GST-2026-000125

Name:
U Aung Min

Phone:
09xxxxxxxxx

Email:
aungmin@example.com

Nationality:
Myanmar

Identity:
Myanmar NRC

Guest Type:
Individual

VIP:
No

Preferences:
Non-Smoking
High Floor
King Bed

Status:
Active
```

---

# 58. Example Returning Guest Flow

```text
Front Desk enters:
09xxxxxxxxx
        ↓
Guest Search
        ↓
Existing Guest Found
        ↓
U Aung Min
Last Stay: Golden Hotel Yangon
        ↓
Select Existing Guest
        ↓
New Reservation / Check-In uses same GuestId
```

---

# 59. Example Duplicate Flow

```text
New Guest Entry:
Aung Min
Passport: AB123456
        ↓
System finds:
Guest GST-000125
Passport: AB*****56
        ↓
Possible Duplicate
        ↓
Use Existing
or
Create New with Reason
```

---

# 60. Completion Criteria

Module 5 Guest Management is complete for MVP when:

- Guests can be created and updated.
- Each guest receives a unique Guest Number.
- Phone and email can be maintained.
- Basic identity documents can be stored securely.
- Guest search works.
- Duplicate warnings work.
- Guest preferences can be recorded.
- VIP status can be managed.
- Notes can be recorded.
- Sensitive data is permission controlled.
- Guest changes are audited.
- Guest data can later be referenced by Reservation / Front Desk.
- Existing guest profiles can be reused across multiple stays.

---

# 61. Final Functional Outcome

After Guest Management is completed, the system can answer:

```text
Who is this guest?
Have they stayed before?
How can we contact them?
What ID document do they use?
What preferences have they requested?
Are they VIP?
Are there operational restrictions?
Which properties have they visited?
Is this profile a duplicate?
```

---

# 62. Summary

Guest Management is responsible for:

```text
"Who is the guest?"
"How do we identify/contact them?"
"Is this a returning guest?"
"What preferences should staff know?"
"Is the profile VIP or restricted?"
"Do we already have this guest?"
```

It should not decide:

```text
Which room is available?
What rate should be charged?
Which dates are booked?
```

A clean separation is:

```text
Room Management
→ What rooms exist?

Rate Management
→ What do room types cost?

Guest Management
→ Who is staying?

Reservation
→ Which guest wants which room/rate and when?
```

---

# Implementation Review Note

This repository's executable P0 scope, API, screen, setup, database, privacy decisions, validation results and items awaiting Reservation/Front Desk integration are documented in [Module 5 Guest Management implementation](module-5-guest-management-implementation.md). Stay-history data, restrictions, consent, relationships, merge, guest attachments, CRM, loyalty and retention automation are not represented as operational capabilities until their dependencies and workflows are implemented.