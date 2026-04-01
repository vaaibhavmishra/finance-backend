# 💰 Finance Data Processing & Access Control Backend

A production-ready RESTful API for managing financial records with **role-based access control**, **dashboard analytics**, and **comprehensive data validation**. Built with TypeScript, Express.js, Prisma ORM, and PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-green?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.5-purple?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Docker Setup](#-docker-setup)
- [API Documentation](#-api-documentation)
- [API Endpoints](#-api-endpoints)
- [Role-Based Access Control](#-role-based-access-control)
- [Database Schema](#-database-schema)
- [Seed Data](#-seed-data)
- [Environment Variables](#-environment-variables)
- [Design Decisions & Assumptions](#-design-decisions--assumptions)
- [Project Structure](#-project-structure)

---

## ✨ Features

### Core
- **User & Role Management** — Create, manage, and assign roles (Viewer/Analyst/Admin)
- **Financial Records CRUD** — Full create, read, update, soft-delete operations
- **Dashboard Analytics** — Summary, category breakdown, trends, and recent activity
- **Role-Based Access Control** — Middleware-enforced permission system

### Security
- **JWT Authentication** — Access + refresh token flow with configurable expiry
- **Password Hashing** — bcrypt with 12 salt rounds
- **Rate Limiting** — General (100 req/15min) + Auth-specific (20 req/15min)
- **Helmet** — Security headers via `helmet`
- **CORS** — Configurable cross-origin resource sharing
- **Input Validation** — Zod schemas with detailed field-level errors

### Data
- **Prisma ORM** — Type-safe database access with PostgreSQL
- **Soft Delete** — Financial records are soft-deleted (recoverable)
- **Advanced Filtering** — Filter by type, category, date range, amount range, text search
- **Pagination** — Consistent pagination with metadata (total, pages, hasNext, hasPrev)
- **Sorting** — Configurable sort field and order on all list endpoints

### Developer Experience
- **Swagger/OpenAPI** — Interactive API documentation at `/api/docs`
- **Winston Logging** — Structured logging to console + files
- **Docker Support** — One-command setup with `docker-compose`
- **TypeScript** — Full type safety across the entire codebase
- **Seed Script** — Pre-populate database with realistic sample data

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 20 | JavaScript runtime |
| **Language** | TypeScript 5.5 | Type safety |
| **Framework** | Express.js 4.21 | HTTP server & routing |
| **ORM** | Prisma 6.5 | Type-safe database access |
| **Database** | PostgreSQL 16 | Data persistence |
| **Auth** | jsonwebtoken | JWT token management |
| **Validation** | Zod | Schema validation |
| **Docs** | swagger-jsdoc + swagger-ui-express | API documentation |
| **Logging** | Winston | Structured logging |
| **Security** | Helmet, CORS, express-rate-limit | Request protection |
| **Container** | Docker + Docker Compose | Deployment |

---

## 🏗 Architecture

The backend follows a **clean layered architecture** with clear separation of concerns:

```
Request → Route → Middleware → Controller → Service → Prisma → PostgreSQL
                  (auth/rbac/    (HTTP      (business    (ORM)
                   validate)     handling)   logic)
```

**Key Design Principles:**
- **Routes** define endpoints and wire up middleware + controllers
- **Middleware** handles cross-cutting concerns (auth, RBAC, validation, errors)
- **Controllers** handle HTTP request/response — thin layer, no business logic
- **Services** contain all business logic and database operations
- **Utilities** provide shared helpers (error classes, response wrappers, async handler)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20)
- **PostgreSQL** 14+ running locally (or use Docker)
- **npm** 9+

### 1. Clone & Install

```bash
git clone https://github.com/your-username/finance-backend.git
cd finance-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secrets
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Seed the database with sample data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server starts at **http://localhost:3000**

- 📚 **API Docs**: http://localhost:3000/api/docs
- 🏥 **Health Check**: http://localhost:3000/health

---

## 🐳 Docker Setup

The easiest way to get everything running — no local PostgreSQL needed:

```bash
# Start PostgreSQL + API (builds from source)
docker-compose up -d --build

# Run migrations inside the container
docker-compose exec api npx prisma migrate deploy

# Seed the database
docker-compose exec api npx prisma db seed

# View logs
docker-compose logs -f api
```

**Stop everything:**
```bash
docker-compose down

# To also remove the database volume:
docker-compose down -v
```

---

## 📚 API Documentation

Interactive Swagger UI is available at:

```
http://localhost:3000/api/docs
```

OpenAPI JSON spec:
```
http://localhost:3000/api/docs.json
```

---

## 📡 API Endpoints

### Authentication `(/api/v1/auth)`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/register` | Register new user account | Public |
| `POST` | `/login` | Login & receive JWT tokens | Public |
| `POST` | `/refresh` | Refresh access token | Public |
| `GET` | `/me` | Get current user profile | Authenticated |

### User Management `(/api/v1/users)`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/` | List all users (paginated) | Admin |
| `GET` | `/:id` | Get user by ID | Admin |
| `PATCH` | `/:id/role` | Update user's role | Admin |
| `PATCH` | `/:id/status` | Activate/deactivate user | Admin |
| `DELETE` | `/:id` | Delete user (cascades) | Admin |

### Financial Records `(/api/v1/records)`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/` | Create financial record | Admin |
| `GET` | `/` | List records (filtered) | All roles |
| `GET` | `/:id` | Get record by ID | All roles |
| `PATCH` | `/:id` | Update record | Admin |
| `DELETE` | `/:id` | Soft delete record | Admin |

**Query Parameters for `GET /records`:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 10, max: 100) |
| `type` | string | Filter by `INCOME` or `EXPENSE` |
| `category` | string | Filter by category (e.g., `SALARY`, `FOOD`) |
| `startDate` | ISO date | Filter records on or after this date |
| `endDate` | ISO date | Filter records on or before this date |
| `minAmount` | number | Minimum amount filter |
| `maxAmount` | number | Maximum amount filter |
| `search` | string | Text search in description |
| `sortBy` | string | Sort field (`amount`, `date`, `type`, `category`, `createdAt`) |
| `sortOrder` | string | `asc` or `desc` |

### Dashboard `(/api/v1/dashboard)`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/summary` | Total income, expenses, net balance | Analyst, Admin |
| `GET` | `/category-breakdown` | Category-wise totals & percentages | Analyst, Admin |
| `GET` | `/trends` | Monthly/weekly income & expense trends | Analyst, Admin |
| `GET` | `/recent-activity` | Latest N financial records | Analyst, Admin |

---

## 🔐 Role-Based Access Control

The system enforces three roles with progressively increasing permissions:

| Action | Viewer | Analyst | Admin |
|--------|:------:|:-------:|:-----:|
| View own profile | ✅ | ✅ | ✅ |
| View financial records | ✅ | ✅ | ✅ |
| Access dashboard analytics | ❌ | ✅ | ✅ |
| Access trends & insights | ❌ | ✅ | ✅ |
| Create financial records | ❌ | ❌ | ✅ |
| Update financial records | ❌ | ❌ | ✅ |
| Delete financial records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

**Implementation:** RBAC is enforced at the middleware level using an `authorize()` factory function that checks `req.user.role` against allowed roles. Unauthorized requests receive a `403 Forbidden` response with a clear error message.

---

## 🗄 Database Schema

### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | User's full name |
| `email` | String | Unique email address |
| `password` | String | bcrypt-hashed password |
| `role` | Enum | `VIEWER`, `ANALYST`, or `ADMIN` |
| `status` | Enum | `ACTIVE` or `INACTIVE` |
| `createdAt` | DateTime | Account creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### Financial Record

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `amount` | Float | Transaction amount (positive) |
| `type` | Enum | `INCOME` or `EXPENSE` |
| `category` | Enum | One of 16 categories (see below) |
| `date` | DateTime | Transaction date |
| `description` | String? | Optional description |
| `isDeleted` | Boolean | Soft delete flag (default: false) |
| `userId` | UUID | FK → User |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Available Categories:** `SALARY`, `FREELANCE`, `INVESTMENT`, `BUSINESS`, `RENTAL`, `FOOD`, `TRANSPORTATION`, `UTILITIES`, `ENTERTAINMENT`, `HEALTHCARE`, `EDUCATION`, `SHOPPING`, `TRAVEL`, `INSURANCE`, `TAXES`, `OTHER`

---

## 🌱 Seed Data

Run `npm run seed` to populate the database with:

- **4 Users** with different roles:
  | Email | Role | Password |
  |-------|------|----------|
  | admin@finance.app | ADMIN | Password123! |
  | analyst@finance.app | ANALYST | Password123! |
  | viewer@finance.app | VIEWER | Password123! |
  | inactive@finance.app | VIEWER (Inactive) | Password123! |

- **37 Financial Records** spanning ~2 months including:
  - Salary payments, freelance income, investments, rental income
  - Food, transportation, utilities, entertainment, healthcare, education expenses
  - Shopping, travel, insurance, taxes, and miscellaneous entries

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret for access tokens | — |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | — |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |

---

## 💡 Design Decisions & Assumptions

### Architecture Choices

1. **Layered Architecture** — Routes → Controllers → Services → Prisma. Controllers stay thin (HTTP only), services contain all business logic. This makes the codebase testable and maintainable.

2. **Prisma over raw SQL** — Provides type-safe database access, auto-generated migrations, and a schema-as-code approach that serves as living documentation.

3. **PostgreSQL over MongoDB** — Relational database is a better fit for financial data that benefits from ACID transactions, strict schemas, and efficient aggregation queries.

4. **JWT Access + Refresh Token Pattern** — Short-lived access tokens (15 min) with long-lived refresh tokens (7 days) balance security with user experience.

5. **Soft Delete for Records** — Financial records use soft delete (`isDeleted` flag) to preserve audit trails. The flag is automatically filtered in queries.

### Assumptions

1. **All users can view all records** — In a real multi-tenant system, you'd scope records to the user's organization. Here, all authenticated users can see all non-deleted records.

2. **Admin can register users with any role** — The registration endpoint accepts a role parameter for seeding purposes. In production, you'd restrict this to admin-only user creation.

3. **No multi-tenancy** — The system assumes a single organization. Dashboard analytics aggregate across all users' records.

4. **Categories are predefined** — A fixed enum of 16 categories covers common use cases. A production system might allow custom categories.

5. **Amount is always positive** — The `type` field (INCOME/EXPENSE) determines the financial direction. Amounts are always stored as positive numbers.

### Tradeoffs

1. **Zod over class-validator** — Zod is more TypeScript-native and allows schema inference for types, reducing duplication. Tradeoff: slightly less mature ecosystem for NestJS-style decorators.

2. **No separate DTO layer** — Prisma's generated types + Zod inferred types serve as DTOs, keeping the codebase lean. A larger application might benefit from explicit DTO classes.

3. **In-memory rate limiting** — Uses `express-rate-limit` without external store (no Redis). Works well for single-instance deployments but would need Redis for horizontal scaling.

---

## 📁 Project Structure

```
finance-backend/
├── prisma/
│   ├── schema.prisma          # Database schema & models
│   └── seed.ts                # Database seed script
├── src/
│   ├── config/
│   │   ├── constants.ts       # App-wide enums & constants
│   │   ├── database.ts        # Prisma client & connection
│   │   ├── environment.ts     # Env variable validation (Zod)
│   │   └── swagger.ts         # OpenAPI/Swagger configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── record.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── rateLimiter.middleware.ts
│   │   ├── rbac.middleware.ts      # Role authorization
│   │   └── validate.middleware.ts  # Zod validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── record.routes.ts
│   │   └── user.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── record.service.ts
│   │   └── user.service.ts
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces
│   ├── utils/
│   │   ├── ApiError.ts        # Custom error class
│   │   ├── ApiResponse.ts     # Response wrapper
│   │   ├── asyncHandler.ts    # Async error catcher
│   │   └── logger.ts          # Winston logger
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── dashboard.validator.ts
│   │   ├── record.validator.ts
│   │   └── user.validator.ts
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment template
├── .gitignore
├── .prettierrc
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Multi-stage build
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📝 API Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Records retrieved",
  "data": [ ... ],
  "meta": {
    "pagination": {
      "total": 37,
      "page": 1,
      "limit": 10,
      "totalPages": 4,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "amount": ["Amount must be greater than 0"],
    "type": ["Type must be either INCOME or EXPENSE"]
  }
}
```

---

## 📄 License

MIT — See [LICENSE](LICENSE) for details.

---

**Built with ❤️ by Vaibhav Mishra**
