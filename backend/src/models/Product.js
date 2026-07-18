const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [1, "Product name must be at least 1 character"],
      maxlength: [150, "Product name cannot exceed 150 characters"]
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, "Slug must be a URL-safe string containing only lowercase letters, numbers, and hyphens"]
    },
    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "SKU must be at least 3 characters"],
      maxlength: [30, "SKU cannot exceed 30 characters"],
      match: [/^[A-Z0-9-]+$/, "SKU must contain only uppercase alphanumeric characters and hyphens"]
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Product description must be at least 10 characters"],
      maxlength: [5000, "Product description cannot exceed 5000 characters"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.00, "Price must be a positive number greater than or equal to 0.00"],
      index: true
    },
    compareAtPrice: {
      type: Number,
      validate: {
        validator: function(value) {
          if (value === undefined || value === null) return true;
          if (this.price !== undefined && this.price !== null) {
            return value > this.price;
          }
          return true;
        },
        message: "Compare at price must be greater than the active selling price"
      }
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+(\/[a-z0-9-]+)*$/, "Category must be a hierarchical lowercase path (e.g. electronics/audio)"],
      index: true
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
      trim: true,
      minlength: [1, "Brand name must be at least 1 character"],
      maxlength: [100, "Brand name cannot exceed 100 characters"],
      index: true
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
          match: [/^https?:\/\/.+/, "Image item must be a valid HTTP or HTTPS URL"]
        }
      ],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length >= 1;
        },
        message: "At least one product image URL is required"
      },
      required: [true, "Product images are required"]
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer"
      }
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true
        }
      ],
      default: [],
      index: true
    },
    ratings: {
      average: {
        type: Number,
        default: 0.0,
        min: [0.0, "Average rating cannot be less than 0.0"],
        max: [5.0, "Average rating cannot exceed 5.0"]
      },
      count: {
        type: Number,
        default: 0,
        min: [0, "Ratings count cannot be negative"],
        validate: {
          validator: Number.isInteger,
          message: "Ratings count must be an integer"
        }
      }
    },
    embedding: {
      type: [Number],
      default: undefined
    },
    isActive: {
      type: Boolean,
      required: [true, "Active visibility status is required"],
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Define full-text search capability
productSchema.index({ name: "text", description: "text", brand: "text" });

// Define descending index for sorting by creation date
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
