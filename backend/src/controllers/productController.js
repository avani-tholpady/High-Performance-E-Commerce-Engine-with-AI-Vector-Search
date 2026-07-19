const mongoose = require("mongoose");
const Product = require("../models/Product");
const {
  ValidationError,
  DuplicateError,
  NotFoundError,
  InvalidIdError
} = require("../utils/errors");
const { successResponse } = require("../utils/apiResponse");

/**
 * Validates request payload for creation or update.
 * @param {Object} body Request body
 * @param {Boolean} isUpdate Flag indicating if it is an update operation
 * @returns {Array} List of validation error objects
 */
const validateProductPayload = (body, isUpdate = false) => {
  const details = [];
  const requiredFields = ["name", "sku", "description", "price", "category", "brand", "images", "stock"];

  if (!isUpdate) {
    // For creation, all required fields must be present and non-empty
    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        (typeof body[field] === "string" && body[field].trim() === "")
      ) {
        details.push({
          field,
          message: `${field} is a required field.`
        });
      }
    }
  } else {
    // For update, fields provided must not be null or empty
    for (const field of requiredFields) {
      if (body[field] !== undefined) {
        if (body[field] === null || (typeof body[field] === "string" && body[field].trim() === "")) {
          details.push({
            field,
            message: `${field} cannot be empty.`
          });
        }
      }
    }
  }

  // Name validation
  if (body.name !== undefined && body.name !== null) {
    if (typeof body.name !== "string" || body.name.trim().length === 0 || body.name.trim().length > 150) {
      details.push({
        field: "name",
        message: "Product name must be between 1 and 150 characters."
      });
    }
  }

  // SKU validation
  if (body.sku !== undefined && body.sku !== null) {
    const skuStr = String(body.sku).trim();
    if (skuStr.length < 3 || skuStr.length > 30 || !/^[A-Z0-9-]+$/.test(skuStr)) {
      details.push({
        field: "sku",
        message: "SKU must be alphanumeric uppercase between 3 and 30 characters."
      });
    }
  }

  // Slug validation
  if (body.slug !== undefined && body.slug !== null) {
    const slugStr = String(body.slug).trim();
    if (slugStr.length === 0 || !/^[a-z0-9-]+$/.test(slugStr)) {
      details.push({
        field: "slug",
        message: "Slug must be a URL-safe string containing only lowercase letters, numbers, and hyphens."
      });
    }
  }

  // Description validation
  if (body.description !== undefined && body.description !== null) {
    const descStr = String(body.description).trim();
    if (descStr.length < 10 || descStr.length > 5000) {
      details.push({
        field: "description",
        message: "Product description must be between 10 and 5000 characters."
      });
    }
  }

  // Price validation
  if (body.price !== undefined && body.price !== null) {
    const priceNum = Number(body.price);
    if (isNaN(priceNum) || priceNum < 0) {
      details.push({
        field: "price",
        message: "Price must be a positive number greater than or equal to 0.00."
      });
    }
  }

  // Stock validation
  if (body.stock !== undefined && body.stock !== null) {
    const stockNum = Number(body.stock);
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      details.push({
        field: "stock",
        message: "Stock must be a non-negative integer."
      });
    }
  }

  // Brand validation
  if (body.brand !== undefined && body.brand !== null) {
    const brandStr = String(body.brand).trim();
    if (brandStr.length < 1 || brandStr.length > 100) {
      details.push({
        field: "brand",
        message: "Brand name must be between 1 and 100 characters."
      });
    }
  }

  // Category validation
  if (body.category !== undefined && body.category !== null) {
    const catStr = String(body.category).trim();
    if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(catStr)) {
      details.push({
        field: "category",
        message: "Category must be a lowercase hierarchical path (e.g. electronics/audio)."
      });
    }
  }

  // Images validation
  if (body.images !== undefined && body.images !== null) {
    if (!Array.isArray(body.images) || body.images.length === 0) {
      details.push({
        field: "images",
        message: "At least one product image is required."
      });
    } else {
      body.images.forEach((img, index) => {
        if (typeof img !== "string" || !/^https?:\/\/.+/.test(img)) {
          details.push({
            field: `images[${index}]`,
            message: "Image item must be a valid HTTP or HTTPS URL."
          });
        }
      });
    }
  }

  // Ratings validation (if provided)
  if (body.ratings !== undefined && body.ratings !== null) {
    if (typeof body.ratings !== "object") {
      details.push({
        field: "ratings",
        message: "Ratings must be an object containing average and count."
      });
    } else {
      if (body.ratings.average !== undefined && body.ratings.average !== null) {
        const avg = Number(body.ratings.average);
        if (isNaN(avg) || avg < 0 || avg > 5) {
          details.push({
            field: "ratings.average",
            message: "Average rating must be a number between 0.0 and 5.0."
          });
        }
      }
      if (body.ratings.count !== undefined && body.ratings.count !== null) {
        const count = Number(body.ratings.count);
        if (isNaN(count) || count < 0 || !Number.isInteger(count)) {
          details.push({
            field: "ratings.count",
            message: "Ratings count must be a non-negative integer."
          });
        }
      }
    }
  }

  // compareAtPrice validations
  const priceVal = body.price !== undefined ? Number(body.price) : null;
  const comparePriceVal = body.compareAtPrice !== undefined ? Number(body.compareAtPrice) : null;

  if (comparePriceVal !== null) {
    if (isNaN(comparePriceVal) || comparePriceVal < 0) {
      details.push({
        field: "compareAtPrice",
        message: "Compare at price must be a positive number greater than or equal to 0.00."
      });
    } else if (priceVal !== null && comparePriceVal <= priceVal) {
      details.push({
        field: "compareAtPrice",
        message: "Compare at price must be greater than the active selling price."
      });
    }
  }

  return details;
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    // 1. Controller validation
    const validationErrors = validateProductPayload(req.body, false);
    if (validationErrors.length > 0) {
      throw new ValidationError("The product payload submitted contains validation errors.", validationErrors);
    }

    // 2. Duplicate SKU Check
    const existingSku = await Product.findOne({ sku: req.body.sku.trim().toUpperCase() });
    if (existingSku) {
      throw new DuplicateError(`A product with SKU '${req.body.sku}' already exists in the database.`);
    }

    // 3. Duplicate Slug Check
    const existingSlug = await Product.findOne({ slug: req.body.slug.trim().toLowerCase() });
    if (existingSlug) {
      throw new DuplicateError(`A product with slug '${req.body.slug}' already exists in the database.`);
    }

    // 4. Save product
    const product = new Product(req.body);
    await product.save();

    return res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    const { page, limit, search, category, minPrice, maxPrice, sort } = req.query;

    // Category filter
    if (category) {
      filter.category = String(category).trim().toLowerCase();
    }

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        const minVal = Number(minPrice);
        if (!isNaN(minVal)) {
          filter.price.$gte = minVal;
        }
      }
      if (maxPrice !== undefined) {
        const maxVal = Number(maxPrice);
        if (!isNaN(maxVal)) {
          filter.price.$lte = maxVal;
        }
      }
    }

    // Text search filter
    if (search && String(search).trim() !== "") {
      filter.$text = { $search: String(search).trim() };
    }

    // Pagination parsing
    let pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      pageNum = 1;
    }

    let limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      limitNum = 10;
    } else if (limitNum > 100) {
      limitNum = 100;
    }

    const skipNum = (pageNum - 1) * limitNum;

    // Sorting parsing (default is createdAt:desc)
    let sortOption = { createdAt: -1 };
    if (sort) {
      const parts = String(sort).trim().split(":");
      if (parts.length === 2) {
        const field = parts[0];
        const direction = parts[1].toLowerCase() === "asc" ? 1 : -1;
        sortOption = { [field]: direction };
      } else if (parts.length === 1 && parts[0] === "relevance" && filter.$text) {
        sortOption = { score: { $meta: "textScore" } };
      }
    }

    let query = Product.find(filter);
    if (filter.$text && sortOption.score) {
      query = query.select({ score: { $meta: "textScore" } });
    }

    const totalDocs = await Product.countDocuments(filter);
    const products = await query
      .sort(sortOption)
      .skip(skipNum)
      .limit(limitNum);

    const totalPages = Math.ceil(totalDocs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    const nextPage = hasNextPage ? pageNum + 1 : null;
    const prevPage = hasPrevPage ? pageNum - 1 : null;

    return res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalDocs,
        limit: limitNum,
        page: pageNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    // 1. Invalid ObjectId check
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError();
    }

    // 2. Nonexistent / Soft-deleted check
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      throw new NotFoundError(`Product with ID '${req.params.id}' was not found or is currently inactive.`);
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};
// GET /api/products/:id/related
const getRelatedProducts = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError();
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { tags: { $in: product.tags || [] } }
      ]
    }).limit(8);

    return successResponse(
      res,
      200,
      "Related products retrieved successfully",
      related
    );
  } catch (error) {
    next(error);
  }
};
// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    // 1. Invalid ObjectId check
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError();
    }

    // 2. Query target product
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      throw new NotFoundError(`Product with ID '${req.params.id}' was not found or is currently inactive.`);
    }

    // 3. Payload validation
    const validationErrors = validateProductPayload(req.body, true);
    if (validationErrors.length > 0) {
      throw new ValidationError("The product payload submitted contains validation errors.", validationErrors);
    }

    // 4. compareAtPrice vs price comparison with database fallback
    const finalPrice = req.body.price !== undefined ? Number(req.body.price) : product.price;
    const finalComparePrice = req.body.compareAtPrice !== undefined ? Number(req.body.compareAtPrice) : product.compareAtPrice;

    if (finalComparePrice !== undefined && finalComparePrice !== null) {
      if (finalComparePrice <= finalPrice) {
        throw new ValidationError("The product payload submitted contains validation errors.", [
          {
            field: "compareAtPrice",
            message: "Compare at price must be greater than the active selling price."
          }
        ]);
      }
    }

    // 5. Duplicate SKU Check
    if (req.body.sku) {
      const existingSku = await Product.findOne({
        sku: req.body.sku.trim().toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingSku) {
        throw new DuplicateError(`A product with SKU '${req.body.sku}' already exists in the database.`);
      }
    }

    // 6. Duplicate Slug Check
    if (req.body.slug) {
      const existingSlug = await Product.findOne({
        slug: req.body.slug.trim().toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingSlug) {
        throw new DuplicateError(`A product with slug '${req.body.slug}' already exists in the database.`);
      }
    }

    // 7. Update and Save
    const updatableFields = ["name", "slug", "sku", "description", "price", "compareAtPrice", "category", "brand", "images", "stock", "tags", "ratings", "embedding"];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    // 1. Invalid ObjectId check
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new InvalidIdError();
    }

    // 2. Query target product
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      throw new NotFoundError(`Product with ID '${req.params.id}' was not found or is currently inactive.`);
    }

    // 3. Perform Soft Delete
    product.isActive = false;
    await product.save();

    return res.status(200).json({
      success: true,
      data: {
        message: `Product with ID '${req.params.id}' has been successfully deactivated.`
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
      { $sort: { name: 1 } }
    ]);

    return successResponse(res, 200, "Categories retrieved successfully", categories);
  } catch (error) {
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const brands = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
      { $sort: { name: 1 } }
    ]);

    return successResponse(res, 200, "Brands retrieved successfully", brands);
  } catch (error) {
    next(error);
  }
};

const getPriceRange = async (req, res, next) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } },
      { $project: { _id: 0, minPrice: 1, maxPrice: 1 } }
    ]);

    const data = result.length > 0 ? result[0] : { minPrice: 0, maxPrice: 0 };

    return successResponse(res, 200, "Price range retrieved successfully", data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getPriceRange
};
