# BookShelf Backend Service

এই backend codebase-টি মূলত Assignment-এর backend হিসেবে ব্যবহার করা হবে। নিচে কীভাবে এই backend server চালু করবেন, data seed করবেন এবং API-গুলো ব্যবহার করবেন তার সহজ নির্দেশাবলি দেওয়া হলো।

> ⚠️ **বিশেষ সতর্কবার্তা (Strict Warning)**:
> frontend & backend codebase এবং port (`4020`) কোনোভাবেই পরিবর্তন বা modify করা যাবে না। Assignment evaluator সরাসরি `4020` port-এ পরীক্ষা করবেন। আপনি যদি backend code বা port পরিবর্তন করেন, তবে assignment সঠিকভাবে মূল্যায়ন করা সম্ভব হবে না এবং এতে আপনার নম্বর কাটা যেতে পারে।

---

## Quick Setup Guide

### 1. Install Dependencies
Project-এর backend folder-এ গিয়ে terminal-এ নিচের command-টি দিয়ে dependencies install করে নিন:

```bash
npm install
```

### 2. Environment Configuration
Project-এর root folder-এ থাকা `.env.example` file-টি copy করে `.env` নামে একটি file তৈরি করুন:

```bash
cp .env.example .env
```
সাধারণত কোনো change করার দরকার নেই, default ভাবে backend server-টি `4020` port-এ চলবে।

---

## Start Backend Server

Backend server-টি চালু করতে terminal-এ নিচের command-টি রান করুন:

```bash
npm run dev
```

Server চালু হলে `http://localhost:4020` URL-এ backend ready থাকবে।

---

## API Endpoints Guide

সবগুলো API-এর Base URL: `http://localhost:4020/api`

---

### 1. Books API

#### Get All Books (`GET /api/books`)
Catalog-এর সব বই পেতে এই endpoint-এ request পাঠাবেন।

**Query Parameters:**
- `search`: বইয়ের title, author বা description দিয়ে search করতে (যেমন: `?search=clean`)
- `genre`: নির্দিষ্ট genre বা category অনুযায়ী filter করতে (যেমন: `?genre=Tech`)
- `minRating`: নির্দিষ্ট minimum rating অনুযায়ী filter করতে (যেমন: `?minRating=4.5`)
- `sort`: sorting order — `newest`, `oldest`, অথবা `rating` (যেমন: `?sort=rating`)

**Example Request:**
`GET http://localhost:4020/api/books?search=Clean&genre=Tech&sort=rating`

**Response Example (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Sumit Saha",
      "genre": "Tech",
      "rating": 4.8,
      "publishedYear": 2024,
      "description": "A handbook of agile software craftsmanship for building clean, maintainable, and elegant code.",
      "coverImage": "assets/images/clean-code.svg",
      "price": "$34.99"
    }
  ]
}
```

#### Get Single Book Details (`GET /api/books/:id`)
নির্দিষ্ট একটি বইয়ের id দিয়ে তার details জানতে:

**Example Request:**
`GET http://localhost:4020/api/books/1`

---

### 2. Genres API

#### Get All Genres (`GET /api/genres`)
System-এ থাকা সব বইয়ের genres বা categories-এর list পেতে:

**Response Example (200 OK):**
```json
{
  "success": true,
  "count": 4,
  "data": [
    "History",
    "Productivity",
    "Sci-Fi",
    "Tech"
  ]
}
```

---

### 3. Reading List API

#### Get Reading List (`GET /api/reading-list`)
User-এর reading list-এ থাকা সব বই এবং তাদের reading progress দেখার জন্য:

**Response Example (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "bookId": 1,
      "progress": 50,
      "addedAt": "2026-08-31T12:00:00.000Z",
      "book": {
        "id": 1,
        "title": "Clean Code",
        "author": "Sumit Saha",
        "genre": "Tech",
        "rating": 4.8,
        "publishedYear": 2024,
        "coverImage": "assets/images/clean-code.svg"
      }
    }
  ]
}
```

#### Get Reading List Summary (`GET /api/reading-list/summary`)
Reading list-এর summary metrics (total books, currently reading, completed books) জানতে:

**Response Example (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalBooks": 2,
    "currentlyReading": 1,
    "completedBooks": 1
  }
}
```

#### Add Book to Reading List (`POST /api/reading-list`)
Catalog থেকে কোনো বই reading list-এ যোগ করার জন্য:

**Request Body (JSON):**
```json
{
  "bookId": 3,
  "progress": 0
}
```
*Note: `progress`-এর value শুধুমাত্র `0`, `25`, `50`, `75`, অথবা `100` দেওয়া যাবে।*

#### Update Reading Progress (`PATCH /api/reading-list/:id`)
Reading list-এ থাকা কোনো বইয়ের reading progress update করতে:

**Request Body (JSON):**
```json
{
  "progress": 75
}
```

#### Remove Book from Reading List (`DELETE /api/reading-list/:id`)
Reading list থেকে কোনো বই সরিয়ে ফেলার জন্য:

**Example Request:**
`DELETE http://localhost:4020/api/reading-list/1`
