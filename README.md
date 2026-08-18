<div align="center">

# 🔗 BizLink — Backend API

### Custom REST API + Realtime Server for the BizLink B2B Platform

**A Node.js/Express/TypeScript backend with JWT authentication, Prisma/PostgreSQL, and a Socket.io realtime layer — built from scratch to power the [BizLink](https://bizlink-two.vercel.app/) frontend.**

[![Live API](https://img.shields.io/badge/🚀_Live_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 🎯 What is this?

This is the backend API for **BizLink**, a B2B platform connecting wholesalers and retailers. It was built entirely from scratch — no backend-as-a-service — to have full control over authentication, authorization, and the realtime layer that powers live inventory updates on the frontend.

The [frontend repo](https://github.com/priyanshu101120/Bizlink) consumes this API over REST and connects to it via WebSocket for realtime events.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

- Custom **JWT access + refresh token** auth — no third-party auth provider
- Tokens delivered as **httpOnly, secure cookies** (never touched by client-side JS, immune to XSS token theft)
- **bcrypt** password hashing
- Refresh tokens are stored server-side and revoked on logout, password change, or account deletion
- **Role-based access control** (`WHOLESALER` / `RETAILER`) enforced via middleware on every protected route
- Full account lifecycle: register, login, refresh, logout, change password, permanent account deletion (with cascading cleanup of owned data)

### ⚡ Realtime Layer (Socket.io)

- Socket.io server authenticated using the **same JWT cookie** as the REST API — no separate realtime token issuance
- Wholesalers join a room keyed to their own user ID; retailers join the rooms of every wholesaler they're connected to
- Product create/update events broadcast instantly (`product:update`)
- Automatic **low-stock alerts** (`product:low-stock`) pushed the moment inventory crosses a threshold

### 📦 Domain Modules

- **Products** — wholesaler-owned inventory, full CRUD, role-restricted to `WHOLESALER`
- **Connections** — either role can initiate a wholesaler↔retailer link; both sides can view or remove it
- **Users** — lookup endpoints so each role can discover who they can connect with

### 🛡️ Validation & Error Handling

- Every request body validated with **Zod** before it reaches business logic
- Centralized error handler with a typed `ApiError` class for consistent HTTP status codes and messages

---

## 🛠️ Tech Stack

| Layer            | Technology                   | Purpose                                          |
| ----------------- | ------------------------------ | -------------------------------------------------- |
| **Runtime**        | Node.js + TypeScript           | Type-safe server code                                |
| **Framework**      | Express                        | HTTP routing and middleware                          |
| **Database**       | PostgreSQL (Neon, serverless)  | Primary data store                                   |
| **ORM**            | Prisma                         | Schema, migrations, type-safe queries                |
| **Auth**           | JWT (`jsonwebtoken`) + `bcryptjs` | Token issuance/verification, password hashing      |
| **Realtime**       | Socket.io                      | WebSocket server, room-based broadcast                |
| **Validation**     | Zod                             | Runtime request schema validation                     |
| **Cookies**        | `cookie-parser`                 | Parsing httpOnly auth cookies                          |
| **Deployment**     | Render                          | Hosting for the API + Socket.io server                 |

---

## 🏗️ Architecture

```
src/
├── config/            # env loader, Prisma client singleton
├── controllers/        # HTTP layer — parses req, calls services, shapes responses
│   ├── auth.controller.ts
│   ├── product.controller.ts
│   ├── connection.controller.ts
│   └── user.controller.ts
├── services/            # Business logic
│   ├── auth.service.ts
│   ├── product.service.ts
│   └── connection.service.ts
├── repositories/         # Prisma data-access layer (one per model)
├── middlewares/
│   ├── auth.middleware.ts     # requireAuth, requireRole
│   ├── validate.middleware.ts # Zod-driven body validation
│   └── error.middleware.ts    # Centralized error handler
├── routes/               # Express routers, wired in routes/index.ts
├── socket/
│   └── io.ts               # Socket.io server, JWT-authenticated handshake, room logic
├── utils/
│   ├── jwt.ts                # sign/verify access & refresh tokens
│   └── cookies.ts            # httpOnly cookie helpers
├── validators/            # Zod schemas per domain
├── app.ts                  # Express app, middleware wiring
└── server.ts                # HTTP server bootstrap + Socket.io init

prisma/
└── schema.prisma            # User, Product, Connection models with cascade deletes
```

### Request lifecycle

```
Client → CORS → JSON/cookie parsing → route → requireAuth → requireRole
       → Zod validate → controller → service → repository (Prisma) → response
```

### Auth flow

1. Register/login issues a 15-minute **access token** and a 7-day **refresh token**, both as httpOnly cookies (`accessToken` scoped to `/`, `refreshToken` scoped to `/api/auth/refresh`).
2. `requireAuth` verifies the access token on every protected route and attaches `{ userId, role }` to `req.user`.
3. When the access token expires, the client calls `/auth/refresh`; the server checks the refresh token against the one stored on the user record and issues a fresh pair.
4. Logout, password change, and account deletion all clear cookies and null out the stored refresh token — invalidating any existing session immediately.

### Realtime flow

1. On Socket.io connection, the handshake's `cookie` header is parsed and the `accessToken` is verified the same way the REST middleware verifies it.
2. Wholesalers auto-join `wholesaler:<their-id>`; retailers explicitly join the rooms of wholesalers they're connected to via a `join-wholesaler-rooms` event.
3. `productService.create`/`update` emit `product:update` (and `product:low-stock` when relevant) into the wholesaler's room after every write.

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Route              | Auth | Description                          |
| ------ | ------------------- | ---- | -------------------------------------- |
| POST   | `/register`          | —    | Create an account (role selected at signup) |
| POST   | `/login`              | —    | Log in, issues auth cookies              |
| POST   | `/refresh`            | —    | Rotate access token via refresh cookie   |
| POST   | `/logout`             | ✅   | Clear cookies, revoke refresh token       |
| GET    | `/me`                 | ✅   | Get the current user's profile             |
| PUT    | `/change-password`    | ✅   | Change password, forces re-login           |
| DELETE | `/account`            | ✅   | Permanently delete account + owned data     |

### Products — `/api/products`

| Method | Route         | Auth              | Description                              |
| ------ | -------------- | ------------------ | ------------------------------------------- |
| POST   | `/`             | ✅ WHOLESALER      | Create a product                              |
| GET    | `/mine`         | ✅ WHOLESALER      | List the wholesaler's own products             |
| PUT    | `/:id`          | ✅ WHOLESALER      | Update a product (ownership-checked)            |
| DELETE | `/:id`          | ✅ WHOLESALER      | Delete a product (ownership-checked)             |
| GET    | `/connected`    | ✅ RETAILER        | List products from all connected wholesalers      |

### Connections — `/api/connections`

| Method | Route  | Auth | Description                                   |
| ------ | ------ | ---- | ------------------------------------------------ |
| POST   | `/`     | ✅   | Create a connection to another user                |
| GET    | `/mine` | ✅   | List the current user's connections                 |
| DELETE | `/:id`  | ✅   | Remove a connection (must be a party to it)           |

### Users — `/api/users`

| Method | Route          | Auth              | Description                        |
| ------ | --------------- | ------------------ | -------------------------------------- |
| GET    | `/retailers`     | ✅ WHOLESALER      | List all retailers (to connect with)     |
| GET    | `/wholesalers`   | ✅ RETAILER        | List all wholesalers (to connect with)    |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works well)

### 1. Clone and install

```bash
git clone https://github.com/priyanshu101120/bizlink-backend.git
cd bizlink-backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host/db
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:3000
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

The API is now live at `http://localhost:5000`, with a health check at `GET /health`.

---

## 🧠 What I Learned

Building this backend from scratch — and taking it all the way to a separately-hosted production deployment — was the core of this project's learning:

- **JWT auth design** — access/refresh rotation, httpOnly cookie security, and why token expiry needs to be handled silently on the client rather than surfaced as an error
- **Cookie scoping** — `path`, `sameSite`, and `secure` attributes matter far more than they seem to locally; a missing `path` or the wrong `sameSite` value silently breaks auth only once frontend and backend live on different domains
- **Authenticating WebSockets** — reusing the REST API's JWT cookie for the Socket.io handshake instead of building a parallel auth system
- **Prisma relations** — using `onDelete: Cascade` so account deletion cleanly removes dependent products/connections without manual cleanup code
- **Production deploy debugging** — diagnosing `NODE_ENV=production` stripping devDependencies out of the build, TypeScript version/`moduleResolution` mismatches between local and CI, and CORS origin mismatches (`http` vs `https`) across two separately hosted services

---

## 🔮 Roadmap

- [ ] Order/reorder endpoints between retailers and wholesalers
- [ ] Per-product configurable low-stock threshold
- [ ] Rate limiting on auth endpoints
- [ ] Automated tests (Jest + Supertest)
- [ ] OpenAPI/Swagger documentation

---

## 👤 Author

**Priyanshu Singh** — Built this end-to-end as a solo developer.

[![GitHub](https://img.shields.io/badge/GitHub-priyanshu101120-181717?style=for-the-badge&logo=github)](https://github.com/priyanshu101120)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Priyanshu_Singh-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/priyanshu-singh-452459360/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**⭐ If you found this project interesting, please give it a star!**

_Built with ❤️ using Node.js, Express, Prisma, and Socket.io_

</div>
