const mongoose = require("mongoose");

const inventoryHistorySchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: [true, "Variant reference is required"],
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      index: true
    },
    quantityChanged: {
      type: Number,
      required: [true, "Quantity change is required"]
    },
    type: {
      type: String,
      enum: ["increase", "decrease", "order_allocation", "restock", "adjustment"],
      required: [true, "Inventory movement type is required"]
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    reason: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false }
  }
);

const InventoryHistory = mongoose.model("InventoryHistory", inventoryHistorySchema);

module.exports = InventoryHistory;
