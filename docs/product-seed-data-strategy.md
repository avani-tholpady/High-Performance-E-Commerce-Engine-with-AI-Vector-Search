# Product Management Module: Mock Product Seed Data Strategy

**Author**: Senior Backend Engineer  
**Status**: Proposal for Review  
**Target Branch**: `urvi`  
**Associated Issue**: GitHub Issue #2: "Design Product Seed Data Generation Strategy"

---

## 1. Executive Summary

This document establishes the technical blueprint for generating, validating, and seeding realistic product datasets into MongoDB. The seed system is critical for stress-testing querying performance, proving pagination capabilities, benchmarking MongoDB Index behavior, and validating caching performance prior to production deployment.

---

## 2. Generation Configuration & Reproducibility

To ensure consistency in local testing, performance profiling, and CI/CD pipelines, the seeding script must support configurable inputs and deterministic output.

### 2.1. Configurable Key Parameters
* **Target Size**: Default `10,000` products, configurable via CLI/environment variables up to `100,000` to support scale testing.
* **Batch Size**: Default `500` records per MongoDB write operation, customizable to find the optimal network-to-memory trade-off.
* **Random Seed**: A numeric seed (e.g., `42`) to feed the pseudo-random generator (such as `faker.js` seed or seed-random). This ensures identical dataset generation on separate runs when the same seed is specified.

---

## 3. Data Schema & Category Distribution

### 3.1. Category Tree & Distribution Target
To simulate a real-world warehouse, products will be distributed across hierarchical categories with non-uniform distributions. A heavy category bias mimics real customer shopping volumes:

| Top Level Category | Subcategories | Target Distribution |
| :--- | :--- | :---: |
| `electronics` | `audio`, `computers`, `mobile-accessories` | **30%** |
| `apparel` | `mens-clothing`, `womens-clothing`, `footwear` | **25%** |
| `home-living` | `furniture`, `kitchen`, `decor` | **20%** |
| `fitness-outdoor` | `exercise-gear`, `camping`, `sports-wear` | **15%** |
| `beauty-health` | `skincare`, `haircare`, `supplements` | **10%** |

### 3.2. Data Generation Rules per Field
The generator must produce realistic schema fields mapped to `docs/product-api-design.md`:

* **`name`**: Combines descriptive adjectives, brand names, and product nouns (e.g., *Sony WH-1000XM5 Wireless Headphones* instead of *Headphones 452*).
* **`slug`**: URL-safe string generated from name and appended with the SKU to ensure absolute slug uniqueness (e.g., `brand-name-sku`).
* **`sku`**: Alphanumeric code. Generated using a prefix matching the category (e.g., `ELE-AUD-`), followed by a deterministic counter value padded to 6 digits (e.g., `ELE-AUD-000452`).
* **`price`**: Range restricted by category (e.g., electronics average $50-$2000, apparel average $10-$150). Values generated with standard `.99` or `.00` endings.
* **`compareAtPrice`**: 30% of products will have this set. Must be deterministically calculated as `price * (1.15 to 1.40)` to simulate a 15% to 40% discount.
* **`stock`**: Integer between `0` and `500`. 5% of products will be set to `0` to test out-of-stock sorting and indexing.
* **`ratings`**: 
  * `average`: Range `3.2` to `5.0` (with a bell-curve distribution centered around `4.2`).
  * `count`: Range `0` to `5000` (Pareto distribution: a few products have thousands of reviews; many have less than ten).

---

## 4. Duplicate Prevention & Deterministic Identifiers

To prevent data pollution and verify that seeding runs successfully on dirty databases, we use two defensive patterns:

### 4.1. Deterministic SKU Generation
The seed generator will generate SKUs using a structured counter:
$$\text{SKU} = \text{Category Prefix} + \text{Deterministic Seed Padded Integer}$$
*Example*: `APP-MCL-004312`

If execution is restarted with the same parameters (seed and size), the generated SKUs will be identical, allowing the database upsert drivers to safely overwrite or skip rather than double-insert.

### 4.2. Database Level Uniqueness
MongoDB schema definitions must enforce:
* `unique: true` index on `sku`.
* `unique: true` index on `slug`.

---

## 5. Safe Reseeding Modes

Blindly dropping database collections is extremely dangerous and can lead to accidental data loss in staging or production contexts. The script must implement three explicit execution modes:

1. **`APPEND` (Default)**
   * Generates new records and attempts to insert them.
   * If a record collides on SKU, it logs a warning and skips the write.
   
2. **`UPSERT`**
   * Checks for the presence of the product SKU in the database.
   * If the SKU exists, updates all other fields.
   * If the SKU does not exist, inserts a new document.
   * *Usage*: Ideal for updating mock data properties without losing document `_id` references.

3. **`RESET_RESEED`**
   * Truncates the `products` collection completely, then inserts the target dataset.
   * **Safety Mechanism**: This mode must query the current database connection URL or environment status. If `NODE_ENV === 'production'` or the MongoDB connection string contains production keywords (e.g., `prod-cluster`), the script must abort immediately with a safety validation error.

---

## 6. High-Performance MongoDB Write Strategy (Batching)

Inserting 10,000+ items individually using single `save()` commands creates enormous network round-trip overhead, leading to poor throughput. Conversely, passing all 10,000 records inside a single MongoDB write block can consume excessive Node.js memory and create long transaction locks on the database.

### 6.1. Selected Batch Pattern
The script must group generated entities into batches (recommended default size: **500**) and use the **`insertMany()`** driver method with the option:
`{ ordered: false }`

#### Why `{ ordered: false }`?
When `ordered` is set to `false`, MongoDB attempts to write all items in the batch concurrently. If any document in the batch fails validation or triggers a duplicate SKU key conflict, MongoDB writes the remaining valid items and logs the errors instead of halting the entire transaction.

---

## 7. Performance Monitoring & Diagnostics

The script must measure and output a detailed execution summary in JSON or console table format upon completion.

### 7.1. Collected Metrics
* **Total Elapsed Time**: Wall-clock time from start to execution finish (seconds).
* **Generation Duration**: Time spent compiling mock data arrays in memory (milliseconds).
* **Write Duration**: Time spent on MongoDB operations (milliseconds).
* **Throughput**: Calculated as $\text{written documents} / \text{write duration}$ (docs/sec).
* **Execution Counts**:
  * `totalAttempted`: Total records sent.
  * `successCount`: Successfully inserted documents.
  * `updateCount`: Successfully updated documents (in UPSERT mode).
  * `duplicateSkipCount`: Duplicates skipped.
  * `failureCount`: Errors due to validations or network connection drops.

---

## 8. Downstream Integrations (Vector Search & Redis Cache-Aside)

The seeding framework must cleanly interface with features owned by other team components.

### 8.1. Preparation for AI Vector Search
While the seed script does not generate vectors itself (to avoid calling expensive LLM embedding APIs during testing), it must produce descriptive text combinations ready for conversion.
* **Vector Input Source String**: The script will combine `name`, `category`, `brand`, and `description` into a single, clean text field `vectorSearchText` in memory.
* **Database State**: The `embedding` array field in the database will remain empty (`null` or empty array) until the AI Vector Search module runs its batch embedding scripts.

### 8.2. Redis Cache Invalidation
When the database is populated or reset:
1. **Cache Pollution Prevention**: Seeding directly to MongoDB bypasses Express route middleware, leaving existing Redis caches stale.
2. **Invalidation Pipeline**: The seed script must trigger a Redis cache flush or invalidation command once seeding is done. In local environments, it will call `FLUSHDB` or match keys prefixed with `product:*` and delete them using a scan/pipeline utility.

---

## 9. Proposed CLI Command Structure

To integrate seamlessly with package scripts, the future script will run using standard CLI flags.

### 9.1. Command Examples

#### Basic Development Seed (10k items, append mode, default batch size)
```bash
npm run db:seed -- --size=10000 --mode=append
```

#### Safe Fresh DB Reset (Specific seed, print execution logs)
```bash
npm run db:seed -- --mode=reset --seed=101 --size=5000 --verbose
```

#### Staging Database Upsert (Update pricing details on staging cluster safely)
```bash
npm run db:seed -- --mode=upsert --batch-size=1000
```

---

## 10. Future Implementation Checklist

This checklist acts as a guide for when coding begins on the seed script:

- [ ] Install dev dependencies (`faker` or similar library, and CLI parser like `commander` or `yargs`).
- [ ] Implement deterministic random generator wrapper linked to `--seed` flag.
- [ ] Define the mock dataset generator functions mapping to Mongoose validation schema.
- [ ] Create category percentage distribution selector logic.
- [ ] Implement the SKU generation utility (`PREFIX-COUNTER`).
- [ ] Implement command line argument parser and load environment configurations.
- [ ] Set up connection handler to MongoDB Atlas / Local Database.
- [ ] Write safety validations to prevent `--mode=reset` from running on production strings.
- [ ] Write the batch slice loops to package documents in array groups of size `--batch-size`.
- [ ] Call Mongoose/MongoDB write queries using `.insertMany(batch, { ordered: false })`.
- [ ] Implement `try-catch` blocks to capture bulk write duplicate key errors (`code: 11000`).
- [ ] Collect time benchmarks (`performance.now()`) for diagnostics.
- [ ] Integrate Redis cache flushing utility (activated only if Redis client environment variables are populated).
- [ ] Output the detailed diagnostic metrics console summary.
