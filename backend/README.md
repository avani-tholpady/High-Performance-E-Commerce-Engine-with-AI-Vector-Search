# High-Performance E-Commerce Engine with AI Vector Search - Backend

## Overview

This backend is built using **Node.js**, **Express.js**, and **MongoDB Atlas**. It provides the foundation for product management APIs, caching integration, and future AI-powered semantic product search. The project follows a modular architecture to ensure scalability, maintainability, and clean code organization.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv
- CORS
- Nodemon

---

## Current Progress

### Week 1

- Backend project initialized
- Express server configured
- MongoDB Atlas connected
- Environment variables configured
- Health Check API implemented
- Centralized 404 Not Found middleware added
- Centralized Global Error Handler middleware added
- Request Logger middleware implemented
- Reusable API Response utility added
- Centralized constants configuration added
- Backend documentation completed
- Backend project structure organized

---

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── constants/
│   │   └── constants.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── notFound.js
│   ├── models/
│   ├── routes/
│   ├── utils/
│   │   └── apiResponse.js
│   ├── app.js
│   └── server.js
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/avani-tholpady/High-Performance-E-Commerce-Engine-with-AI-Vector-Search.git
```

### Navigate to the backend directory

```bash
cd backend
```

### Install dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### Start the development server

```bash
npm run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Backend server port |
| MONGO_URI | MongoDB Atlas connection string |

---

## Available API

### Health Check

**GET** `/api/health`

Example Response

```json
{
  "success": true,
  "message": "Server is running successfully",
  "data": null
}
```

---

## Middleware

The backend currently includes:

- CORS Middleware
- Express JSON Middleware
- Request Logger Middleware
- Centralized 404 Not Found Middleware
- Centralized Global Error Handler Middleware

---

## Request Logger

The request logger records every incoming API request for easier debugging.

Example:

```text
GET /api/health
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

---

## API Response Utility

The backend uses reusable response helper functions to maintain a consistent API response format.

### Success Response

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

## Features Completed

- Express.js server setup
- MongoDB Atlas connection
- Environment configuration
- Health Check API
- Request Logger Middleware
- Global Error Handler
- 404 Not Found Middleware
- Standardized API responses
- Centralized constants
- Modular folder structure

---

## Planned Features

- Product Management Module
- Product CRUD APIs
- Product Search
- Product Filtering
- Product Sorting
- Product Pagination
- Redis Cache Integration
- MongoDB Vector Search
- AI-powered Semantic Search
- Authentication & Authorization
- Order Management

---

## Author

**Backend Developer:** Avani

**Project:** High-Performance E-Commerce Engine with AI Vector Search