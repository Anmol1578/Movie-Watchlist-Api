# 🎬 Movie Watchlist API

A backend-only REST API for managing movies and personal watchlists.

Built with **Node.js, Express, PostgreSQL, Prisma 7, JWT, bcrypt, and Zod**. The project focuses on authentication, authorization, relational database design, request validation, and secure API development.

**Live API:** https://movie-watchlist-api-m5sx.onrender.com

**GitHub:** https://github.com/Anmol1578/Movie-Watchlist-Api

> Backend only — no frontend is included. You can use Postman, Requestly, Insomnia, or any frontend/client application to consume the API.

---

## 🚀 Features

### Authentication

* User registration
* Secure password hashing with bcrypt
* JWT authentication
* JWT stored in an `httpOnly` cookie
* Authentication middleware
* Login and logout

### Watchlist

* Add movies to a personal watchlist
* Track watch status
* Add ratings from 1–10
* Add personal notes
* Update watchlist items
* Remove movies from the watchlist
* Prevent duplicate movies in the same user's watchlist
* User ownership checks

### Backend

* PostgreSQL relational database
* Prisma 7 ORM with `PrismaPg`
* Zod request validation
* UUID-based identifiers
* Foreign-key relationships
* Cascade deletes
* Database migrations
* Environment-based configuration
* Graceful database/server shutdown

---

## 🛠️ Tech Stack

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Runtime                   |
| Express.js | REST API                  |
| PostgreSQL | Database                  |
| Prisma 7   | ORM                       |
| PrismaPg   | PostgreSQL driver adapter |
| JWT        | Authentication            |
| bcryptjs   | Password hashing          |
| Zod        | Request validation        |
| dotenv     | Environment variables     |
| Render     | Deployment                |

---

## 🏗️ Architecture

```text
Client / Postman / Requestly
            │
            ▼
        Express API
            │
     ┌──────┴──────┐
     │             │
 Middleware      Routes
     │             │
     ▼             ▼
Authentication  Controllers
Validation          │
                    ▼
               Prisma 7
                    │
                    ▼
                PostgreSQL
```

The application separates:

* Routes
* Controllers
* Middleware
* Validators
* Database configuration
* Utility functions

---

## 🗄️ Database

The application uses three main models:

```text
User
 │
 ├── Movie
 │
 └── WatchlistItem
          │
          └── Movie
```

### User

Stores registered users and authentication information.

### Movie

Stores movie information and the user who created the movie.

### WatchlistItem

Connects a user with a movie and stores:

* Status
* Rating
* Notes
* Created date
* Updated date

A composite unique constraint prevents the same movie from being added twice by the same user:

```prisma
@@unique([userId, movieId])
```

Supported watchlist statuses:

```text
PLANNED
WATCHING
COMPLETED
DROPPED
```

---

# 🔌 API Endpoints

Base URL:

```text
https://movie-watchlist-api-m5sx.onrender.com
```

## Health Check

| Method | Endpoint | Auth |
| ------ | -------- | ---- |
| GET    | `/`      | No   |

---

## Authentication

| Method | Endpoint         | Auth |
| ------ | ---------------- | ---- |
| POST   | `/auth/register` | No   |
| POST   | `/auth/login`    | No   |
| POST   | `/auth/logout`   | No   |

### Register

```http
POST /auth/register
```

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```http
POST /auth/login
```

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

After successful login, the API creates a JWT and stores it in an `httpOnly` cookie.

---

## Movies

The current movie router contains:

| Method | Endpoint       | Auth |
| ------ | -------------- | ---- |
| GET    | `/movies/film` | No   |
| GET    | `/movies/hd`   | No   |

> Movie CRUD can be added as the movie module is expanded.

---

## Watchlist

All watchlist routes require authentication.

| Method | Endpoint         | Description |
| ------ | ---------------- | ----------- |
| POST   | `/watchlist`     | Add movie   |
| PUT    | `/watchlist/:id` | Update item |
| DELETE | `/watchlist/:id` | Remove item |

### Add to Watchlist

```http
POST /watchlist
```

```json
{
  "movieId": "movie-uuid",
  "status": "PLANNED",
  "rating": 8,
  "notes": "Recommended movie"
}
```

### Update Watchlist

```http
PUT /watchlist/:id
```

```json
{
  "status": "COMPLETED",
  "rating": 9,
  "notes": "Excellent movie"
}
```

---

# 🔐 Authentication

Protected endpoints accept authentication through the JWT cookie created during login.

The authentication middleware:

```text
Request
   ↓
Read JWT
   ↓
Verify JWT
   ↓
Find User
   ↓
req.user
   ↓
Protected Controller
```

Passwords are hashed using bcrypt before being stored.

The API never stores the user's original password.

---

# ✅ Validation

Watchlist requests are validated using Zod.

For example:

* `movieId` must be a UUID
* `status` must be a valid watchlist status
* `rating` must be an integer between 1 and 10
* `notes` must be a string

Invalid requests are rejected before reaching the database.

---

# 💻 Run Locally

## 1. Clone

```bash
git clone https://github.com/Anmol1578/Movie-Watchlist-Api.git

cd Movie-Watchlist-Api
```

## 2. Install

```bash
npm install
```

## 3. Create `.env`

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

JWT_SECRET="your-super-secret-jwt-key"

JWT_EXPIRES_IN="7d"

PORT=5001

NODE_ENV="development"
```

## 4. Run Prisma migration

```bash
npx prisma migrate dev
```

## 5. Generate Prisma Client

```bash
npx prisma generate
```

## 6. Start development server

```bash
npm run dev
```

API:

```text
http://localhost:5001
```

---

# 🧪 How to Use

You can test the API using **Postman, Requestly, Insomnia, or curl**.

### Recommended flow

```text
1. Register
      ↓
2. Login
      ↓
3. Authentication cookie is created
      ↓
4. Create/use a movie
      ↓
5. Add movie to watchlist
      ↓
6. Update status/rating/notes
      ↓
7. Remove from watchlist
      ↓
8. Logout
```

For protected endpoints, make sure your API client preserves the authentication cookie received during login.

---

# 🌱 Seed Movies

The project includes a movie seed script.

```bash
npm run seed:movies
```

This creates sample movies such as:

* The Matrix
* Inception
* The Dark Knight
* Pulp Fiction
* Interstellar
* The Shawshank Redemption
* Fight Club
* Forrest Gump
* The Godfather
* Goodfellas

> The current seed script uses a predefined user UUID, so that user must exist before running the movie seed.

---

# 📁 Project Structure

```text
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
│
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── watchlistController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── validateRequest.js
│   ├── route/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   └── watchlistRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── validators/
│   │   └── watchlistValidators.js
│   ├── generated/
│   │   └── client/
│   └── server.js
│
├── package.json
└── .env
```

---

# 📦 NPM Scripts

```bash
npm run dev
```

Starts the development server with Nodemon.

```bash
npm run build
```

Generates the Prisma Client.

```bash
npm start
```

Starts the production server.

```bash
npm run seed:movies
```

Seeds sample movies.

---

# ☁️ Deployment

The API is deployed on **Render**.

Production URL:

```text
https://movie-watchlist-api-m5sx.onrender.com
```

Required production environment variables:

```env
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
NODE_ENV
PORT
```

The server listens on `0.0.0.0` and uses the `PORT` provided by the deployment platform.

---

# 🔮 Future Improvements

* [ ] Complete movie CRUD
* [ ] Get user's watchlist
* [ ] Movie search and filtering
* [ ] Pagination
* [ ] Authentication validation with Zod
* [ ] Centralized error handling
* [ ] Rate limiting
* [ ] Automated tests with Jest/Supertest
* [ ] Swagger/OpenAPI documentation
* [ ] Production logging and monitoring

---

## 👨‍💻 Author

**Anmol**

Backend project built to demonstrate practical Node.js backend development with Express, PostgreSQL, Prisma, authentication, validation, and relational database design.

