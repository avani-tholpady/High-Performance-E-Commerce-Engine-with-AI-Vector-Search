# High-Performance E-Commerce Engine with AI Vector Search

A scalable e-commerce backend designed to support fast product retrieval, caching, and AI-powered semantic search.

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv
- CORS
- Nodemon

## Current Progress

### Week 1

- Backend project initialized
- Express server configured
- MongoDB Atlas connected
- Environment variables configured
- Health Check API implemented
- Centralized 404 Not Found middleware added
- Centralized Error Handler middleware added
- Constants configuration implemented
- Backend documentation completed

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
│   │   └── notFound.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/avani-tholpady/High-Performance-E-Commerce-Engine-with-AI-Vector-Search.git
```

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the development server:

```bash
npm run dev
```

## API Endpoint

### Health Check

**GET** `/api/health`

Example Response:

```json
{
  "success": true,
  "message": "Server is running successfully"
}
```

## Middleware

- CORS Middleware
- Express JSON Middleware
- Centralized 404 Not Found Middleware
- Centralized Error Handler Middleware

## Configuration

The backend uses:

- MongoDB Atlas for database connectivity
- Environment variable management using `dotenv`
- Centralized constants configuration
- Modular project structure for scalability
