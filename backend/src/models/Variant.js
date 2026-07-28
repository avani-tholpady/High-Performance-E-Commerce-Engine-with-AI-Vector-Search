const mongoose = require("mongoose");

const dimensionsSchema = new mongoose.Schema(
  {
    length: { type: Number, min: [0, "Length cannot be negative"] },
    width: { type: Number, min: [0, "Width cannot be negative"] },
    height: { type: Number, min: [0, "Height cannot be negative"] },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      index: true,
    },

    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "SKU must be at least 3 characters"],
      maxlength: [30, "SKU cannot exceed 30 characters"],
      match: [/^[A-Z0-9-]+$/, "SKU must contain only uppercase alphanumeric characters and hyphens"],
    },

    size: {
      type: String,
      trim: true,
      maxlength: [50, "Size cannot exceed 50 characters"],
    },

    color: {
      type: String,
      trim: true,
      maxlength: [50, "Color cannot exceed 50 characters"],
    },

    material: {
      type: String,
      trim: true,
      maxlength: [100, "Material cannot exceed 100 characters"],
    },

    images: {
      type: [
        {
          type: String,
          trim: true,
          match: [/^https?:\/\/.+/, "Image URL must start with http or https"],
        },
      ],
      default: [],
    },

    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock quantity must be an integer",
      },
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low stock threshold cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Low stock threshold must be an integer",
      },
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0.0, "Price must be greater than or equal to 0.00"],
    },

    salePrice: {
      type: Number,
      validate: {
        validator: function (value) {
          if (value === undefined || value === null) return true;
          return value < this.price;
        },
        message: "Sale price must be strictly less than regular price",
      },
    },

    barcode: {
      type: String,
      trim: true,
      maxlength: [50, "Barcode cannot exceed 50 characters"],
    },

    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },

    dimensions: {
      type: dimensionsSchema,
      default: undefined,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

variantSchema.index({ product: 1, isActive: 1 });
variantSchema.index({ product: 1, color: 1, size: 1 });

module.exports = mongoose.model("Variant", variantSchema);