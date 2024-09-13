const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const {
  getShop,
  filterShop,
  getCart,
  updateCart,
  addToCart,
  deleteItemFromCart,
  getProduct,
  getStock,
  getCartItemID,
} = require("../controller/userController");

router.get("/", getShop);

router.post("/", filterShop);

router.get("/cart", userAuth, getCart);

router.get("/cart-item-id", userAuth, getCartItemID);

router.post("/cart/updateQuantity", userAuth, updateCart);

router.get("/cart/:id", userAuth, addToCart);

router.delete("/cart/:id", userAuth, deleteItemFromCart);

// Get the stock of a product
router.get("/stock", userAuth, getStock);

router.get("/:id", getProduct);


module.exports = router;
