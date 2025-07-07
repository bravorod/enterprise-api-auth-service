# Secure API Backend

A secure and scalable Node.js backend application providing RESTful APIs with full authentication, authorization, and database connectivity. Built with Express, MongoDB, and JSON Web Tokens (JWT), this backend is designed to support full-stack web applications requiring protected user data and role-based access control.

---

## Features

- Full RESTful API architecture
- JWT-based authentication and authorization
- CRUD operations on protected resources
- Secure password hashing with bcrypt
- Cookie-based token storage (HTTP-only)
- User role management and protected routes
- Modular routing and middleware structure
- Schema-based data modeling using Mongoose
- API tested with Postman

---

## Technologies Used

- **Node.js** – Server runtime environment
- **Express.js** – HTTP routing and middleware
- **MongoDB** – NoSQL database
- **Mongoose** – Object Data Modeling (ODM)
- **JWT (jsonwebtoken)** – Stateless authentication
- **bcryptjs** – Secure password hashing
- **Postman** – API testing and validation

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance
- Postman

### Installation

```bash
git clone https://github.com/bravorod/secure-api-backend.git
cd secure-api-backend
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mydatabase
JWT_SECRET=your_jwt_secret_key
COOKIE_EXPIRE_DAYS=7
```

---

## Running the Server

```bash
npm start
```

---

## Endpoints

* `POST /api/auth/register` – Register a new user
* `POST /api/auth/login` – Authenticate user and return JWT
* `GET /api/users/me` – Get current authenticated user
* `GET /api/data` – Access protected resource

All protected routes require a valid JWT token (sent via HTTP-only cookie or Authorization header).

---

## Testing

All routes are fully testable via Postman.

---

## License

This project is licensed under the MIT License.
