# Event LWS Backend API (SQLite3 + Express)

Welcome to the backend server for **Event LWS** (Reactive Accelerator Batch 5 Assignment 5). This REST API is powered by **Express.js**, **SQLite3**, and **JSON Web Tokens (JWT)**.

> 📖 **Frontend Developer Guide & Postman Collection:**
> - **Full Postman & API Documentation:** [POSTMAN_API_DOCUMENTATION.md](./POSTMAN_API_DOCUMENTATION.md)
> - **Importable Postman Collection v2.1.0:** [Event_LWS_API.postman_collection.json](./Event_LWS_API.postman_collection.json) *(Includes auto-token saving scripts!)*

---

## 🚀 Quick Start Guide

### 1. Requirements

- Node.js (v18 or higher recommended)
- npm or pnpm / yarn

### 2. Installation

Open your terminal inside the `api` folder:

```bash
cd api
npm install
```

### 3. Start the Server

```bash
npm start
```

_Or for automatic restart during development:_

```bash
npm run dev
```

The server will start at:
👉 **`http://localhost:5000`**

_(Note: The SQLite3 database `eventlws.db` is already pre-generated with realistic events and user accounts. If you ever need to reset the database back to clean initial data, simply run `npm run seed`)_

---

## 🔑 Pre-Configured Test Accounts

All pre-seeded test accounts use the password: **`password123`**

| Role          | Name                           | Email                        | Password      | Description                                       |
| :------------ | :----------------------------- | :--------------------------- | :------------ | :------------------------------------------------ |
| **Attendee**  | Akash Ahmed                    | `attendee@eventlws.com`      | `password123` | Regular user with registered events & bookmarks   |
| **Organizer** | Reactive Accelerator Community | `organizer@eventlws.com`     | `password123` | Event organizer who can create & manage workshops |
| **Organizer** | AI Collective                  | `ai_collective@eventlws.com` | `password123` | Tech organizer hosting AI masterclasses           |

---

## 📡 Complete REST API Endpoints Reference

### 🔐 Authentication (`/api/auth`)

| Method  | Endpoint                       | Auth         | Description                                                                    |
| :------ | :----------------------------- | :----------- | :----------------------------------------------------------------------------- |
| `POST`  | `/api/auth/register`           | Public       | Register new Attendee (`name, email, password`)                                |
| `POST`  | `/api/auth/register-organizer` | Public       | Register new Organizer (`name, email, password, website`)                      |
| `POST`  | `/api/auth/login`              | Public       | Login with email & password. Returns `accessToken`, `refreshToken`, and `user` |
| `POST`  | `/api/auth/refresh-token`      | Public       | Renew expired access token using `{ refreshToken }`                            |
| `GET`   | `/api/auth/me`                 | Bearer Token | Get currently logged-in user profile                                           |
| `PATCH` | `/api/auth/profile`            | Bearer Token | Update personal profile (`name, avatar, bio, website`)                         |
| `PATCH` | `/api/auth/change-password`    | Bearer Token | Change password (`currentPassword, newPassword`)                               |

### 🎟️ Events (`/api/events`)

| Method   | Endpoint                 | Auth      | Description                                                                                            |
| :------- | :----------------------- | :-------- | :----------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/events`            | Optional  | Browse events. Supports `?search=...`, `?category=...`, `?sort=popular\|latest\|upcoming`              |
| `GET`    | `/api/events/:id`        | Optional  | Get single event details with organizer info, booked seats, comments, and registration status          |
| `POST`   | `/api/events`            | Organizer | Create a new event (`title, description, category, date_time, venue, total_seats, banner_url, status`) |
| `PATCH`  | `/api/events/:id`        | Organizer | Update event information (only creator organizer)                                                      |
| `PATCH`  | `/api/events/:id/status` | Organizer | Toggle status: `{ status: "draft" \| "published" }`                                                    |
| `DELETE` | `/api/events/:id`        | Organizer | Delete event (only creator organizer)                                                                  |

### 📝 Seat Booking & Stripe Payment (`/api/events/:id/register`)

| Method   | Endpoint                    | Auth      | Description                                                                                                                                                                                                                                                 |
| :------- | :-------------------------- | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/events/:id/register`  | Attendee  | Book a seat with Stripe card payment (`{ card_holder_name, card_number, exp_date, cvc, billing_postal_code, amount_paid?, notes? }`). Validates card parameters, extracts brand/last4, and stores safe payment receipt. Prevents booking if seats are full. |
| `DELETE` | `/api/events/:id/register`  | Attendee  | Cancel / Withdraw registration & release seat                                                                                                                                                                                                               |
| `GET`    | `/api/user/registrations`   | Attendee  | List all events registered by logged-in attendee, including card brand, last4, amount paid, and payment status                                                                                                                                              |
| `GET`    | `/api/events/:id/attendees` | Organizer | View all registered participants for an event with payment info (`card_holder_name`, `card_last4`, `card_brand`, `payment_status`, `amount_paid`, and `notes`)                                                                                              |

### 📌 Bookmarks / Saved Events (`/api/events/:id/bookmark`)

| Method | Endpoint                   | Auth      | Description                                    |
| :----- | :------------------------- | :-------- | :--------------------------------------------- |
| `POST` | `/api/events/:id/bookmark` | Logged In | Toggle bookmark for an event (adds or removes) |
| `GET`  | `/api/user/bookmarks`      | Logged In | List all events bookmarked by the user         |

### 💬 Comments & Reviews (`/api/events/:id/comments`)

| Method   | Endpoint                   | Auth      | Description                                       |
| :------- | :------------------------- | :-------- | :------------------------------------------------ |
| `POST`   | `/api/events/:id/comments` | Logged In | Post a comment/review on an event (`{ content }`) |
| `DELETE` | `/api/comments/:id`        | Logged In | Delete own comment (only author can delete)       |

### 📊 Organizer Dashboard (`/api/organizer/dashboard`)

| Method | Endpoint                   | Auth      | Description                                                                                        |
| :----- | :------------------------- | :-------- | :------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/organizer/dashboard` | Organizer | Returns stats (`totalEvents, totalAttendees, activeEvents, draftEvents`) and list of hosted events |

---

## 🛡️ Error Handling Conventions

- **`400 Bad Request`**: Missing required parameters or input validation error.
- **`401 Unauthorized`**: Authentication token is missing or invalid.
- **`403 Forbidden`**: User does not have the required role (e.g. general attendee trying to access organizer route).
- **`404 Not Found`**: Target resource (event, comment, user) not found.
- **`409 Conflict`**: Email is already registered.
