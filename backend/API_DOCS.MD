# 📡 Product API Documentation

**Base URL:** `http://localhost:5000/api`

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products with search, filter, sort, pagination |
| GET | `/products/:id` | Get a single product by ID |
| POST | `/products` | Create a new product |
| PUT | `/products/:id` | Update an existing product |
| DELETE | `/products/:id` | Soft delete a product |
| GET | `/products/meta/categories` | Get distinct categories and active product counts |
| GET | `/products/meta/brands` | Get distinct brands and active product counts |
| GET | `/products/meta/price-range` | Get price range for active products |
| GET | `/products/ai-search` | AI-powered vector search for products |
| POST | `/orders` | Create a new checkout order (Protected) |
| GET | `/orders` | Retrieve authenticated user's orders (Protected) |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user and retrieve JWT token |

---

## GET /api/products

Returns a paginated list of active products.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | Search in name, brand, description |
| `category` | string | — | Filter by exact category path |
| `minPrice` | number | — | Minimum price |
| `maxPrice` | number | — | Maximum price |
| `sort` | string | `createdAt:desc` | Format: `field:asc` or `field:desc` |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max 100) |

### Available Categories

| Category |
|----------|
| `electronics/computers` |
| `home/furniture` |
| `accessories/watches` |
| `fashion/mens-clothing` |
| `fashion/footwear` |
| `books/non-fiction` |
| `beauty/skincare` |
| `sports/exercise-gear` |

### Example Requests

```
GET /api/products
GET /api/products?page=1&limit=5
GET /api/products?search=samsung
GET /api/products?category=electronics/computers
GET /api/products?minPrice=50&maxPrice=500
GET /api/products?sort=price:asc
GET /api/products?sort=price:desc
GET /api/products?search=samsung&category=electronics/computers&minPrice=10&maxPrice=2000&sort=price:asc&page=1&limit=3
```

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "6a591d35125209c00b5aef88",
      "name": "Samsung Classic Monitor",
      "slug": "samsung-classic-monitor-1113",
      "sku": "ELE-COM-001113",
      "description": "The brand new Samsung Classic Monitor from Samsung...",
      "price": 50.73,
      "compareAtPrice": 65.98,
      "category": "electronics/computers",
      "brand": "Samsung",
      "images": [
        "https://assets.ecommerce.com/products/electronics/computers/image-1113-1.jpg",
        "https://assets.ecommerce.com/products/electronics/computers/image-1113-2.jpg"
      ],
      "stock": 381,
      "tags": ["electronics", "computers", "samsung"],
      "ratings": { "average": 4.7, "count": 919 },
      "isActive": true,
      "createdAt": "2026-07-16T18:04:37.122Z",
      "updatedAt": "2026-07-16T18:04:37.122Z"
    }
  ],
  "meta": {
    "totalDocs": 1150,
    "limit": 10,
    "page": 1,
    "totalPages": 115,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

---

## GET /api/products/:id

Returns a single product by MongoDB ObjectId.

### Example

```
GET /api/products/6a591d35125209c00b5aef88
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "6a591d35125209c00b5aef88",
    "name": "Samsung Classic Monitor",
    "slug": "samsung-classic-monitor-1113",
    "sku": "ELE-COM-001113",
    "description": "The brand new Samsung Classic Monitor from Samsung...",
    "price": 50.73,
    "compareAtPrice": 65.98,
    "category": "electronics/computers",
    "brand": "Samsung",
    "images": ["https://assets.ecommerce.com/products/..."],
    "stock": 381,
    "tags": ["electronics", "computers", "samsung"],
    "ratings": { "average": 4.7, "count": 919 },
    "isActive": true,
    "createdAt": "2026-07-16T18:04:37.122Z",
    "updatedAt": "2026-07-16T18:04:37.122Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | INVALID_ID_FORMAT | Invalid MongoDB ObjectId |
| 404 | RESOURCE_NOT_FOUND | Product not found or inactive |

---

## POST /api/products

Creates a new product.

### Request Body

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | 1–150 characters |
| `sku` | string | Yes | Uppercase A-Z, 0-9, hyphens. 3–30 chars. Unique. |
| `description` | string | Yes | 10–5000 characters |
| `price` | number | Yes | ≥ 0 |
| `category` | string | Yes | Lowercase, forward slash separated |
| `brand` | string | Yes | 1–100 characters |
| `images` | array of URLs | Yes | At least 1 valid HTTP/HTTPS URL |
| `stock` | integer | Yes | ≥ 0 |
| `slug` | string | No | Auto-generated from name if missing |
| `compareAtPrice` | number | No | Must be greater than `price` |
| `tags` | array of strings | No | — |
| `ratings` | object | No | `{ average: 0–5, count: integer ≥ 0 }` |

### Example Request

```json
{
  "name": "Galaxy S24 Ultra",
  "sku": "SAM-GS24U-256",
  "description": "Samsung flagship smartphone with AI features.",
  "price": 1199.99,
  "compareAtPrice": 1299.99,
  "category": "electronics/mobile",
  "brand": "Samsung",
  "images": ["https://example.com/img.jpg"],
  "stock": 45,
  "tags": ["smartphone", "flagship"],
  "ratings": { "average": 4.5, "count": 120 }
}
```

### Success Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "6a591d35125209c00b5af00",
    "name": "Galaxy S24 Ultra",
    "slug": "galaxy-s24-ultra",
    "sku": "SAM-GS24U-256",
    "price": 1199.99,
    "compareAtPrice": 1299.99,
    "category": "electronics/mobile",
    "brand": "Samsung",
    "images": ["https://example.com/img.jpg"],
    "stock": 45,
    "tags": ["smartphone", "flagship"],
    "ratings": { "average": 4.5, "count": 120 },
    "isActive": true,
    "createdAt": "2026-07-17T10:30:00.000Z",
    "updatedAt": "2026-07-17T10:30:00.000Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_FAILED | Missing required fields or invalid values |
| 409 | RESOURCE_ALREADY_EXISTS | Duplicate SKU or slug |

---

## PUT /api/products/:id

Updates an existing product. Only send fields you want to change.

### Rules
- All fields are optional
- Duplicate SKU/slug check excludes the current product
- `compareAtPrice` must be > `price`

### Example Request

```json
{
  "price": 39.99,
  "stock": 500
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "6a591d35125209c00b5aef88",
    "name": "Samsung Classic Monitor",
    "price": 39.99,
    "stock": 500,
    "...other unchanged fields..."
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | INVALID_ID_FORMAT | Invalid MongoDB ObjectId |
| 400 | VALIDATION_FAILED | Invalid field values |
| 404 | RESOURCE_NOT_FOUND | Product not found or inactive |
| 409 | RESOURCE_ALREADY_EXISTS | SKU or slug already taken |

---

## DELETE /api/products/:id

Soft deletes a product by setting `isActive: false`.

### Example

```
DELETE /api/products/6a591d35125209c00b5aef88
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "message": "Product with ID '6a591d35125209c00b5aef88' has been successfully deactivated."
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | INVALID_ID_FORMAT | Invalid MongoDB ObjectId |
| 404 | RESOURCE_NOT_FOUND | Product not found or already inactive |

---

## GET /api/products/meta/categories

Returns distinct categories along with active product counts for each category, sorted alphabetically.

### Example Request

```
GET /api/products/meta/categories
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "name": "accessories/watches",
      "count": 42
    },
    {
      "name": "electronics/computers",
      "count": 128
    }
  ]
}
```

---

## GET /api/products/meta/brands

Returns distinct brands along with active product counts for each brand, sorted alphabetically.

### Example Request

```
GET /api/products/meta/brands
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Brands retrieved successfully",
  "data": [
    {
      "name": "Apple",
      "count": 56
    },
    {
      "name": "Samsung",
      "count": 78
    }
  ]
}
```

---

## GET /api/products/meta/price-range

Returns the minimum and maximum price across all active products.

### Example Request

```
GET /api/products/meta/price-range
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Price range retrieved successfully",
  "data": {
    "minPrice": 5.99,
    "maxPrice": 1299.99
  }
}
```

---

## GET /api/products/ai-search

Performs an AI-powered vector search across active products.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | The natural language search term or phrase |

### Example Request

```
GET /api/products/ai-search?query=wireless bluetooth noise cancelling headphones
```

### Success Response (200)

```json
{
  "success": true,
  "results": [
    {
      "_id": "64b0f9f3c1b0c03d1c9ef002",
      "name": "Sony WH-1000XM5 Wireless Headphones",
      "brand": "Sony",
      "category": "Electronics",
      "description": "Industry leading noise canceling wireless over-ear headphones with Alexa voice control.",
      "price": 398.00,
      "embedding": [0.015, -0.034, 0.089, ...],
      "isActive": true
    }
  ]
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | BAD_REQUEST | Search query parameter is missing |

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": []
  }
}
```

### Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_FAILED | 400 | Invalid or missing fields in request |
| INVALID_ID_FORMAT | 400 | Malformed MongoDB ObjectId |
| RESOURCE_NOT_FOUND | 404 | Product doesn't exist or is inactive |
| RESOURCE_ALREADY_EXISTS | 409 | Duplicate SKU or slug |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

---

## Pagination Meta Object

All `GET /api/products` responses include a `meta` object:

```json
{
  "totalDocs": 1150,
  "limit": 10,
  "page": 1,
  "totalPages": 115,
  "hasNextPage": true,
  "hasPrevPage": false,
  "nextPage": 2,
  "prevPage": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| totalDocs | number | Total matching products |
| limit | number | Items per page |
| page | number | Current page number |
| totalPages | number | Total pages |
| hasNextPage | boolean | Is there a next page? |
| hasPrevPage | boolean | Is there a previous page? |
| nextPage | number or null | Next page number |
| prevPage | number or null | Previous page number |

---

## Product Object Reference

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | MongoDB unique identifier |
| name | string | Product display name |
| slug | string | URL-safe identifier (auto-generated) |
| sku | string | Stock Keeping Unit (unique) |
| description | string | Full product description |
| price | number | Current selling price |
| compareAtPrice | number or null | Original price for discount display |
| category | string | Hierarchical category path |
| brand | string | Brand name |
| images | string[] | Array of product image URLs |
| stock | integer | Available inventory count |
| tags | string[] | Product tags for filtering |
| ratings.average | number | Average rating (0.0 – 5.0) |
| ratings.count | integer | Total number of ratings |
| isActive | boolean | false = soft-deleted |
| createdAt | ISO date | Creation timestamp |
| updatedAt | ISO date | Last update timestamp |

---

# 🛒 Order API Documentation (Authenticated)

**Note**: All Order endpoints require authentication. Pass the Authorization header:
`Authorization: Bearer <token>`

## POST /api/orders

Creates a new checkout order for the authenticated user. User ID is extracted automatically from the authentication token.

### Headers
* `Authorization: Bearer <token>` (Required)
* `Content-Type: application/json`

### Request Body

```json
{
  "items": [
    {
      "product": "64b0f9f3c1b0c03d1c9ef002",
      "quantity": 2
    }
  ],
  "status": "Pending"
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "669999999999999999999999",
    "user": "64b0f9f3c1b0c03d1c9ef001",
    "items": [
      {
        "product": {
          "_id": "64b0f9f3c1b0c03d1c9ef002",
          "name": "Sony WH-1000XM5 Wireless Headphones",
          "price": 398.00
        },
        "quantity": 2
      }
    ],
    "totalAmount": 796.00,
    "status": "Pending",
    "createdAt": "2026-07-21T15:30:00.000Z",
    "updatedAt": "2026-07-21T15:30:00.000Z"
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 401 | UNAUTHORIZED | Authentication header missing or invalid |
| 400 | VALIDATION_FAILED | Invalid order payload or missing fields |
| 404 | RESOURCE_NOT_FOUND | One or more items refer to non-existent/inactive product |

---

## GET /api/orders

Returns a list of all orders belonging strictly to the authenticated user, sorted newest first.

### Headers
* `Authorization: Bearer <token>` (Required)

### Success Response (200)

```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "_id": "669999999999999999999999",
      "user": "64b0f9f3c1b0c03d1c9ef001",
      "items": [
        {
          "product": {
            "_id": "64b0f9f3c1b0c03d1c9ef002",
            "name": "Sony WH-1000XM5 Wireless Headphones",
            "price": 398.00
          },
          "quantity": 2
        }
      ],
      "totalAmount": 796.00,
      "status": "Pending",
      "createdAt": "2026-07-21T15:30:00.000Z",
      "updatedAt": "2026-07-21T15:30:00.000Z"
    }
  ]
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 401 | UNAUTHORIZED | Authentication header missing or invalid |

---

# 🔐 Authentication API Documentation

## POST /api/auth/register

Registers a new user and generates a JWT token.

### Headers
* `Content-Type: application/json`

### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "securepassword123"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64b0f9f3c1b0c03d1c9ef005",
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    }
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_FAILED | Invalid email, name too short, password too short |
| 409 | RESOURCE_ALREADY_EXISTS | Email already registered |

---

## POST /api/auth/login

Logs in an existing user and returns a JWT token.

### Headers
* `Content-Type: application/json`

### Request Body
```json
{
  "email": "jane.doe@example.com",
  "password": "securepassword123"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64b0f9f3c1b0c03d1c9ef005",
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    }
  }
}
```

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_FAILED | Missing email or password |
| 401 | UNAUTHORIZED | Invalid email or password |

---


---

