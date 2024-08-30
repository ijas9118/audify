const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: {
      main: {
        type: String, // URL of the main image
        required: true,
      },
      supports: {
        type: [String], // Array of URLs for support images
        validate: {
          validator: function (v) {
            return v.length === 2; // Ensure exactly two support images
          },
          message: "Supports images must be exactly 2",
        },
        required: true,
      },
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
