const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"]
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: [true, "Variant reference is required"]
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"]
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
      index: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    },
    grandTotal: {
      type: Number,
      required: [true, "Grand total is required"],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to calculate item subtotals and grand total
cartSchema.pre("save", function () {
  let total = 0;
  this.items.forEach(item => {
    item.subtotal = item.quantity * item.price;
    total += item.subtotal;
  });
  this.grandTotal = total;
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
