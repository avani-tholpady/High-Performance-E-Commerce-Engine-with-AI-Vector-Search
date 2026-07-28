const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      index: true
    },
    sku: {
      type: String,
      required: [true, "Variant SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "SKU must be at least 3 characters"],
      maxlength: [30, "SKU cannot exceed 30 characters"],
      match: [/^[A-Z0-9-]+$/, "SKU must contain only uppercase alphanumeric characters and hyphens"]
    },
    color: {
      type: String,
      trim: true,
      maxlength: [50, "Color cannot exceed 50 characters"]
    },
    size: {
      type: String,
      trim: true,
      maxlength: [50, "Size cannot exceed 50 characters"]
    },
    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0.00, "Price must be a positive number greater than or equal to 0.00"]
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function(value) {
          if (value === undefined || value === null) return true;
          if (this.price !== undefined && this.price !== null) {
            return value < this.price;
          }
          return true;
        },
        message: "Discount price must be strictly less than the regular price"
      }
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock quantity must be an integer"
      }
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
          match: [/^https?:\/\/.+/, "Image item must be a valid HTTP or HTTPS URL"]
        }
      ],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be active or inactive"
      },
      default: "active",
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for finding active variants of a product
variantSchema.index({ product: 1, status: 1 });

// Composite index for finding combinations of color and size within a product
variantSchema.index({ product: 1, color: 1, size: 1 });

const Variant = mongoose.model("Variant", variantSchema);

module.exports = Variant;
