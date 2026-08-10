# 🎬 Movie Watchlist API

A REST API for managing movies and a personal watchlist — built to demonstrate real backend engineering, not just CRUD boilerplate. Handles authentication, validated data flows, and relational data design end-to-end.


## 🚀 Overview

Movie Watchlist API is a backend service that lets users register, authenticate, browse/manage a movie catalog, and maintain a personal watchlist with status tracking (Planned / Watching / Completed / Dropped) and ratings.

It's built as a self-contained backend — no frontend — designed to be tested with an API client and consumed by any client application.

---

## 🎯 Why This Project

Most beginner backend projects stop at "CRUD + JWT." This one was built to go a step further and make deliberate engineering trade-offs:

- Authentication that isn't vulnerable to basic XSS token theft
- An ORM setup upgraded to its latest major version ahead of most public tutorials/documentation catching up
- Input validation enforced at the boundary, not scattered through business logic
- A schema that models real many-to-many-style relationships (users, movies, and a join entity carrying extra state)

The goal was engineering judgment, not just "make the endpoint work."

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma 7 (`@prisma/client`, `PrismaPg` driver adapter) |
| Validation | Zod |
| Auth | JWT (httpOnly cookies), bcrypt |
| API Testing | Requestly |

---

## 🧠 Key Engineering Decisions

**JWT delivered via httpOnly cookies, not localStorage.**
Storing the token in a cookie with `httpOnly` set means client-side JavaScript can never read it — closing off the most common XSS-based token theft vector. Trade-off: requires CORS/`credentials` configuration and CSRF-awareness, both handled explicitly rather than ignored.

**Prisma 7 with the `PrismaPg` driver adapter, not the default client setup.**
Prisma 7 is ESM-only and no longer auto-loads `.env` or reads the connection string from the schema file. The project uses the driver adapter pattern (`PrismaPg` + explicit `prisma.config.ts`) — the current recommended approach — rather than staying on an older, simpler-but-outdated client pattern.

**Zod validation at the request boundary.**
Every mutating endpoint validates its payload against a Zod schema before it touches business logic or the database, so invalid data fails fast with a clear error instead of surfacing as a confusing downstream bug or a raw database constraint error.

**Password hashing with bcrypt, never plaintext or reversible encryption.**
Passwords are hashed with a salt before storage; the raw password is never persisted or logged.

**Centralized error handling middleware.**
Errors are thrown and caught in one place rather than every route handler managing its own try/catch/response shape — consistent error responses across the whole API.

---

## ⚡ Features

### 🔐 Authentication
- User registration with validated input and hashed passwords
- Login issuing a JWT stored in an httpOnly cookie
- Logout that clears the auth cookie
- Middleware-protected routes that reject unauthenticated requests

### 🎬 Movie Management
- Create, read, update, and delete movies
- Structured movie data: title, overview, release year, genres, runtime, poster URL
- Movies linked to the user who created them

### 📺 Watchlist
- Add any movie to a personal watchlist
- Track status per item: `PLANNED`, `WATCHING`, `COMPLETED`, `DROPPED`
- Rate watched movies and attach personal notes
- Update or remove watchlist entries independently of the movie record itself

### 🛠️ Cross-Cutting
- Zod-validated request bodies on every mutating route
- Centralized error-handling middleware
- Clear separation between auth, movie, and watchlist logic

---

## 🗄️ Database Schema

```prisma
model User {
  id       String @id @default(uuid())
  name     String
  email    String @unique
  password String

  createdAt DateTime @default(now())

  movies         Movie[]         @relation("MovieCreator")
  watchlistItems WatchlistItem[]
}

model Movie {
  id          String   @id @default(uuid())
  title       String
  overview    String?
  releaseYear Int
  genres      String[] @default([])
  runtime     Int?
  posterUrl   String?
  createdBy   String
  createdAt   DateTime @default(now())

  creator        User            @relation("MovieCreator", fields: [createdBy], references: [id], onDelete: Cascade)
  watchlistItems WatchlistItem[]
}

model WatchlistItem {
  id        String          @id @default(uuid())
  userId    String
  movieId   String
  status    WatchlistStatus @default(PLANNED)
  rating    Int?
  notes     String?
  createdAt DateTime        @default(now())
  updatedAt DateTime        @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  movie Movie @relation(fields: [movieId], references: [id], onDelete: Cascade)

  @@unique([userId, movieId])
}

enum WatchlistStatus {
  PLANNED
  WATCHING
  COMPLETED
  DROPPED
}
```

**Design notes:**
- `id` fields use UUIDs rather than auto-incrementing integers — harder to enumerate/guess, safer for public-facing IDs.
- `@@unique([userId, movieId])` on `WatchlistItem` enforces at the database level that a user can't add the same movie to their watchlist twice, instead of relying on application code to catch it.
- `onDelete: Cascade` on both relations means deleting a user cleans up their movies and watchlist entries automatically, and deleting a movie removes it from every watchlist it's on — no orphaned rows left behind.
- `overview`, `runtime`, and `posterUrl` are optional (`?`) since a movie can be created with just the required core fields and enriched later.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Log in, receive JWT (httpOnly cookie) | No |
| POST | `/auth/logout` | Log out, clear auth cookie | Yes |

### Movies
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/movies` | Get all movies | No |
| POST | `/movies` | Create a new movie | Yes |
| PUT | `/movies/:id` | Update a movie | Yes |
| DELETE | `/movies/:id` | Delete a movie | Yes |

### Watchlist
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/watchlist` | Add a movie to the watchlist | Yes |
| PUT | `/watchlist/:id` | Update status/rating/notes | Yes |
| DELETE | `/watchlist/:id` | Remove a watchlist item | Yes |

---

## 👌 Getting Started

### Prerequisites
- Node.js 20.19+ (Prisma 7 requires it)
- PostgreSQL 14+
- Git

### Installation

```bash
git clone https://github.com/Anmol1578/Movie-Watchlist-Api.git
cd Movie-Watchlist-Api
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5001
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

API available at `http://localhost:5001`.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `PORT` | Port the server runs on |

---

## 🧪 Testing

All endpoints were manually tested end-to-end with **Requestly**, covering:
- Registration/login/logout flows and cookie-based auth persistence
- Movie CRUD operations with and without auth
- Watchlist add/update/remove flows across all status values
- Validation failures (missing/invalid fields) and expected error responses

---

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── generated/
│   │   └── client/        # generated Prisma Client (custom output path)
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── validators/         # Zod schemas
│   └── lib/
│       └── prisma.js       # PrismaClient + PrismaPg adapter setup
├── prisma.config.ts
├── server.js
└── package.json
```

> Adjust routes/controllers/middleware folder names to match the actual layout in the repo — the Prisma pieces above are confirmed from `schema.prisma`.

---

## 🗺️ Roadmap

- [ ] Pagination and filtering on `GET /movies`
- [ ] Rate limiting on auth routes
- [ ] Automated tests (Jest + Supertest)
- [ ] Deployment (Railway/Render)

