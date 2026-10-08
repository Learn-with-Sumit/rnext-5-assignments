# 📬 BookShelf RESTful API — Postman Collection & API Documentation

> **Batch 5 Assignment 4**: Comprehensive API testing documentation and Postman Collection for the BookShelf book discovery and reading tracking platform.
>
> File Path: [`backend/postman/BookShelf_API.postman_collection.json`](file:///Users/akashusr/Work/B5-Assignment/assignment-4/backend/postman/BookShelf_API.postman_collection.json)

---

## 📑 সূচিপত্র (Table of Contents)
1. [সংক্ষিপ্ত পরিচিতি (Overview)](#-সংক্ষিপ্ত-পরিচিতি-overview)
2. [পোস্টম্যান কালেকশন ইমপোর্ট করার নিয়ম (How to Import)](#-পোস্টম্যান-কালেকশন-ইমপোর্ট-করার-নিয়ম-how-to-import)
3. [এনভায়রনমেন্ট ভেরিয়েবল সেটআপ (Environment Variables)](#-এনভায়রনমেন্ট-ভেরিয়েবল-সেটআপ-environment-variables)
4. [অটোমেটেড টেস্ট রান করার পদ্ধতি (Running Automated Tests)](#-অটোমেটেড-টেস্ট-রান-করার-পদ্ধতি-running-automated-tests)
5. [সম্পূর্ণ এন্ডপয়েন্ট রেফারেন্স ও কোড উদাহরণ (API Reference with Code Examples)](#-সম্পূর্ণ-এন্ডপয়েন্ট-রেফারেন্স-ও-কোড-উদাহরণ)
   - [0. Health Check (`GET /`)](#0-health-check-get-)
   - [1. Books Endpoints (`/api/books`)](#1-books-endpoints)
     - [1.1 Get All Books (`GET /api/books`)](#11-get-all-books-get-apibooks)
     - [1.2 Search Books (`GET /api/books?search=...`)](#12-search-books-get-apibookssearch)
     - [1.3 Filter by Genre (`GET /api/books?genre=...`)](#13-filter-by-genre-get-apibooksgenre)
     - [1.4 Filter by Minimum Rating (`GET /api/books?minRating=...`)](#14-filter-by-minimum-rating-get-apibooksminrating)
     - [1.5 Sort Books (`GET /api/books?sort=...`)](#15-sort-books-get-apibookssort)
     - [1.6 Get Single Book by ID (`GET /api/books/:id`)](#16-get-single-book-by-id-get-apibooksid)
     - [1.7 Error Cases (400 Bad Request & 404 Not Found)](#17-error-cases-for-books-endpoints)
   - [2. Genres Endpoint (`GET /api/genres`)](#2-genres-endpoint-get-apigenres)
   - [3. Shelf Endpoints (`/api/reading-list`)](#3-shelf-endpoints)
     - [3.1 Get Shelf (`GET /api/reading-list`)](#31-get-shelf-get-apireading-list)
     - [3.2 Get Reading Summary Metrics (`GET /api/reading-list/summary`)](#32-get-reading-summary-metrics-get-apireading-listsummary)
     - [3.3 Add Book to Shelf (`POST /api/reading-list`)](#33-add-book-to-shelf-post-apireading-list)
     - [3.4 Update Reading Progress (`PATCH /api/reading-list/:id`)](#34-update-reading-progress-patch-apireading-listid)
     - [3.5 Remove Book from Shelf (`DELETE /api/reading-list/:id`)](#35-remove-book-from-shelf-delete-apireading-listid)
     - [3.6 Validation & Error Testing (400, 404, 409)](#36-validation--error-testing)
6. [Newman CLI দিয়ে টার্মিনালে টেস্ট রান করা](#-newman-cli-দিয়ে-টার্মিনালে-টেস্ট-রান-করা)
7. [সমস্যা ও সমাধান (Troubleshooting)](#-সমস্যা-ও-সমাধান-troubleshooting)

---

## 🌟 সংক্ষিপ্ত পরিচিতি (Overview)

BookShelf RESTful API একটি আধুনিক, স্কেলেবল বুক ডিসকভারি ও রিডিং ট্র্যাকিং প্ল্যাটফর্মের ব্যাকএন্ড। এটি **Node.js**, **Express.js**, এবং **PostgreSQL** দিয়ে তৈরি করা হয়েছে।

### কালেকশনের বিশেষ সুবিধাসমূহ:
- **১৯টি প্রি-কনফিগার করা রিকোয়েস্ট**: সাধারণ কেস, ফিল্টারিং, সর্টিং এবং সব ধরণের ভ্যালিডেশন এরর কেস অন্তর্ভুক্ত।
- **স্বয়ংক্রিয় টেস্ট স্ক্রিপ্ট (Automated Test Scripts)**: প্রতিটি রিকোয়েস্টে `pm.test` অন্তর্ভুক্ত যা রেসপন্স কোড, ডাটা টাইপ এবং বিজনেস লজিক যাচাই করে।
- **সেভ করা রেসপন্স এক্সাম্পল (Saved Response Examples)**: পোস্টম্যানে যেকোনো রিকোয়েস্ট সিলেক্ট করলেই ড্রপডাউন থেকে সফল রেসপন্স (`200 OK`, `201 Created`) এবং এরর রেসপন্স (`400`, `404`, `409`) দেখা যায়।
- **কোড স্নিপেট (Ready-to-use Code)**: প্রতিটি এন্ডপয়েন্টের সাথে **cURL** এবং **JavaScript (Fetch API)** এর কপি-পেস্ট উপযোগী কোড দেওয়া আছে।

---

## 📥 পোস্টম্যান কালেকশন ইমপোর্ট করার নিয়ম (How to Import)

১. আপনার কম্পিউটারে **Postman** অ্যাপটি ওপেন করুন (অথবা [web.postman.co](https://web.postman.co) ব্যবহার করুন)।
২. উপরের বাম কোণে থাকা **Import** বাটনে ক্লিক করুন।
৩. ফাইল ড্রপ এরিয়ায় `backend/postman/BookShelf_API.postman_collection.json` ফাইলটি ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা **files** ব্রাউজ করে নির্বাচন করুন।
৪. **Import** বাটনে ক্লিক করুন। এখন বামপাশের কালেকশন ট্যাবে `BookShelf RESTful API Collection (Batch 5 Assignment 4)` দেখতে পাবেন।

---

## ⚙️ এনভায়রনমেন্ট ভেরিয়েবল সেটআপ (Environment Variables)

কালেকশনটিতে ডিফল্টভাবে একটি ভেরিয়েবল ডিফাইন করা আছে:
- **Key**: `baseUrl`
- **Default Value**: `http://localhost:4020`

### ভেরিয়েবল পরিবর্তন করার উপায়:
1. Postman-এ কালেকশনের নামের উপর ক্লিক করুন।
2. **Variables** ট্যাবে যান।
3. `baseUrl` এর মান প্রয়োজন অনুযায়ী পরিবর্তন করুন (যেমন সার্ভার অন্য পোর্টে চললে `http://localhost:8000` দিন)।
4. **Save** বাটনে ক্লিক করুন (অথবা `Ctrl + S` / `Cmd + S`)।

---

## 🧪 অটোমেটেড টেস্ট রান করার পদ্ধতি (Running Automated Tests)

পোস্টম্যান কালেকশন রানার (Collection Runner) দিয়ে এক ক্লিকে সবগুলো এন্ডপয়েন্ট ও টেস্ট কেস টেস্ট করা সম্ভব:

১. কালেকশনের নামের ডানপাশে থাকা **`...` (More actions)** আইকনে ক্লিক করুন অথবা কালেকশন সিলেক্ট করে **Run collection** বাটনে ক্লিক করুন।
২. রানার উইন্ডোতে **Run BookShelf RESTful API Collection** বাটনে ক্লিক করুন।
৩. পোস্টম্যান স্বয়ংক্রিয়ভাবে সবগুলো রিকোয়েস্ট পাঠাবে এবং সব টেস্ট অ্যাসারশন ভ্যালিডেট করবে:
   - ✅ `Status code is 200 / 201`
   - ✅ `Response schema matches expected JSON structure`
   - ✅ `Search and filter logic correctly matches keywords`
   - ✅ `Validation rules for progress values (0, 25, 50, 75, 100) enforced`
   - ✅ `Duplicate book entry blocked with 409 Conflict`

---

## 📖 সম্পূর্ণ এন্ডপয়েন্ট রেফারেন্স ও কোড উদাহরণ

### 0. Health Check (`GET /`)
সার্ভার লাইভ আছে কিনা এবং কোন কোন রুট বিদ্যমান তা যাচাই করতে ব্যবহৃত হয়।

- **Method**: `GET`
- **URL**: `{{baseUrl}}/`
- **Authentication**: None

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET http://localhost:4020/
```

**JavaScript (Fetch API):**
```javascript
const response = await fetch('http://localhost:4020/');
const data = await response.json();
console.log(data);
```

#### 📤 রেসপন্স (`200 OK`):
```json
{
  "success": true,
  "message": "BookShelf RESTful API is operational 🚀",
  "version": "1.0.0",
  "endpoints": {
    "books": "/api/books",
    "genres": "/api/genres",
    "readingList": "/api/reading-list",
    "readingSummary": "/api/reading-list/summary"
  }
}
```

---

### 1. Books Endpoints

#### 1.1 Get All Books (`GET /api/books`)
ডাটাবেসে থাকা সমস্ত বইয়ের তালিকা রিটার্ন করে।

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/books`

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET http://localhost:4020/api/books
```

**JavaScript (Fetch API):**
```javascript
async function getAllBooks() {
  const response = await fetch('http://localhost:4020/api/books');
  const result = await response.json();
  console.log(`মোট বই পাওয়া গেছে: ${result.count}`);
  console.log(result.data);
}
getAllBooks();
```

#### 📤 রেসপন্স (`200 OK`):
```json
{
  "success": true,
  "count": 6,
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
    },
    {
      "id": 2,
      "title": "Atomic Habits",
      "author": "Saad Hasan",
      "genre": "Productivity",
      "rating": 4.9,
      "publishedYear": 2023,
      "description": "An easy and proven way to build good habits and break bad ones through tiny, compound changes.",
      "coverImage": "assets/images/atomic-habits.svg",
      "price": "$27.00"
    }
  ]
}
```

---

#### 1.2 Search Books (`GET /api/books?search=...`)
বইয়ের শিরোনাম, লেখক অথবা বিবরণে আংশিক শব্দ খোঁজার জন্য। এটি Case-Insensitive (বড় বা ছোট হাতের অক্ষর নিরপেক্ষ)।

- **Query Param**: `search` (String)

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET "http://localhost:4020/api/books?search=Clean"
```

**JavaScript (Fetch API):**
```javascript
async function searchBooks(query) {
  const response = await fetch(`http://localhost:4020/api/books?search=${encodeURIComponent(query)}`);
  const data = await response.json();
  console.log('Search Results:', data.data);
}
searchBooks('Clean');
```

---

#### 1.3 Filter by Genre (`GET /api/books?genre=...`)
নির্দিষ্ট ক্যাটাগরির বই ফিল্টার করতে ব্যবহৃত হয় (যেমন: `Tech`, `Productivity`, `Sci-Fi`, `History`)।

- **Query Param**: `genre` (String)

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET "http://localhost:4020/api/books?genre=Tech"
```

**JavaScript (Fetch API):**
```javascript
async function filterByGenre(genre) {
  const response = await fetch(`http://localhost:4020/api/books?genre=${encodeURIComponent(genre)}`);
  const data = await response.json();
  console.log(`${genre} বইসমূহ:`, data.data);
}
filterByGenre('Tech');
```

---

#### 1.4 Filter by Minimum Rating (`GET /api/books?minRating=...`)
একটি নির্দিষ্ট রেটিং বা তার চেয়ে বেশি রেটিংয়ের বইগুলো ফিল্টার করার এন্ডপয়েন্ট।

- **Query Param**: `minRating` (Number, e.g. `4.8`)

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET "http://localhost:4020/api/books?minRating=4.8"
```

**JavaScript (Fetch API):**
```javascript
const res = await fetch('http://localhost:4020/api/books?minRating=4.8');
const data = await res.json();
console.log('Top Rated Books:', data.data);
```

---

#### 1.5 Sort Books (`GET /api/books?sort=...`)
বইয়ের তালিকা বিভিন্ন মানদণ্ডে সর্ট করা যায়:
- `sort=rating`: সর্বোচ্চ রেটিংপ্রাপ্ত বই প্রথমে আসবে।
- `sort=newest`: সর্বশেষ প্রকাশিত বই প্রথমে আসবে (`publishedYear DESC`)।
- `sort=oldest`: প্রাচীনতম বই প্রথমে আসবে (`publishedYear ASC`)।

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
# রেটিং অনুযায়ী সর্বোচ্চ থেকে সর্বনিম্ন
curl -X GET "http://localhost:4020/api/books?sort=rating"

# নতুন বই প্রথমে
curl -X GET "http://localhost:4020/api/books?sort=newest"
```

**JavaScript (Fetch API):**
```javascript
async function getSortedBooks(sortBy) {
  const res = await fetch(`http://localhost:4020/api/books?sort=${sortBy}`);
  const data = await res.json();
  console.log(`Sorted by ${sortBy}:`, data.data);
}
getSortedBooks('rating');
```

---

#### 1.6 Get Single Book by ID (`GET /api/books/:id`)
আইডি দিয়ে নির্দিষ্ট একটি বইয়ের সমস্ত বিস্তারিত তথ্য দেখা।

- **Method**: `GET`
- **Path Param**: `id` (Integer)

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET http://localhost:4020/api/books/1
```

**JavaScript (Fetch API):**
```javascript
async function getBookDetails(id) {
  const response = await fetch(`http://localhost:4020/api/books/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  console.log('Book Details:', result.data);
}
getBookDetails(1);
```

#### 📤 রেসপন্স (`200 OK`):
```json
{
  "success": true,
  "data": {
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
}
```

---

#### 1.7 Error Cases for Books Endpoints

##### ক) বই খুঁজে না পেলে (`404 Not Found`):
```bash
curl -X GET http://localhost:4020/api/books/999
```
**রেসপন্স (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Book with id 999 not found."
}
```

##### খ) ইনভ্যালিড আইডি ফরম্যাট দিলে (`400 Bad Request`):
```bash
curl -X GET http://localhost:4020/api/books/invalid-id
```
**রেসপন্স (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Invalid book ID format."
}
```

---

### 2. Genres Endpoint (`GET /api/genres`)
ডাটাবেসে উপস্থিত সমস্ত বইয়ের ইউনিক জনরা বা ক্যাটাগরির তালিকা প্রদান করে।

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/genres`

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET http://localhost:4020/api/genres
```

**JavaScript (Fetch API):**
```javascript
async function getGenres() {
  const res = await fetch('http://localhost:4020/api/genres');
  const data = await res.json();
  console.log('সকল জনরা:', data.data);
}
getGenres();
```

#### 📤 রেসপন্স (`200 OK`):
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

### 3. Shelf Endpoints

> ### 💡 ⚠️ অতি গুরুত্বপূর্ণ নির্দেশনা: কোন আইডিটি কখন ব্যবহার করবেন? (ID Usage Clarification)
> রিডিং লিস্ট সংক্রান্ত এন্ডপয়েন্টগুলোতে কাজ করার সময় ইউজার বা ডেভেলপারদের মাঝে **দুইটি ভিন্ন আইডি** নিয়ে প্রায়শই বিভ্রান্তি দেখা দেয়:
> 1. **`bookId` (বইয়ের ক্যাটালগ আইডি)**: বইয়ের মূল ক্যাটালগ (`/api/books`) থেকে পাওয়া বইটির নিজস্ব আইডি (যেমন: Clean Code বইয়ের আইডি `1`)।
> 2. **`id` (রিডিং লিস্ট এন্ট্রি আইডি)**: আপনার পড়ার তালিকায় ওই বইটি যুক্ত হওয়ার পর তৈরি হওয়া রিডিং লিস্টের নিজস্ব অনন্য আইডি।
>
> | অ্যাকশন | মেথড ও এন্ডপয়েন্ট | কোন আইডিটি ব্যবহার করবেন? | স্পষ্ট ব্যাখ্যা |
> |---|---|---|---|
> | **বই রিডিং লিস্টে যোগ করা** | `POST /api/reading-list` | 👉 **`bookId` (অবশ্যই Book ID)** | রিকোয়েস্ট বডিতে `{"bookId": 3, "progress": 0}` পাঠাবেন। কারণ আপনি ক্যাটালগ থেকে বই সিলেক্ট করছেন; এই সময় রিডিং লিস্টের কোনো আইডি থাকে না। |
> | **রিডিং লিস্ট থেকে বই মোছা** | `DELETE /api/reading-list/:id` | 👉 **`id` (Reading List ID - Recommended)** | ইউআরএলে রিডিং লিস্টের নিজস্ব `id` দিন (যেমন: `/api/reading-list/1`)। তবে আপনার সুবিধার জন্য ব্যাকএন্ডে **Book ID (`bookId`)** ও ভ্যালিড (যেমন: `/api/reading-list/3`)। ব্যাকএন্ড উভয় আইডিই সঠিকভাবে শনাক্ত করে। |
> | **পড়ার অগ্রগতি আপডেট করা** | `PATCH /api/reading-list/:id` | 👉 **`id` (Reading List ID - Recommended)** | ইউআরএলে রিডিং লিস্টের নিজস্ব `id` দিন (যেমন: `/api/reading-list/1`)। এখানেও বিকল্প হিসেবে Book ID সাপোর্টেড। |

---

#### 3.1 Get Shelf (`GET /api/reading-list`)
ব্যবহারকারীর পড়ার তালিকায় যুক্ত থাকা বইগুলো এবং প্রতিটির বর্তমান প্রগ্রেস রিটার্ন করে। প্রতিটি আইটেমের মধ্যে সম্পূর্ণ `book` অবজেক্ট অন্তর্ভুক্ত থাকে।


- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/reading-list`

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET http://localhost:4020/api/reading-list
```

**JavaScript (Fetch API):**
```javascript
async function getReadingShelf() {
  const res = await fetch('http://localhost:4020/api/reading-list');
  const result = await res.json();
  console.log(`তালিকায় বই আছে: ${result.count}`);
  result.data.forEach(item => {
    console.log(`${item.book.title} — Progress: ${item.progress}%`);
  });
}
getReadingShelf();
```

#### 📤 রেসপন্স (`200 OK`):
```json
{
  "success": true,
  "count": 2,
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
        "coverImage": "assets/images/clean-code.svg",
        "price": "$34.99"
      }
    }
  ]
}
```

---

#### 3.2 Get Reading Summary Metrics (`GET /api/reading-list/summary`)
পড়ার তালিকার সামগ্রিক পরিসংখ্যান রিটার্ন করে:
- **`totalBooks`**: তালিকায় মোট বইয়ের সংখ্যা
- **`currentlyReading`**: যেসব বইয়ের প্রগ্রেস **1% থেকে 99%** এর মধ্যে
- **`completedBooks`**: যেসব বইয়ের প্রগ্রেস **100%**

- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/reading-list/summary`

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X GET http://localhost:4020/api/reading-list/summary
```

**JavaScript (Fetch API):**
```javascript
async function getReadingMetrics() {
  const res = await fetch('http://localhost:4020/api/reading-list/summary');
  const { data } = await res.json();
  console.log(`মোট বই: ${data.totalBooks}`);
  console.log(`চলমান পড়া: ${data.currentlyReading}`);
  console.log(`পড়া সম্পন্ন: ${data.completedBooks}`);
}
getReadingMetrics();
```

#### 📤 রেসপন্স (`200 OK`):
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

---

#### 3.3 Add Book to Shelf (`POST /api/reading-list`)
ব্যবহারকারীর পড়ার তালিকায় নতুন একটি বই যুক্ত করার রুট।

> 🆔 **কোন আইডি ব্যবহার করবেন? (Specific ID Instruction)**:
> - এখানে আপনাকে **অবশ্যই Book ID (`bookId`)** পাঠাতে হবে (যেমন: `3`)।
> - কারণ: আপনি বইয়ের মূল ক্যাটালগ (`/api/books`) থেকে একটি বই নির্বাচন করে রিডিং তালিকায় নিচ্ছেন। এ সময় রিডিং লিস্টের কোনো আইডি তৈরি হয় না।

- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/reading-list`
- **Headers**: `Content-Type: application/json`

#### 📌 Request Body Specification:
| Field | Type | Required | Allowed Values | Description |
|---|---|---|---|---|
| `bookId` | Integer | **Yes** | Existing book ID | যে বইটি যুক্ত করা হচ্ছে (বইয়ের ক্যাটালগ আইডি) |
| `progress` | Integer | No (Default `0`) | `0`, `25`, `50`, `75`, `100` | পড়ার প্রাথমিক অগ্রগতি |


#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X POST http://localhost:4020/api/reading-list \
  -H "Content-Type: application/json" \
  -d '{"bookId": 3, "progress": 0}'
```

**JavaScript (Fetch API):**
```javascript
async function addToReadingList(bookId, progress = 0) {
  const response = await fetch('http://localhost:4020/api/reading-list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, progress })
  });

  const result = await response.json();
  if (response.status === 201) {
    console.log('বই যুক্ত হয়েছে:', result.data);
  } else {
    console.error('ব্যর্থ হয়েছে:', result.message);
  }
}
addToReadingList(3, 0);
```

#### 📤 রেসপন্স (`201 Created`):
```json
{
  "success": true,
  "message": "Book added to shelf successfully.",
  "data": {
    "id": 3,
    "bookId": 3,
    "progress": 0,
    "addedAt": "2026-08-31T12:30:00.000Z"
  }
}
```

---

#### 3.4 Update Reading Progress (`PATCH /api/reading-list/:id`)
পড়ার তালিকায় থাকা কোনো বইয়ের পড়ার অগ্রগতি আপডেট করা। (`PATCH` বা `PUT` মেথড প্রযোজ্য)।

> 🆔 **কোন আইডি ব্যবহার করবেন? (Specific ID Instruction)**:
> - **স্ট্যান্ডার্ড (Recommended)**: ইউআরএলে রিডিং লিস্টের নিজস্ব **Reading List ID (`id`)** ব্যবহার করুন (যেমন: `/api/reading-list/1` — যা `GET /api/reading-list` রেসপন্সের প্রধান `id` ফিল্ডে পাওয়া যায়)।
> - **বিকল্প সুবিধা (Flexible Support)**: ডেভেলপার বা ইউজারের সুবিধার জন্য আপনি চাইলে সরাসরি **Book ID (`bookId`)** ও দিতে পারেন (যেমন: `/api/reading-list/3`)। ব্যাকএন্ড উভয় আইডি দিয়ে স্বয়ংক্রিয়ভাবে রেকর্ড খুঁজে নিয়ে আপডেট করতে সক্ষম।

- **Method**: `PATCH` / `PUT`
- **URL**: `{{baseUrl}}/api/reading-list/:id`
- **Headers**: `Content-Type: application/json`
- **Path Param**: `:id` (Recommended: Reading List ID `id`, অথবা Book ID `bookId`)

#### 📌 Request Body:
| Field | Type | Required | Allowed Values |
|---|---|---|---|
| `progress` | Integer | **Yes** | `0`, `25`, `50`, `75`, `100` |

#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X PATCH http://localhost:4020/api/reading-list/1 \
  -H "Content-Type: application/json" \
  -d '{"progress": 75}'
```

**JavaScript (Fetch API):**
```javascript
async function updateProgress(id, newProgress) {
  const response = await fetch(`http://localhost:4020/api/reading-list/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress: newProgress })
  });
  const data = await response.json();
  console.log('Progress updated:', data);
}
updateProgress(1, 75);
```

#### 📤 রেসপন্স (`200 OK`):
```json
{
  "success": true,
  "message": "Reading progress updated successfully.",
  "data": {
    "id": 1,
    "bookId": 1,
    "progress": 75,
    "updatedAt": "2026-08-31T12:35:00.000Z"
  }
}
```

---

#### 3.5 Remove Book from Shelf (`DELETE /api/reading-list/:id`)
ব্যবহারকারীর পড়ার তালিকা থেকে কোনো বই মুছে ফেলার এন্ডপয়েন্ট।

> 🆔 **কোন আইডি ব্যবহার করবেন? (Specific ID Instruction)**:
> - **সুপারিশকৃত (Recommended)**: ইউআরএলে রিডিং লিস্টের নিজস্ব **Reading List ID (`id`)** ব্যবহার করুন (যেমন: `DELETE /api/reading-list/1` — যা `GET /api/reading-list` রেসপন্সের প্রধান `id` ফিল্ডে পাওয়া যায়)।
> - **বিকল্প সুবিধা (Flexible Support)**: কোনো কারণে আপনার কাছে শুধুমাত্র বইয়ের আইডি থাকলে আপনি সরাসরি **Book ID (`bookId`)** ও ইউআরএলে পাস করতে পারেন (যেমন: `DELETE /api/reading-list/3`)। ব্যাকএন্ড উভয় আইডি দিয়েই রেকর্ড শনাক্ত করে সফলভাবে ডিলিট করে দেয়।

- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/reading-list/:id`
- **Path Param**: `:id` (Recommended: Reading List ID `id`, অথবা Book ID `bookId`)


#### 💻 কোড উদাহরণ:
**cURL:**
```bash
curl -X DELETE http://localhost:4020/api/reading-list/3
```

**JavaScript (Fetch API):**
```javascript
async function removeBook(id) {
  const response = await fetch(`http://localhost:4020/api/reading-list/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  console.log(data.message);
}
removeBook(3);
```

#### 📤 রেসপন্স (`200 OK`):
```json
{
  "success": true,
  "message": "Book removed from shelf successfully."
}
```

---

#### 3.6 Validation & Error Testing

##### ১. একই বই দুইবার যোগ করার চেষ্টা (`409 Conflict`):
যদি বই ইতিমধ্যে তালিকায় থাকে:
```json
{
  "success": false,
  "message": "This book is already in your shelf."
}
```

##### ২. অননুমোদিত প্রগ্রেস মান পাঠানো (`400 Bad Request`):
যদি `progress` হিসেবে `0, 25, 50, 75, 100` ব্যতীত অন্য কিছু (যেমন: `35`) পাঠানো হয়:
```json
{
  "success": false,
  "message": "Invalid progress value. Allowed values are: 0, 25, 50, 75, 100"
}
```

##### ৩. অনুপস্থিত আইটেম ডিলিট করার চেষ্টা (`404 Not Found`):
```json
{
  "success": false,
  "message": "Shelf entry not found for id 999."
}
```

---

## 💻 Newman CLI দিয়ে টার্মিনালে টেস্ট রান করা

যদি আপনি কোনো GUI ছাড়াই সরাসরি টার্মিনাল বা CI/CD পাইপলাইনে পোস্টম্যান টেস্ট চালাতে চান, তবে **Newman** ব্যবহার করতে পারেন:

```bash
# Newman ইনস্টল না থাকলে সরাসরি npx দিয়ে চালান
npx -y newman run backend/postman/BookShelf_API.postman_collection.json --env-var "baseUrl=http://localhost:4020"
```

এটি স্বয়ংক্রিয়ভাবে ১৯টি রিকোয়েস্ট পাঠাবে এবং টার্মিনালে একটি রঙিন টেস্ট রিপোর্ট টেবিল প্রদর্শন করবে!

---

## 🛠️ সমস্যা ও সমাধান (Troubleshooting)

| সমস্যা (Problem) | কারণ (Reason) | সমাধান (Solution) |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:5000` | ব্যাকএন্ড সার্ভার চালু করা হয়নি | `cd backend && npm run dev` দিয়ে সার্ভার চালু করুন। |
| `Status 409 Conflict` | বই আগে থেকেই রিডিং লিস্টে আছে | নতুন কোনো বই যুক্ত করুন অথবা আগে `DELETE` করে পুনরায় টেস্ট করুন। |
| `Status 400 Bad Request` | ভুল প্রগ্রেস ভ্যালু অথবা মিসিং ফিল্ড | `progress` হিসেবে শুধুমাত্র `0, 25, 50, 75, 100` ব্যবহার করুন। |
| PostgreSQL কানেকশন না পেলে | লোকাল মেশিনে PostgreSQL চালু নেই | সিস্টেম স্বয়ংক্রিয়ভাবে In-Memory ফলব্যাকে চলবে, কোনো কিছু বন্ধ হবে না। |
