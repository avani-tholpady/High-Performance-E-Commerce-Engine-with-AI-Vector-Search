# Product Management Module: Schema Design & API Contract

**Author**: Senior Backend Engineer  
**Status**: Proposal for Review  
**Target Branch**: `urvi`  
**Associated Issue**: GitHub Issue #1: "Design Product Module Schema and REST API Contract"

---

## 1. Product Entity Schema Design

The Product entity is designed to support high-performance operations, flexible catalog structures, and seamless integration with **Redis Cache-Aside** patterns and **MongoDB Atlas Vector Search** for semantic querying.

### Database: MongoDB / Mongoose Schema Definition

| Field Name | Data Type | Required | Unique / Index | Validation Rules | Description / Purpose |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `_id` | `ObjectId` | Yes | Unique Index | Automatically generated | MongoDB unique identifier. |
| `name` | `String` | Yes | Text Index | Trimmed, `1` to `150` characters. | Product name displayed to users. |
| `slug` | `String` | Yes | Unique Index | Trimmed, URL-friendly lowercase slug, regex: `^[a-z0-9-]+$`. | SEO-friendly URL path identifier. |
| `sku` | `String` | Yes | Unique Index | Trimmed, alphanumeric uppercase, `3` to `30` characters. | Stock Keeping Unit for inventory tracking. |
| `description` | `String` | Yes | Text Index | Trimmed, `10` to `5000` characters. | Detailed product specification and details. |
| `price` | `Number` | Yes | Index | Minimum `0.00`, float with max 2 decimal precision. | Active selling price in USD. |
| `compareAtPrice`| `Number` | No | None | Must be greater than `price` if set. | Original retail price (strike-through price). |
| `category` | `String` | Yes | Index | Trimmed, lowercase hierarchical (e.g. `electronics/audio`). | Category grouping for menu routing. |
| `brand` | `String` | Yes | Index | Trimmed, `1` to `100` characters. | Brand manufacturer name. |
| `images` | `[String]` | Yes | None | Minimum `1` image, items must be valid HTTP/HTTPS URLs. | Array of product image asset URLs. |
| `stock` | `Number` | Yes | None | Integer, minimum `0`. | Current inventory count. |
| `tags` | `[String]` | No | Index | Array of strings, lowercase, trimmed. | Keywords for filtering and basic tag-matching. |
| `ratings` | `Object` | No | None | See nested validation. | Average rating and rating counts. |
| `ratings.average`| `Number` | No | None | Float, range `0.0` to `5.0`, default `0.0`. | Aggregate review rating. |
| `ratings.count` | `Number` | No | None | Integer, minimum `0`, default `0`. | Total number of reviews submitted. |
| `embedding` | `[Number]` | No | Vector Index | Dimensions must match the embedding model and MongoDB Vector Search index configuration selected by the team. | High-dimensional dense vector representing product name, description, category, and brand for AI search. |
| `isActive` | `Boolean` | Yes | Index | Default `true`. | Flag for soft-deletions / visibility toggle. |
| `createdAt` | `Date` | Yes | None | Auto-populated by Mongoose timestamps. | Record creation date. Used for sorting. |
| `updatedAt` | `Date` | Yes | None | Auto-populated by Mongoose timestamps. | Last update timestamp. Used for cache validation. |

---

## 2. Design Considerations for Scale & Performance

### Cache-Aside Strategy Compatibility (Redis)
To support sub-millisecond retrieval of products under high traffic:
1. **Granular Cache Invalidation**: Product updates/deletions must invalidate keys using the pattern `product:id:<_id>` and `product:slug:<slug>`.
2. **List Caching**: Rather than caching full lists, we will cache the compiled list of active product IDs for standard query combinations (e.g., query hash as key). This prevents stale data inconsistencies.
3. **Optimistic Versioning**: The `updatedAt` timestamp will be returned in all payloads so clients can perform conditional checks.

### MongoDB Vector Search Compatibility
To facilitate semantic product searches (e.g., matching "warm winter coat" to down jackets):
1. **Embedding Storage**: The `embedding` array field stores generated embeddings (e.g., using `text-embedding-3-small` or similar models).
2. **Index Alignment**: The vector search query will execute using Atlas Search `$vectorSearch` operator, utilizing a Vector Index defined on the `embedding` field (cosine distance metrics). 

---

## 3. Global Response Contracts

To maintain a consistent interface for the frontend, all APIs will return standardized JSON envelopes.

### Standard Success Response Envelope
```json
{
  "success": true,
  "data": {} || [],
  "meta": {} // Optional metadata (e.g. pagination)
}
```

### Standard Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable summary of the error.",
    "details": [] // Optional array of validation errors or debug details
  }
}
```

---

## 4. REST API Contract Details

### 4.1. Create Product
* **HTTP Method**: `POST`
* **Route**: `/api/products`
* **Access Control**: Admin / Inventory Manager Only
* **Request Headers**: `Content-Type: application/json`
* **Request Validation**:
  * Mandatory fields: `name`, `sku`, `description`, `price`, `category`, `brand`, `images`, `stock`
  * Business Logic: `compareAtPrice` must be > `price` (if provided). `sku` must be unique.
  
#### Request Body Example
```json
{
  "name": "Sony WH-1000XM5 Wireless Headphones",
  "slug": "sony-wh-1000xm5-wireless-headphones",
  "sku": "SON-WH1000XM5-B",
  "description": "Industry-leading noise canceling headphones with dual processors and 8 microphones.",
  "price": 398.00,
  "compareAtPrice": 449.99,
  "category": "electronics/audio",
  "brand": "Sony",
  "images": [
    "https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg",
    "https://assets.ecommerce.com/products/sony-wh1000xm5/side.jpg"
  ],
  "stock": 120,
  "tags": ["headphones", "anc", "wireless", "audio"]
}
```

#### Response Body Example (`201 Created`)
```json
{
  "success": true,
  "data": {
    "_id": "64b0f9f3c1b0c03d1c9ef001",
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "slug": "sony-wh-1000xm5-wireless-headphones",
    "sku": "SON-WH1000XM5-B",
    "description": "Industry-leading noise canceling headphones with dual processors and 8 microphones.",
    "price": 398.00,
    "compareAtPrice": 449.99,
    "category": "electronics/audio",
    "brand": "Sony",
    "images": [
      "https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg",
      "https://assets.ecommerce.com/products/sony-wh1000xm5/side.jpg"
    ],
    "stock": 120,
    "tags": ["headphones", "anc", "wireless", "audio"],
    "ratings": {
      "average": 0.0,
      "count": 0
    },
    "isActive": true,
    "createdAt": "2026-07-12T08:45:00.000Z",
    "updatedAt": "2026-07-12T08:45:00.000Z"
  }
}
```

---

### 4.2. Get All Products (Paginated & Filtered)
* **HTTP Method**: `GET`
* **Route**: `/api/products`
* **Access Control**: Public
* **Query Parameters**:

| Parameter | Type | Default | Description / Validation |
| :--- | :--- | :---: | :--- |
| `page` | `Number` | `1` | Integer, minimum `1`. Target page of results. |
| `limit` | `Number` | `10` | Integer, range `1` to `100`. Items per page. |
| `search` | `String` | None | Keyword to perform wildcard/full-text search. |
| `category` | `String` | None | Exact match on category string. |
| `minPrice` | `Number` | None | Minimum product price boundary (>= minPrice). |
| `maxPrice` | `Number` | None | Maximum product price boundary (<= maxPrice). |
| `sort` | `String` | `createdAt:desc` | Sorting format: `field:direction` (e.g., `price:asc`, `price:desc`, `ratings:desc`). |

#### Response Body Example (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "64b0f9f3c1b0c03d1c9ef001",
      "name": "Sony WH-1000XM5 Wireless Headphones",
      "slug": "sony-wh-1000xm5-wireless-headphones",
      "sku": "SON-WH1000XM5-B",
      "description": "Industry-leading noise canceling headphones with dual processors and 8 microphones.",
      "price": 398.00,
      "compareAtPrice": 449.99,
      "category": "electronics/audio",
      "brand": "Sony",
      "images": [
        "https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg"
      ],
      "stock": 120,
      "tags": ["headphones", "anc", "wireless", "audio"],
      "ratings": {
        "average": 4.8,
        "count": 350
      },
      "isActive": true,
      "createdAt": "2026-07-12T08:45:00.000Z",
      "updatedAt": "2026-07-12T08:45:00.000Z"
    }
  ],
  "meta": {
    "totalDocs": 45,
    "limit": 10,
    "page": 1,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

---

### 4.3. Get Product by ID
* **HTTP Method**: `GET`
* **Route**: `/api/products/:id` (Requires standard 24-character hex `ObjectId`)
* **Access Control**: Public

#### Response Body Example (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "64b0f9f3c1b0c03d1c9ef001",
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "slug": "sony-wh-1000xm5-wireless-headphones",
    "sku": "SON-WH1000XM5-B",
    "description": "Industry-leading noise canceling headphones with dual processors and 8 microphones.",
    "price": 398.00,
    "compareAtPrice": 449.99,
    "category": "electronics/audio",
    "brand": "Sony",
    "images": [
      "https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg",
      "https://assets.ecommerce.com/products/sony-wh1000xm5/side.jpg"
    ],
    "stock": 120,
    "tags": ["headphones", "anc", "wireless", "audio"],
    "ratings": {
      "average": 4.8,
      "count": 350
    },
    "isActive": true,
    "createdAt": "2026-07-12T08:45:00.000Z",
    "updatedAt": "2026-07-12T08:45:00.000Z"
  }
}
```

#### Response Body Example (`404 Not Found`)
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Product with ID '64b0f9f3c1b0c03d1c9ef999' was not found or is currently inactive."
  }
}
```

> [!NOTE]
> **Future Endpoint Extension**: Storing product slug lookup as a separate future endpoint (e.g., `GET /api/products/slug/:slug`) is planned if direct SEO route resolution is requested by the frontend team. Currently, this endpoint strictly validates and queries by MongoDB `ObjectId`.

---

### 4.4. Update Product
* **HTTP Method**: `PUT`
* **Route**: `/api/products/:id` (Requires 24-character hex `ObjectId`)
* **Access Control**: Admin / Inventory Manager Only
* **Request Headers**: `Content-Type: application/json`
* **Request Validation**:
  * Fields to update are validated using the same schemas as creation.
  * Attempting to modify `sku` to a value owned by another product will trigger a unique-constraint validation error.

#### Request Body Example (Partial Update)
```json
{
  "price": 379.00,
  "stock": 105
}
```

#### Response Body Example (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "64b0f9f3c1b0c03d1c9ef001",
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "slug": "sony-wh-1000xm5-wireless-headphones",
    "sku": "SON-WH1000XM5-B",
    "description": "Industry-leading noise canceling headphones with dual processors and 8 microphones.",
    "price": 379.00,
    "compareAtPrice": 449.99,
    "category": "electronics/audio",
    "brand": "Sony",
    "images": [
      "https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg",
      "https://assets.ecommerce.com/products/sony-wh1000xm5/side.jpg"
    ],
    "stock": 105,
    "tags": ["headphones", "anc", "wireless", "audio"],
    "ratings": {
      "average": 4.8,
      "count": 350
    },
    "isActive": true,
    "createdAt": "2026-07-12T08:45:00.000Z",
    "updatedAt": "2026-07-12T08:52:10.000Z"
  }
}
```

---

### 4.5. Delete Product (Soft Delete)
* **HTTP Method**: `DELETE`
* **Route**: `/api/products/:id` (Requires 24-character hex `ObjectId`)
* **Access Control**: Admin Only
* **Mechanism**: To preserve order history integrity and references, we perform a **soft delete** by toggling `isActive` to `false`.

#### Response Body Example (`200 OK`)
```json
{
  "success": true,
  "data": {
    "message": "Product with ID '64b0f9f3c1b0c03d1c9ef001' has been successfully deactivated."
  }
}
```

---

## 5. Typical Validation & Error Handling Scenarios

To assist the frontend developer and ensure a solid user experience, the API will output clear error descriptions for common failure modes.

### 5.1. Validation Error (`400 Bad Request`)
Returned when required fields are missing, or when data formats fail schema validation (e.g., negative prices or malformed URLs).

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The product payload submitted contains validation errors.",
    "details": [
      {
        "field": "price",
        "message": "Price must be a positive number greater than or equal to 0.00."
      },
      {
        "field": "sku",
        "message": "SKU code is a required field."
      }
    ]
  }
}
```

### 5.2. Duplicate SKU Conflict (`409 Conflict`)
Returned when a creation or update attempt references an SKU already assigned to another active product.

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_ALREADY_EXISTS",
    "message": "A product with SKU 'SON-WH1000XM5-B' already exists in the database."
  }
}
```
