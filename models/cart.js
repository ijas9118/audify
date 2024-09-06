const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingCharge: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.methods.calculateTotals = function () {
  this.total =
    this.items.reduce((acc, item) => acc + item.subtotal, 0) +
    (this.items.length === 0 ? 0 : this.shippingCharge);
  return this.total;
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
