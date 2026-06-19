# API Endpoints Reference

Base URL: `http://localhost:3000`

All API responses follow the standard wrapper format:

```json
// Success
{ "data": { ... }, "statusCode": 200, "timestamp": "2026-06-11T12:00:00.000Z" }

// Error
{ "statusCode": 400, "message": "Validation failed", "error": "BAD_REQUEST", "timestamp": "..." }
```

## Authentication

### Login

```
POST /users/login
```

Creates an authenticated session. Returns access token in response body and sets refresh token as an httpOnly cookie.

**Request Body:**
```json
{
  "usernameOrEmail": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "accessToken": "string",
    "user": { ... }
  }
}
```

### Refresh Token

```
POST /users/refresh
```

Refreshes the access token using the httpOnly refresh cookie.

**Cookies Required:** `refreshToken`

**Response:** `200 OK`
```json
{
  "data": {
    "accessToken": "string"
  }
}
```

### Logout

```
POST /users/logout
```

Clears the refresh token cookie.

**Response:** `200 OK`

## User Management

### Get Current User Profile

```
GET /users/me
```

**Auth:** JWT required

**Response:** `200 OK` — Full user profile including notification preferences, working hours, etc.

### Get All Users in a Business

```
GET /users/business/:businessId
```

**Auth:** JWT required  
**Roles:** Platform Owner, Business Owner, Admin

**Response:** `200 OK` — Array of users belonging to the business.

### Get Users by Role

```
GET /users/by-role?role=Standard
```

**Auth:** JWT required  
**Roles:** Platform Owner, Business Owner, Admin

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `role` | string | Role to filter by |

**Response:** `200 OK` — Array of users with the specified role.

### Get All Business Owners

```
GET /users/business-owners
```

**Auth:** JWT required  
**Roles:** Platform Owner

**Response:** `200 OK` — Array of all business owners.

### Update User Working Hours

```
PATCH /users/:userId/working-hours
```

**Auth:** JWT required  
**Roles:** Business Owner, Admin (same business); Enhanced, Standard (self only)

**Request Body:**
```json
{
  "userWorkingHours": {
    "monday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" },
    "tuesday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" },
    "...": "...",
    "sunday": { "enabled": false, "openTime": "09:00", "closeTime": "17:00" }
  }
}
```

**Response:** `200 OK` — Updated user profile.

## Invitations

### Invite a User

```
POST /users/invite
```

**Auth:** JWT required  
**Roles:** Platform Owner, Business Owner, Admin

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Standard",
  "businessId": "uuid"
}
```

**Response:** `201 Created`

### Request Invite OTP

```
POST /users/invite/request-otp
```

No auth required. Sends an OTP to the email associated with the invite token.

**Request Body:**
```json
{
  "inviteToken": "string"
}
```

**Response:** `200 OK`

### Accept Invite

```
POST /users/invite/accept
```

Completes the invitation by verifying OTP and setting password.

**Request Body:**
```json
{
  "inviteToken": "string",
  "otp": "string",
  "password": "string"
}
```

**Response:** `200 OK`

## Business Management

### Register a Business

```
POST /businesses/register
```

**Auth:** JWT required  
**Roles:** Platform Owner

**Request Body:**
```json
{
  "ownerId": "uuid",
  "name": "Joe's Barbershop",
  "slug": "joes-barbershop",
  "industry": "salon_and_beauty",
  "defaultTimeZone": "America/New_York"
}
```

**Response:** `201 Created` — Full business object.

### Get All Businesses

```
GET /businesses
```

**Auth:** JWT required  
**Roles:** Platform Owner

**Response:** `200 OK` — Array of all registered businesses.

### Get Business by ID

```
GET /businesses/:id
```

**Auth:** JWT required  
**Roles:** Platform Owner, Business Owner, Admin

**Response:** `200 OK` — Full business object with all settings.

## Business Settings

All settings endpoints follow the pattern:
- **Auth:** JWT required  
- **Roles:** Platform Owner, Business Owner, Admin  
- **Method:** `PATCH`
- **Response:** `200 OK` — Full updated business object

### Brand Details

```
PATCH /businesses/:id/brand-details
```

```json
{
  "name": "string",
  "slug": "string",
  "industry": "salon_and_beauty",
  "about": "string",
  "bannerImageUrl": "string",
  "logoUrl": "string"
}
```

### Appearance

```
PATCH /businesses/:id/appearance
```

```json
{
  "brandColor": "#111111",
  "brandButtonShape": "rounded",
  "theme": "system",
  "gallaryPhotosUrls": ["string"]
}
```

### Location

```
PATCH /businesses/:id/location
```

```json
{
  "address": "string",
  "city": "string",
  "state": "string",
  "zip": "string",
  "country": "string",
  "currency": "USD"
}
```

### General Settings

```
PATCH /businesses/:id/general
```

```json
{
  "language": "en"
}
```

### Booking Policies

```
PATCH /businesses/:id/booking-policies
```

```json
{
  "leadTime": { "unit": "days", "value": 0 },
  "scheduleWindow": { "unit": "days", "value": 10 },
  "cancellationPolicy": { "unit": "hours", "value": 24 },
  "bookingPolicyText": "string",
  "showPolicyOnBookingPage": false
}
```

### Booking Setup

```
PATCH /businesses/:id/booking-setup
```

```json
{
  "bookAppointmentSectionVisible": true,
  "bookClassSectionVisible": true,
  "aboutUsSectionVisible": true,
  "ourTeamSectionVisible": true,
  "servicesSectionVisible": true,
  "classesSectionVisible": true,
  "showFirstAvailable": false,
  "skipTeamSelection": false,
  "allowToBookMultipleServices": false,
  "bypassTeamMemberSelection": false,
  "customerLoginEnabled": false,
  "customerLoginRequired": false,
  "hidePikslotsBranding": false,
  "accordionView": true,
  "allowRescheduling": false,
  "allowCancellations": false,
  "showBookNewButton": false,
  "nameEnabled": true, "nameRequired": true,
  "emailEnabled": true, "emailRequired": false,
  "phoneEnabled": true, "phoneRequired": true,
  "addressEnabled": false, "addressRequired": false
}
```

### Booking Customization

```
PATCH /businesses/:id/booking-customization
```

```json
{
  "language": "en",
  "timeFormat": "12 hours",
  "weekStartsOn": "monday",
  "showBookAnotherAppointmentButton": true,
  "showServiceAndClassPrices": true,
  "showServiceAndClassDuration": true,
  "showBusinessHours": true,
  "showLocalTime": true,
  "labelService": "Service",
  "labelClass": "Class",
  "labelTeamMember": "Team member",
  "labelCity": "City",
  "labelState": "State",
  "labelPostalCode": "Postal code",
  "termsLabel": "string",
  "termsLink": "string",
  "requireTermsAcceptance": false,
  "redirectLabel": "string",
  "redirectLink": "string"
}
```

### Booking Page Visibility

```
PATCH /businesses/:id/visibility
```

```json
{
  "appearInSearchResults": true
}
```

### Business Hours

```
PATCH /businesses/:id/business-hours
```

```json
{
  "businessHours": {
    "monday": { "enabled": true, "openTime": "09:00", "closeTime": "17:00" },
    "...": "..."
  }
}
```

### Social Links

```
PATCH /businesses/:id/links
```

```json
{
  "businessLinks": {
    "Website": "https://...",
    "Facebook": "https://...",
    "Instagram": "https://...",
    "X": "https://...",
    "LinkedIn": "https://...",
    "Youtube": "https://...",
    "Tiktok": "https://..."
  }
}
```

### Contact Details

```
PATCH /businesses/:id/contact-details
```

```json
{
  "contactDetails": {
    "primaryEmail": "string",
    "primaryPhone": { "countryCode": "+1", "number": "string" },
    "additionalEmails": ["string"],
    "additionalPhones": [{ "countryCode": "+1", "number": "string" }]
  }
}
```

### Team Notifications

```
PATCH /businesses/:id/team-notifications
```

```json
{
  "notifyBookingConfirmation": true,
  "notifyBookingChanges": true,
  "notifyBookingCancellations": true,
  "bookingRemindersTime": { "active": true, "type": "email", "unit": "hours", "value": 24 },
  "extraCCEmails": ["string"]
}
```

### Customer Notifications

```
PATCH /businesses/:id/customer-notifications
```

```json
{
  "notifyBookingConfirmation": true,
  "notifyBookingChanges": true,
  "notifyBookingCancellations": true,
  "bookingRemindersTime": { "active": true, "type": "email", "unit": "hours", "value": 24 }
}
```

### Notification Customization

```
PATCH /businesses/:id/notification-customization
```

```json
{
  "emailSenderName": "string",
  "emailSignature": "string"
}
```

## Error Codes

| HTTP Status | Domain Error | Description |
|---|---|---|
| 400 | `ValidationError` | Invalid input data |
| 401 | — | Missing or expired JWT |
| 403 | `UnauthorizedError` | Insufficient role permissions |
| 404 | `NotFoundError` | Resource not found |
| 409 | `ConflictError` | Duplicate unique field |
| 500 | `InfrastructureError` | Internal server error |

## Shared Endpoint Constants

Endpoint paths are defined as constants in `packages/shared/src/api/`:

```typescript
// USER_ENDPOINTS
LOGIN:              '/users/login'
REFRESH:            '/users/refresh'
LOGOUT:             '/users/logout'
GET_PROFILE:        '/users/me'
INVITE:             '/users/invite'
REQUEST_INVITE_OTP: '/users/invite/request-otp'
ACCEPT_INVITE:      '/users/invite/accept'
GET_BUSINESS_OWNERS:'/users/business-owners'
GET_BY_ROLE:        '/users/by-role'
GET_BY_BUSINESS:    '/users/business/:businessId'
UPDATE_WORKING_HOURS:'/users/:userId/working-hours'

// BUSINESS_ENDPOINTS
REGISTER:                  '/businesses/register'
GET_ALL:                   '/businesses'
GET_BY_ID:                 '/businesses/:id'
UPDATE_BRAND_DETAILS:      '/businesses/:id/brand-details'
UPDATE_APPEARANCE:         '/businesses/:id/appearance'
UPDATE_LOCATION:           '/businesses/:id/location'
UPDATE_GENERAL:            '/businesses/:id/general'
UPDATE_BOOKING_POLICIES:   '/businesses/:id/booking-policies'
UPDATE_BOOKING_SETUP:      '/businesses/:id/booking-setup'
UPDATE_BOOKING_CUSTOMIZATION:'/businesses/:id/booking-customization'
UPDATE_VISIBILITY:         '/businesses/:id/visibility'
UPDATE_LINKS:              '/businesses/:id/links'
UPDATE_CONTACT_DETAILS:    '/businesses/:id/contact-details'
UPDATE_BUSINESS_HOURS:     '/businesses/:id/business-hours'
UPDATE_TEAM_NOTIFICATIONS: '/businesses/:id/team-notifications'
UPDATE_CUSTOMER_NOTIFICATIONS:'/businesses/:id/customer-notifications'
UPDATE_NOTIFICATION_CUSTOMIZATION:'/businesses/:id/notification-customization'
```
