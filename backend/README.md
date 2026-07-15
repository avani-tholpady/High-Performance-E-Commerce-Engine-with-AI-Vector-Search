# High-Performance E-Commerce Engine with AI Vector Search - Backend

## Overview

The backend of the **High-Performance E-Commerce Engine with AI Vector Search** is built using **Node.js**, **Express.js**, and **MongoDB Atlas**. It provides the foundation for product management, API services, and future AI-powered semantic search. The project follows a modular architecture to ensure scalability, maintainability, and ease of development.

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
- Constants configuration implemented
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
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── notFound.js
│   ├── utils/
│   │   └── apiResponse.js
│   ├── app.js
│   └── server.js
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

## API Endpoint

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

The backend currently includes the following middleware:

- CORS Middleware
- Express JSON Parser
- Request Logger Middleware
- Centralized 404 Not Found Middleware
- Global Error Handler Middleware

---

## Request Logger

The logger middleware records every incoming request to the backend.

Example:

```text
GET /api/health
GET /products
POST /products
```

This helps monitor API requests during development and debugging.

---

## API Response Utility

A reusable API response utility is used to maintain consistent response formats throughout the application.

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

## Configuration

The backend uses:

- Centralized MongoDB configuration
- Environment variable management using `dotenv`
- Centralized constants configuration
- Modular middleware architecture
- Standardized API responses
- Request logging for debugging

---

## Current Features

- Express.js backend server
- MongoDB Atlas connectivity
- Environment configuration
- Health Check API
- Centralized error handling
- Request logging
- Standardized API responses
- Modular project structure

---

## Future Enhancements

- Product Management Module
- Product CRUD APIs
- Product Search and Filtering
- Redis Caching
- MongoDB Vector Search
- AI-powered Semantic Search
- Authentication & Authorization
- Order Management
- Shopping Cart APIs

---

## Author

**Backend Developer:** Avani  
**Project:** High-Performance E-Commerce Engine with AI Vector Search
