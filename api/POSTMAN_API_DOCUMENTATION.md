# 🚀 Event LWS REST API Documentation & Postman Guide

Welcome to the **Event LWS REST API Documentation**. This guide is prepared specifically for **Frontend Developers** to quickly understand the backend architecture, authenticate requests, test endpoints using Postman, and integrate every feature seamlessly into the frontend client.

---

## 📌 Table of Contents
1. [⚡ Quick Start & Postman Setup](#-quick-start--postman-setup)
2. [🌐 Base URL & Server Environment](#-base-url--server-environment)
3. [🔑 Pre-Configured Test Accounts](#-pre-configured-test-accounts)
4. [🛡️ Authentication & JWT Flow](#️-authentication--jwt-flow)
5. [👥 Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
6. [💳 Stripe Card Mock Payment Guide](#-stripe-card-mock-payment-guide)
7. [📤 File Uploads (Multipart Form-Data)](#-file-uploads-multipart-form-data)
8. [📚 Detailed Endpoint Reference](#-detailed-endpoint-reference)
   - [1. Authentication & Profile](#1-authentication--profile)
   - [2. Events Management](#2-events-management)
   - [3. Seat Booking & Registrations](#3-seat-booking--registrations)
   - [4. Bookmarks (Saved Events)](#4-bookmarks-saved-events)
   - [5. Comments & Reviews](#5-comments--reviews)
   - [6. Keynote Speakers](#6-keynote-speakers)
   - [7. File Upload Endpoints](#7-file-upload-endpoints)
   - [8. Organizer Dashboard](#8-organizer-dashboard)
   - [9. System Health](#9-system-health)
9. [💻 Frontend Integration Tips & Code Snippets](#-frontend-integration-tips--code-snippets)

---

## ⚡ Quick Start & Postman Setup

A ready-to-import Postman collection file is included directly in this folder:
👉 `api/Event_LWS_API.postman_collection.json`

### How to use with Postman:
1. Open **Postman**.
2. Click the **Import** button in the top-left corner.
3. Select or drag-and-drop `api/Event_LWS_API.postman_collection.json`.
4. The collection **`Event LWS REST API`** will appear in your workspace.
5. **Automatic Token Saving**:
   - Run the request `01. Authentication & Profile -> Login (Attendee)` or `Login (Organizer)`.
   - The built-in Postman test script **automatically saves** the returned `accessToken` and `refreshToken` into the collection variable `{{token}}`!
   - You **do not** need to copy-paste tokens manually between requests.

---

## 🌐 Base URL & Server Environment

| Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Local Development** | `http://localhost:5001` | Default port configured in `api/.env` (`PORT=5001`) |
| **Fallback Local** | `http://localhost:5000` | Fallback if `.env` is omitted |

### Collection Variables in Postman:
- `baseUrl`: `http://localhost:5001`
- `token`: Bearer access token (automatically filled on login)
- `refreshToken`: Refresh token (automatically filled on login)
- `eventId`: Target event ID (default: `1`)

---

## 🔑 Pre-Configured Test Accounts

The SQLite database (`eventlws.db`) comes pre-seeded with realistic data and ready-to-use accounts.

> **Master Password for all test accounts:** `password123`

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Attendee** | `attendee@eventlws.com` | `password123` | Browsing, seat booking with card payment, viewing tickets, bookmarking, posting comments, profile edit |
| **Organizer** | `organizer@eventlws.com` | `password123` | Creating events with speakers, editing events, toggling draft/published status, deleting events, attendee roster, analytics dashboard |
| **Organizer (AI)** | `ai_collective@eventlws.com` | `password123` | AI summit masterclasses, organizer public profile page |

---

## 🛡️ Authentication & JWT Flow

### 1. Token Architecture
- **`accessToken`**: Valid for **1 Hour**. Used in HTTP headers for protected routes:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **`refreshToken`**: Valid for **7 Days**. Stored securely on the client (e.g. `localStorage` or `sessionStorage`), used to obtain a new access token without requiring re-login.

### 2. Token Refresh Flow
When an API request returns `401 Unauthorized` or `403 Forbidden` due to an expired access token:
1. Send `POST /api/auth/refresh-token` with `{ refreshToken: "..." }`.
2. The server responds with `{ accessToken: "new_token_here" }`.
3. Update your stored `accessToken` and retry the original failed request.

---

## 👥 Role-Based Access Control (RBAC)

The API strictly validates user roles via JWT claims:

| Feature / Resource | Guest (Unauthenticated) | Attendee | Organizer |
| :--- | :---: | :---: | :---: |
| Browse & Search Events | ✅ | ✅ | ✅ |
| View Single Event Details | ✅ | ✅ | ✅ |
| View Keynote Speakers | ✅ | ✅ | ✅ |
| View Public Organizer Profile | ✅ | ✅ | ✅ |
| Bookmark Events | ❌ | ✅ | ✅ |
| Post & Delete Own Comments | ❌ | ✅ | ✅ |
| Book Seat / Card Payment | ❌ | ✅ | ❌ |
| View My Booked Tickets | ❌ | ✅ | ❌ |
| Create New Event | ❌ | ❌ | ✅ |
| Edit / Delete Own Events | ❌ | ❌ | ✅ |
| Toggle Draft / Published Status | ❌ | ❌ | ✅ |
| View Registered Attendees Roster | ❌ | ❌ | ✅ |
| Organizer Analytics Dashboard | ❌ | ❌ | ✅ |

---

## 💳 Stripe Card Mock Payment Guide

Event LWS includes a realistic **Stripe-like Card Payment** flow. When an attendee books a seat via `POST /api/events/:id/register`, the card inputs are validated on the backend:

### Validation Rules:
- **Card Number (`card_number`)**: 12 to 19 numeric digits (spaces and dashes are automatically stripped).
- **Expiry Date (`exp_date`)**: Format `MM/YY` (Month between `01` and `12`).
- **CVC (`cvc`)**: 3 or 4 numeric digits.
- **Postal Code (`billing_postal_code`)**: String (e.g., `"1209"` or `"94103"`).
- **Capacity Guard**: If `booked_seats >= total_seats`, the server returns `400 Bad Request` (`"Sorry, this event is already fully booked."`).
- **Duplicate Guard**: If the user is already registered for this event, the server returns `400 Bad Request` (`"You are already registered for this event."`).

### Test Card Numbers:
| Card Brand | Test Card Number | Expiry | CVC | Postal Code |
| :--- | :--- | :---: | :---: | :---: |
| **Visa** | `4242 4242 4242 4242` | `12/28` | `123` | `94103` |
| **Mastercard** | `5555 5555 5555 4444` | `08/29` | `456` | `10001` |
| **Amex** | `3782 822463 10005` | `11/27` | `8901` | `90210` |
| **Discover** | `6011 0009 9013 9424` | `05/26` | `321` | `60601` |

### Stored Payment Record:
The server never stores full raw card numbers or CVC codes. Only safe metadata is persisted:
`card_last4`, `card_brand`, `card_holder_name`, `billing_postal_code`, `amount_paid`, `payment_status: "paid"`.

---

## 📤 File Uploads (Multipart Form-Data)

The server utilizes **Multer** to handle image uploads and automatically creates organized directories under `public/uploads/`.

### Upload Specifications:
- **Encoding**: `multipart/form-data`
- **Max File Size**: **10 MB**
- **Supported Formats**: JPEG, JPG, PNG, WEBP, GIF, SVG
- **Field Name Flexibility**: The upload middleware accepts any field name (`avatar`, `photo`, `banner`, `image`, `file`).

### Endpoints:
1. `POST /api/upload/profile`: Saves to `public/uploads/profiles/`. If `userId` is passed in body, it immediately updates `avatar` in `users` table.
2. `POST /api/upload/event`: Saves to `public/uploads/events/`. If `eventId` is passed, updates `banner_url` in `events` table.
3. `POST /api/upload/speaker`: Saves to `public/uploads/speakers/`. If `speakerId` is passed, updates `photo_url` in `speakers` table.
4. `POST /api/upload/:category`: Dynamic category (`profile`, `speaker`, `event`).

### Frontend Form-Data Example (JavaScript):
```javascript
const formData = new FormData();
formData.append("avatar", fileInput.files[0]);
formData.append("userId", currentUserId);

const response = await fetch("http://localhost:5001/api/upload/profile", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}` // Content-Type is set automatically by fetch for FormData!
  },
  body: formData
});
const data = await response.json();
console.log("Uploaded URL:", data.url); // e.g. "/uploads/profiles/avatar-1729600000.webp"
```

---

## 📚 Detailed Endpoint Reference

---

### 1. Authentication & Profile

#### 1.1 Register Attendee
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Auth**: Public
- **Headers**: `Content-Type: application/json`

**Request Body**:
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `name` | string | Yes | Full name of attendee |
| `email` | string | Yes | Unique valid email address |
| `password` | string | Yes | Plain text password |

**Sample Request**:
```json
{
  "name": "Jane Developer",
  "email": "jane.dev@example.com",
  "password": "password123"
}
```

**Response `201 Created`**:
```json
{
  "message": "Registration successful",
  "user": {
    "id": 4,
    "name": "Jane Developer",
    "email": "jane.dev@example.com",
    "role": "attendee",
    "avatar": "",
    "bio": "",
    "website": ""
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Common Errors**:
- `400 Bad Request`: `{ "message": "Name, email, and password are required." }`
- `409 Conflict`: `{ "message": "User with this email already exists." }`

---

#### 1.2 Register Organizer
- **Method**: `POST`
- **URL**: `/api/auth/register-organizer`
- **Auth**: Public
- **Headers**: `Content-Type: application/json`

**Request Body**:
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `name` | string | Yes | Organization or organizer name |
| `email` | string | Yes | Unique work email |
| `password` | string | Yes | Plain text password |
| `website` | string | No | Official website URL |

**Sample Request**:
```json
{
  "name": "Cloud Native Collective",
  "email": "team@cloudnative.io",
  "password": "password123",
  "website": "https://cloudnative.io"
}
```

**Response `201 Created`**:
```json
{
  "message": "Organizer account created successfully",
  "user": {
    "id": 5,
    "name": "Cloud Native Collective",
    "email": "team@cloudnative.io",
    "role": "organizer",
    "avatar": "",
    "bio": "",
    "website": "https://cloudnative.io"
  },
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "refreshToken": "eyJhbGciOiJIUzI1Ni..."
}
```

---

#### 1.3 Login
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Auth**: Public
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "email": "attendee@eventlws.com",
  "password": "password123"
}
```

**Response `200 OK`**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Alex Rivera",
    "email": "attendee@eventlws.com",
    "role": "attendee",
    "avatar": "/uploads/profiles/alex-avatar.webp",
    "bio": "Senior Cloud Architect & Open Source contributor.",
    "website": "https://alexrivera.dev"
  },
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "refreshToken": "eyJhbGciOiJIUzI1Ni..."
}
```

**Common Errors**:
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: `{ "message": "Invalid email or password." }`

---

#### 1.4 Refresh Access Token
- **Method**: `POST`
- **URL**: `/api/auth/refresh-token`
- **Auth**: Public
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200 OK`**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Common Errors**:
- `401 Unauthorized`: `{ "message": "Refresh token required." }`
- `403 Forbidden`: `{ "message": "Invalid or expired refresh token." }`

---

#### 1.5 Get Current User (Me)
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Auth**: Bearer Token required
- **Headers**: `Authorization: Bearer <accessToken>`

**Response `200 OK`**:
```json
{
  "id": 1,
  "name": "Alex Rivera",
  "email": "attendee@eventlws.com",
  "role": "attendee",
  "avatar": "/uploads/profiles/alex-avatar.webp",
  "bio": "Senior Cloud Architect & Open Source contributor.",
  "website": "https://alexrivera.dev",
  "created_at": "2026-10-20 12:00:00"
}
```

---

#### 1.6 Update User Profile
- **Method**: `PATCH`
- **URL**: `/api/auth/profile`
- **Auth**: Bearer Token required
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**Request Body**:
```json
{
  "name": "Alex Rivera",
  "bio": "Senior Cloud Architect & Open Source contributor passionate about AI systems.",
  "website": "https://alexrivera.dev",
  "avatar": "/uploads/profiles/alex-new-avatar.webp"
}
```

**Response `200 OK`**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "Alex Rivera",
    "email": "attendee@eventlws.com",
    "role": "attendee",
    "avatar": "/uploads/profiles/alex-new-avatar.webp",
    "bio": "Senior Cloud Architect & Open Source contributor passionate about AI systems.",
    "website": "https://alexrivera.dev"
  }
}
```

---

#### 1.7 Change Password
- **Method**: `PATCH`
- **URL**: `/api/auth/change-password`
- **Auth**: Bearer Token required

**Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newSecretPassword2026"
}
```

**Response `200 OK`**:
```json
{
  "message": "Password updated successfully."
}
```

**Common Errors**:
- `400 Bad Request`: `{ "message": "Current password does not match." }`

---

#### 1.8 Get Public Organizer Profile
- **Method**: `GET`
- **URL**: `/api/organizers/:id` (or `/api/users/:id`)
- **Auth**: Public

**Response `200 OK`**:
```json
{
  "id": 2,
  "name": "Tech Hub Collective",
  "email": "organizer@eventlws.com",
  "role": "organizer",
  "avatar": "/uploads/profiles/techhub.webp",
  "bio": "Premier technology meetup community and workshop hosts in Europe.",
  "website": "https://techhub.io",
  "created_at": "2026-09-01 10:00:00",
  "events": [
    {
      "id": 1,
      "title": "Global AI & Autonomous Agents Summit 2026",
      "category": "AI & Machine Learning",
      "date_time": "2026-11-15T09:00:00.000Z",
      "venue": "Convention Center, Hall A & Virtual",
      "total_seats": 100,
      "booked_seats": 87,
      "capacity_percentage": 87,
      "price": 49.00,
      "banner_url": "/uploads/events/ai-banner.webp",
      "status": "published"
    }
  ]
}
```

---

### 2. Events Management

#### 2.1 List All Events
- **Method**: `GET`
- **URL**: `/api/events`
- **Auth**: Optional (If `Authorization: Bearer <token>` is sent, returns `is_bookmarked: true/false` for each event)

**Query Parameters**:
| Parameter | Type | Default | Options / Description |
| :--- | :--- | :--- | :--- |
| `page` | integer | `1` | Page number. If provided, response includes pagination metadata. |
| `limit` | integer | `6` | Events per page (e.g., 6, 9, 12). |
| `search` | string | `""` | Search keyword matched against `title`, `description`, or `venue`. |
| `category` | string | `"all"` | Filter by category name (e.g. `AI & Machine Learning`, `Cloud & DevOps`). |
| `venue` | string | `"all"` | Filter by venue text. |
| `sort` | string | `date_time ASC` | `popular` (by seats booked DESC), `latest` (by created_at DESC). |
| `status` | string | `"published"` | `published` or `draft`. |

**Sample Response `200 OK` (With `?page=1&limit=6`)**:
```json
{
  "events": [
    {
      "id": 1,
      "title": "Global AI & Autonomous Agents Summit 2026",
      "description": "Deep-dive into multi-agent systems, local LLM evaluation, and real-time inference.",
      "category": "AI & Machine Learning",
      "date_time": "2026-11-15T09:00:00.000Z",
      "venue": "Convention Center, Hall A & Virtual",
      "total_seats": 100,
      "price": 49.00,
      "banner_url": "/uploads/events/ai-banner.webp",
      "status": "published",
      "organizer_id": 2,
      "organizer_name": "Tech Hub Collective",
      "organizer_avatar": "/uploads/profiles/techhub.webp",
      "seats_booked": 87,
      "booked_seats": 87,
      "capacity_percentage": 87,
      "is_bookmarked": true,
      "organizer": {
        "id": 2,
        "name": "Tech Hub Collective",
        "avatar": "/uploads/profiles/techhub.webp"
      }
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 6,
    "totalPages": 2,
    "hasPrev": false,
    "hasNext": true
  }
}
```

---

#### 2.2 Get Single Event Details
- **Method**: `GET`
- **URL**: `/api/events/:id`
- **Auth**: Optional (Provides user's `is_registered`, `registration` payment info, and `is_bookmarked` if token is provided)

**Sample Response `200 OK`**:
```json
{
  "id": 1,
  "title": "Global AI & Autonomous Agents Summit 2026",
  "description": "Comprehensive keynote lectures and hands-on coding labs exploring agentic workflows...",
  "category": "AI & Machine Learning",
  "date_time": "2026-11-15T09:00:00.000Z",
  "venue": "Convention Center, Hall A & Virtual",
  "total_seats": 100,
  "price": 49.00,
  "banner_url": "/uploads/events/ai-banner.webp",
  "status": "published",
  "organizer_id": 2,
  "seats_booked": 87,
  "booked_seats": 87,
  "capacity_percentage": 87,
  "is_registered": true,
  "is_bookmarked": true,
  "registration": {
    "id": 14,
    "notes": "Looking forward to agentic coding!",
    "card_holder_name": "Alex Rivera",
    "card_last4": "4242",
    "card_brand": "visa",
    "billing_postal_code": "94103",
    "payment_status": "paid",
    "amount_paid": 49.00,
    "payment_method": "card",
    "created_at": "2026-10-21 16:30:00"
  },
  "organizer": {
    "id": 2,
    "name": "Tech Hub Collective",
    "email": "organizer@eventlws.com",
    "avatar": "/uploads/profiles/techhub.webp",
    "bio": "Premier technology meetup community and workshop hosts in Europe.",
    "website": "https://techhub.io"
  },
  "speakers": [
    {
      "id": 1,
      "name": "Dr. Sarah Chen",
      "title": "Head of AI Research",
      "company": "Anthropic AI",
      "bio": "Pioneering safety alignment and neural architecture search.",
      "photo_url": "/uploads/speakers/sarah-chen.webp",
      "event_id": 1
    }
  ],
  "comments": [
    {
      "id": 3,
      "content": "Will session recordings be available for virtual attendees?",
      "created_at": "2026-10-22 08:30:00",
      "user_id": 1,
      "user_name": "Alex Rivera",
      "user_avatar": "/uploads/profiles/alex-avatar.webp"
    }
  ]
}
```

---

#### 2.3 Create Event [Organizer Only]
- **Method**: `POST`
- **URL**: `/api/events`
- **Auth**: Bearer Token required (`role: organizer`)
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**Request Body**:
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | string | Yes | Event title |
| `description` | string | Yes | Detailed description / agenda |
| `category` | string | Yes | e.g. `AI & Machine Learning`, `Cloud & DevOps`, `Frontend & Architecture` |
| `date_time` | string | Yes | ISO Date string (e.g. `2026-11-20T10:00:00.000Z`) |
| `venue` | string | Yes | Physical location and/or Virtual link |
| `total_seats` | integer | No | Total seating capacity (Default: `50`) |
| `price` | number | No | Ticket price in USD (Default: `49.00`) |
| `banner_url` | string | No | Image URL (e.g. from `/api/upload/event`) |
| `status` | string | No | `"published"` (default) or `"draft"` |
| `speakers` | array | No | Array of speaker objects `{ name, title, company, bio, photo_url }` |

**Sample Request**:
```json
{
  "title": "NextGen AI & Cloud Summit 2026",
  "description": "An intensive workshop exploring autonomous agent architectures, local LLM deployment, and modern multi-cloud pipelines.",
  "category": "AI & Machine Learning",
  "date_time": "2026-11-20T10:00:00.000Z",
  "venue": "San Francisco Innovation Center & Online",
  "total_seats": 120,
  "price": 79.00,
  "banner_url": "/uploads/events/ai-summit-banner.webp",
  "status": "published",
  "speakers": [
    {
      "name": "Dr. Elena Vance",
      "title": "Principal AI Scientist",
      "company": "DeepMind Labs",
      "bio": "Leading research in multimodal reasoning.",
      "photo_url": "/uploads/speakers/elena-vance.webp"
    }
  ]
}
```

**Response `201 Created`**:
```json
{
  "message": "Event created successfully",
  "eventId": 13,
  "event": {
    "id": 13,
    "title": "NextGen AI & Cloud Summit 2026",
    "description": "An intensive workshop...",
    "category": "AI & Machine Learning",
    "date_time": "2026-11-20T10:00:00.000Z",
    "venue": "San Francisco Innovation Center & Online",
    "total_seats": 120,
    "price": 79.00,
    "banner_url": "/uploads/events/ai-summit-banner.webp",
    "status": "published",
    "organizer_id": 2,
    "speakers": [ ... ]
  }
}
```

---

#### 2.4 Update Event [Organizer Only]
- **Method**: `PATCH`
- **URL**: `/api/events/:id`
- **Auth**: Bearer Token required (`role: organizer`, must be event creator)

**Request Body** (Any subset of fields):
```json
{
  "title": "NextGen AI & Cloud Summit 2026 (Updated)",
  "total_seats": 150,
  "price": 89.00,
  "venue": "Moscone West Hall 3 & Virtual Livestream"
}
```

**Response `200 OK`**:
```json
{
  "message": "Event updated successfully",
  "event": { ... }
}
```

---

#### 2.5 Toggle Event Status (Draft / Published) [Organizer Only]
- **Method**: `PATCH`
- **URL**: `/api/events/:id/status`
- **Auth**: Bearer Token required (`role: organizer`)

**Request Body**:
```json
{
  "status": "draft"
}
```

**Response `200 OK`**:
```json
{
  "message": "Status updated to draft"
}
```

---

#### 2.6 Delete Event [Organizer Only]
- **Method**: `DELETE`
- **URL**: `/api/events/:id`
- **Auth**: Bearer Token required (`role: organizer`, must be event creator)

**Response `200 OK`**:
```json
{
  "message": "Event deleted successfully."
}
```

---

### 3. Seat Booking & Registrations

#### 3.1 Book Seat with Stripe Card Payment
- **Method**: `POST`
- **URL**: `/api/events/:id/register`
- **Auth**: Bearer Token required (`role: attendee`)
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**Request Body**:
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `card_holder_name` | string | No | Name printed on the card (defaults to user's name) |
| `card_number` | string | Yes | 12-19 digits card number (e.g. `4242 4242 4242 4242`) |
| `exp_date` | string | Yes | Expiration date in `MM/YY` format (e.g. `12/28`) |
| `cvc` | string | Yes | 3 or 4 digits security code (e.g. `123`) |
| `billing_postal_code`| string | No | Postal/ZIP code (default: `1209`) |
| `amount_paid` | number | No | Event ticket price (e.g. `49.00`) |
| `notes` | string | No | Optional registration notes or dietary requirements |

**Sample Request**:
```json
{
  "card_holder_name": "Jane Developer",
  "card_number": "4242 4242 4242 4242",
  "exp_date": "12/28",
  "cvc": "123",
  "billing_postal_code": "94103",
  "amount_paid": 49.00,
  "notes": "Looking forward to hands-on agent demos!"
}
```

**Response `201 Created`**:
```json
{
  "message": "Payment processed and seat booking confirmed!",
  "registration": {
    "id": 18,
    "event_id": 1,
    "user_id": 1,
    "notes": "Looking forward to hands-on agent demos!",
    "card_holder_name": "Jane Developer",
    "card_last4": "4242",
    "card_brand": "visa",
    "billing_postal_code": "94103",
    "payment_status": "paid",
    "amount_paid": 49.00,
    "payment_method": "card",
    "created_at": "2026-10-22T11:45:00.000Z"
  }
}
```

**Common Errors**:
- `400 Bad Request`: `"Sorry, this event is already fully booked."`
- `400 Bad Request`: `"You are already registered for this event."`
- `400 Bad Request`: `"Invalid card number format. Please provide a valid 13-19 digit card number."`
- `400 Bad Request`: `"Invalid expiration date format. Use MM/YY."`
- `400 Bad Request`: `"Invalid CVC / CVV code. Must be 3 or 4 digits."`

---

#### 3.2 Cancel / Withdraw Seat Registration
- **Method**: `DELETE`
- **URL**: `/api/events/:id/register`
- **Auth**: Bearer Token required (`role: attendee`)

**Response `200 OK`**:
```json
{
  "message": "Registration withdrawn successfully."
}
```

---

#### 3.3 Get My Booked Events (Attendee Registrations)
- **Method**: `GET`
- **URL**: `/api/user/registrations`
- **Auth**: Bearer Token required (`role: attendee`)

**Response `200 OK`**:
```json
[
  {
    "registration_id": 14,
    "notes": "First seat booked!",
    "registered_at": "2026-10-21 16:30:00",
    "card_holder_name": "Alex Rivera",
    "card_last4": "4242",
    "card_brand": "visa",
    "billing_postal_code": "94103",
    "payment_status": "paid",
    "amount_paid": 49.00,
    "payment_method": "card",
    "event_id": 1,
    "title": "Global AI & Autonomous Agents Summit 2026",
    "category": "AI & Machine Learning",
    "date_time": "2026-11-15T09:00:00.000Z",
    "venue": "Convention Center, Hall A & Virtual",
    "banner_url": "/uploads/events/ai-banner.webp",
    "status": "published",
    "organizer_name": "Tech Hub Collective"
  }
]
```

---

#### 3.4 Get Event Attendees Roster [Organizer Only]
- **Method**: `GET`
- **URL**: `/api/events/:id/attendees`
- **Auth**: Bearer Token required (`role: organizer`, must be event creator)

**Response `200 OK`**:
```json
[
  {
    "registration_id": 14,
    "user_id": 1,
    "name": "Alex Rivera",
    "user_name": "Alex Rivera",
    "email": "attendee@eventlws.com",
    "avatar": "/uploads/profiles/alex-avatar.webp",
    "registered_at": "2026-10-21 16:30:00",
    "card_holder_name": "Alex Rivera",
    "card_last4": "4242",
    "card_brand": "visa",
    "billing_postal_code": "94103",
    "payment_status": "paid",
    "amount_paid": 49.00,
    "payment_method": "card",
    "notes": "Looking forward to agentic coding!"
  }
]
```

---

### 4. Bookmarks (Saved Events)

#### 4.1 Toggle Bookmark (Add / Remove)
- **Method**: `POST`
- **URL**: `/api/events/:id/bookmark`
- **Auth**: Bearer Token required

**Response `200 OK` (When Added)**:
```json
{
  "message": "Added to bookmarks",
  "is_bookmarked": true
}
```

**Response `200 OK` (When Removed)**:
```json
{
  "message": "Removed from bookmarks",
  "is_bookmarked": false
}
```

---

#### 4.2 Check Event Bookmark Status
- **Method**: `GET`
- **URL**: `/api/events/:id/bookmark`
- **Auth**: Bearer Token required

**Response `200 OK`**:
```json
{
  "event_id": 1,
  "is_bookmarked": true
}
```

---

#### 4.3 List All Saved Bookmarks
- **Method**: `GET`
- **URL**: `/api/user/bookmarks` (alias: `/api/bookmarks`)
- **Auth**: Bearer Token required

**Response `200 OK`**:
```json
[
  {
    "bookmark_id": 5,
    "bookmarked_at": "2026-10-22 10:15:00",
    "id": 1,
    "title": "Global AI & Autonomous Agents Summit 2026",
    "category": "AI & Machine Learning",
    "date_time": "2026-11-15T09:00:00.000Z",
    "venue": "Convention Center, Hall A & Virtual",
    "total_seats": 100,
    "seats_booked": 87,
    "banner_url": "/uploads/events/ai-banner.webp",
    "organizer_name": "Tech Hub Collective"
  }
]
```

---

### 5. Comments & Reviews

#### 5.1 Post a Comment
- **Method**: `POST`
- **URL**: `/api/events/:id/comments`
- **Auth**: Bearer Token required
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**Request Body**:
```json
{
  "content": "Incredible lineup of keynote speakers! Will workshop code repositories be open-sourced?"
}
```

**Response `201 Created`**:
```json
{
  "message": "Comment added",
  "comment": {
    "id": 7,
    "content": "Incredible lineup of keynote speakers! Will workshop code repositories be open-sourced?",
    "created_at": "2026-10-22 17:30:00",
    "user_id": 1,
    "user_name": "Alex Rivera",
    "user_avatar": "/uploads/profiles/alex-avatar.webp"
  }
}
```

---

#### 5.2 Delete Comment
- **Method**: `DELETE`
- **URL**: `/api/comments/:id`
- **Auth**: Bearer Token required (Only the comment author can delete)

**Response `200 OK`**:
```json
{
  "message": "Comment deleted successfully."
}
```

**Common Errors**:
- `403 Forbidden`: `{ "message": "You can only delete your own comments." }`

---

### 6. Keynote Speakers

#### 6.1 List Speakers
- **Method**: `GET`
- **URL**: `/api/speakers?event_id=1`
- **Auth**: Public

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 2,
  "speakers": [
    {
      "id": 1,
      "name": "Dr. Sarah Chen",
      "title": "Head of AI Research",
      "company": "Anthropic AI",
      "bio": "Pioneering safety alignment and neural architecture search.",
      "photo_url": "/uploads/speakers/sarah-chen.webp",
      "event_id": 1
    }
  ]
}
```

---

#### 6.2 Create Speaker
- **Method**: `POST`
- **URL**: `/api/speakers`
- **Auth**: Optional / Authenticated
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "name": "Dr. Aris Thorne",
  "title": "Principal AI Scientist",
  "company": "NeuralFlow Labs",
  "bio": "Pioneer in low-latency transformer inference.",
  "photo_url": "/uploads/speakers/aris-thorne.webp",
  "event_id": 1
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "message": "Speaker created successfully",
  "speaker": {
    "id": 10,
    "name": "Dr. Aris Thorne",
    "title": "Principal AI Scientist",
    "company": "NeuralFlow Labs",
    "bio": "Pioneer in low-latency transformer inference.",
    "photo_url": "/uploads/speakers/aris-thorne.webp",
    "event_id": 1
  }
}
```

---

### 7. File Upload Endpoints

All upload endpoints accept standard `multipart/form-data`.

#### 7.1 Profile Avatar Upload
- **Method**: `POST`
- **URL**: `/api/upload/profile`
- **Body (`form-data`)**:
  - `avatar`: `[Binary Image File]` (JPEG, PNG, WEBP, GIF, SVG <= 10MB)
  - `userId`: `1` (Optional: updates user avatar in DB)

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Profile picture uploaded to public/uploads/profiles/ and saved to database successfully",
  "url": "/uploads/profiles/avatar-1729600000.webp",
  "fullUrl": "http://localhost:5001/uploads/profiles/avatar-1729600000.webp",
  "filename": "avatar-1729600000.webp",
  "category": "profiles",
  "size": 184520,
  "user": {
    "id": 1,
    "name": "Alex Rivera",
    "avatar": "/uploads/profiles/avatar-1729600000.webp"
  }
}
```

---

#### 7.2 Event Banner Upload
- **Method**: `POST`
- **URL**: `/api/upload/event`
- **Body (`form-data`)**:
  - `banner`: `[Binary Image File]`
  - `eventId`: `1` (Optional: updates `banner_url` in `events` table)

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Event image uploaded to public/uploads/events/ and saved to database successfully",
  "url": "/uploads/events/banner-1729600000.webp",
  "fullUrl": "http://localhost:5001/uploads/events/banner-1729600000.webp",
  "filename": "banner-1729600000.webp",
  "category": "events",
  "size": 420100
}
```

---

### 8. Organizer Dashboard

#### 8.1 Get Dashboard Analytics & Hosted Events
- **Method**: `GET`
- **URL**: `/api/organizer/dashboard`
- **Auth**: Bearer Token required (`role: organizer`)

**Response `200 OK`**:
```json
{
  "stats": {
    "totalEvents": 4,
    "activeEvents": 3,
    "draftEvents": 1,
    "totalAttendees": 182
  },
  "events": [
    {
      "id": 1,
      "title": "Global AI & Autonomous Agents Summit 2026",
      "category": "AI & Machine Learning",
      "date_time": "2026-11-15T09:00:00.000Z",
      "venue": "Convention Center, Hall A & Virtual",
      "total_seats": 100,
      "price": 49.00,
      "status": "published",
      "seats_booked": 87
    }
  ]
}
```

---

### 9. System Health

#### 9.1 API Health Check
- **Method**: `GET`
- **URL**: `/api/health`
- **Auth**: Public

**Response `200 OK`**:
```json
{
  "status": "ok",
  "server": "Event LWS API",
  "timestamp": "2026-10-22T11:48:00.000Z"
}
```

---

## 💻 Frontend Integration Tips & Code Snippets

### 1. Axios Instance with Automatic JWT Refresh Loop
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" }
});

// Request interceptor: attach bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 & refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post("http://localhost:5001/api/auth/refresh-token", {
            refreshToken
          });
          localStorage.setItem("accessToken", res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.clear();
          window.location.href = "/login.html";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Header State Rendering Helper (Vanilla JS / React)
```javascript
export function getHeaderNavigation(user) {
  // Guest
  if (!user) {
    return [
      { label: "Home", href: "/" },
      { label: "Browse Events", href: "/#events" },
      { label: "Host An Event", href: "/register-organizer.html" },
      { label: "Search", action: "open_search_modal" },
      { label: "Sign In", href: "/login.html" },
      { label: "Join Free", href: "/register.html" }
    ];
  }

  // Attendee
  if (user.role === "attendee") {
    return [
      { label: "Home", href: "/" },
      { label: "Browse Events", href: "/#events" },
      { label: "My Bookings", href: "/event-details.html#bookings" },
      { label: "Saved Events", href: "/event-details.html#saved" },
      { label: "Search", action: "open_search_modal" },
      { label: "Profile", href: "/edit-profile.html" },
      { label: "Logout", action: "logout" }
    ];
  }

  // Organizer
  if (user.role === "organizer") {
    return [
      { label: "Home", href: "/" },
      { label: "Dashboard", href: "/organizer-dashboard.html" },
      { label: "Manage Events", href: "/manage-events.html" },
      { label: "+ Create Event", href: "/create-event.html" },
      { label: "Search", action: "open_search_modal" },
      { label: "Profile", href: "/edit-profile.html" },
      { label: "Logout", action: "logout" }
    ];
  }
}
```

---

## 🏁 Summary Checklist for Frontend Implementation
- [x] **Import Postman Collection**: Import `api/Event_LWS_API.postman_collection.json` into Postman.
- [x] **Set Dev Server**: Confirm backend is running at `http://localhost:5001` via `npm run dev`.
- [x] **Store JWT Tokens**: Store `accessToken`, `refreshToken`, and `user` in `localStorage` upon login or registration.
- [x] **Dynamic Header**: Render role-specific navigation for Guests, Attendees, and Organizers.
- [x] **Event Detail Page**: Display keynote speakers, registered seat count, capacity progress bar, interactive comment section, and Stripe card booking modal.
- [x] **Attendee Hub**: Display registered events with digital receipt badges (`card_brand`, `card_last4`, `amount_paid`), and list of bookmarked events.
- [x] **Organizer Hub**: Provide event creation form with dynamic speaker additions, status toggle (`draft` / `published`), attendee roster modal, and analytics metrics.
