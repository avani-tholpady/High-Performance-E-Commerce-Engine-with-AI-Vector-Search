# 🚀 High-Performance E-Commerce Engine with AI Vector Search

A scalable MERN-based e-commerce backend designed to deliver ultra-fast product retrieval using **Redis caching** and **MongoDB Vector Search**. The project aims to provide intelligent semantic product search while reducing database load and improving response times.

---

## 📖 Project Overview

Traditional text-based product searches often fail to understand user intent and can overload the database during high-traffic periods. This project addresses these challenges by integrating Redis for caching and MongoDB Vector Search for AI-powered semantic search.

The goal is to build a high-performance product catalog with an admin dashboard that efficiently manages products while maintaining fast response times.

---

## ✨ Features

### Week 1
- Backend project setup using Express.js
- MongoDB database configuration
- Environment variable configuration
- Express server initialization
- Health Check API
- Project folder structure

### Upcoming Features

#### Week 2
- Redis Cache Integration
- Cache-Aside Pattern
- Cache Invalidation

#### Week 3
- MongoDB Vector Search
- AI Semantic Product Search
- Advanced Mongoose Queries
- Aggregation Pipelines

#### Week 4
- React Admin Dashboard
- Product Management
- GitHub Actions CI/CD
- Automated Testing

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Dotenv
- CORS

### Database
- MongoDB Atlas

### Frontend (Upcoming)
- React.js
- Vite

### Cache (Upcoming)
- Redis

---

## 📂 Project Structure

```
backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/avani-tholpady/High-Performance-E-Commerce-Engine-with-AI-Vector-Search.git
```

Move into the backend directory

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Run the development server

```bash
npm run dev
```

---

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

Response

```json
{
  "success": true,
  "message": "Server is running successfully"
}
```

---

## 🎯 Objective

Build a production-ready, high-performance e-commerce engine capable of:

- Fast product retrieval
- Reduced database load
- AI-powered semantic search
- Efficient caching using Redis
- Scalable architecture
- Modern admin dashboard

---

## 📄 License

This project is developed as part of an internship at **Infotact Solutions & Co.**
