# Product Management Module: REST API Documentation & Testing Manual

**Author**: Senior Backend QA & API Documentation Engineer  
**Status**: Completed  
**Target Branch**: `feature/issue-16-product-testing`  
**Associated Issue**: GitHub Issue #16: "Test and Document Product APIs"

---

## 1. Global Request & Response Specifications

### 1.1. Common Headers
All write operations (`POST`, `PUT`) require:
* `Content-Type: application/json`

---

## 2. API Endpoints Documentation

### 2.1. Create Product
* **Method**: `POST`
* **URL**: `/api/products`
* **Purpose**: Creates a new product document in the catalog database.

#### Schema Validation Rules
* `name`: Trimmed string, length `1` to `150` characters. Required.
* `slug`: Trimmed lowercase slug, match: `/^[a-z0-9-]+$/`. Required. Unique.
* `sku`: Trimmed uppercase alphanumeric, length `3` to `30`, match: `/^[A-Z0-9-]+$/`. Required. Unique.
* `description`: Trimmed string, length `10` to `5000` characters. Required.
* `price`: Number, minimum `0.00`. Required.
* `compareAtPrice`: Number, must be > `price` if set. Optional.
* `category`: Trimmed lowercase hierarchical path (e.g. `electronics/audio`), match: `/^[a-z0-9-]+(\/[a-z0-9-]+)*$/`. Required.
* `brand`: Trimmed string, length `1` to `100` characters. Required.
* `images`: Non-empty array of valid HTTP/HTTPS URLs matching `/^https?:\/\/.+/`. Required.
* `stock`: Non-negative integer. Required.
* `tags`: Array of trimmed lowercase strings. Default: `[]`. Optional.

#### Sample Request Body
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
    "https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg"
  ],
  "stock": 120,
  "tags": ["headphones", "anc", "wireless"]
}
```

#### Sample Response Body (`201 Created`)
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
      "https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg"
    ],
    "stock": 120,
    "tags": ["headphones", "anc", "wireless"],
    "ratings": {
      "average": 0.0,
      "count": 0
    },
    "isActive": true,
    "createdAt": "2026-07-16T18:15:00.000Z",
    "updatedAt": "2026-07-16T18:15:00.000Z"
  }
}
```

#### Status Codes & Error Formats
* **`201 Created`**: Product created successfully.
* **`400 Bad Request` (`VALIDATION_FAILED`)**: Required field missing or negative price/stock input.
* **`409 Conflict` (`RESOURCE_ALREADY_EXISTS`)**: SKU or Slug already exists in DB.

---

### 2.2. Get All Products (Paginated & Filtered)
* **Method**: `GET`
* **URL**: `/api/products`
* **Purpose**: Retrieves a paginated list of active products with optional search, category, and price range filters.

#### Supported Query Parameters
* `page`: Integer >= `1`. Default: `1`.
* `limit`: Integer, `1` to `100`. Default: `10`.
* `search`: Wildcard/full-text keyword matching `name` and `description` index fields.
* `category`: Exact lowercase category path (e.g. `electronics/audio`).
* `minPrice`: Minimum price limit.
* `maxPrice`: Maximum price limit.
* `sort`: Format `field:direction` (e.g. `price:asc`, `price:desc`, `ratings:desc`). Default: `createdAt:desc`.

#### Sample Response Body (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "_id": "64b0f9f3c1b0c03d1c9ef001",
      "name": "Sony WH-1000XM5 Wireless Headphones",
      "slug": "sony-wh-1000xm5-wireless-headphones",
      "sku": "SON-WH1000XM5-B",
      "price": 398.00,
      "category": "electronics/audio",
      "brand": "Sony",
      "images": ["https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg"],
      "stock": 120,
      "isActive": true
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

#### Status Codes
* **`200 OK`**: Return array list and metadata.
* **`400 Bad Request`**: Malformed parameter inputs.

---

### 2.3. Get Product by ID
* **Method**: `GET`
* **URL**: `/api/products/:id`
* **Purpose**: Retrieves details of a single product using Mongoose ObjectId.

#### Sample Response Body (`200 OK`)
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
    "category": "electronics/audio",
    "brand": "Sony",
    "images": ["https://assets.ecommerce.com/products/sony-wh1000xm5/main.jpg"],
    "stock": 120,
    "isActive": true
  }
}
```

#### Status Codes & Error Formats
* **`200 OK`**: Successful read.
* **`400 Bad Request` (`INVALID_ID_FORMAT`)**: Parameter `:id` is not a valid 24-character hexadecimal ObjectId.
* **`404 Not Found` (`RESOURCE_NOT_FOUND`)**: Product ID is not present in the database or `isActive: false` (soft-deleted).

---

### 2.4. Update Product
* **Method**: `PUT`
* **URL**: `/api/products/:id`
* **Purpose**: Performs a partial update on a product document matching the parameter ID.

#### Sample Request Body
```json
{
  "price": 389.00,
  "stock": 110
}
```

#### Sample Response Body (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "64b0f9f3c1b0c03d1c9ef001",
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "slug": "sony-wh-1000xm5-wireless-headphones",
    "sku": "SON-WH1000XM5-B",
    "price": 389.00,
    "stock": 110,
    "isActive": true,
    "updatedAt": "2026-07-16T18:20:00.000Z"
  }
}
```

#### Status Codes & Error Formats
* **`200 OK`**: Successfully updated.
* **`400 Bad Request` (`VALIDATION_FAILED` / `INVALID_ID_FORMAT`)**: Payload validation constraints failed.
* **`404 Not Found` (`RESOURCE_NOT_FOUND`)**: Target product does not exist or is inactive.
* **`409 Conflict` (`RESOURCE_ALREADY_EXISTS`)**: Updating SKU/Slug to match another product.

---

### 2.5. Delete Product (Soft Delete)
* **Method**: `DELETE`
* **URL**: `/api/products/:id`
* **Purpose**: Soft-deletes a product by setting `isActive` to `false`.

#### Sample Response Body (`200 OK`)
```json
{
  "success": true,
  "data": {
    "message": "Product with ID '64b0f9f3c1b0c03d1c9ef001' has been successfully deactivated."
  }
}
```

#### Status Codes & Error Formats
* **`200 OK`**: Soft delete toggled successfully.
* **`400 Bad Request` (`INVALID_ID_FORMAT`)**: ObjectId format validation failed.
* **`404 Not Found` (`RESOURCE_NOT_FOUND`)**: Target product was not found or has already been deactivated.

---

## 3. Postman Collection Test Automation Setup

### 3.1. Verification Instructions
1. Run `npm run start` or `npm run dev` in the `backend` folder to start the Express application on port `5000`.
2. Import the environment config from `postman/Product-Environment.postman_environment.json` into Postman.
3. Import the request collection from `postman/Product-API.postman_collection.json` into Postman.
4. Execute the Collection Runner. Every request will run assertions on success codes, response times (<200ms), header contents, and database consistency constraints.
