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
  addToWishlist,
  getWishList,
  removeWishlist,
} = require("../controller/userController");

router.get("/", getShop);

router.post("/", filterShop);

router.get("/cart", userAuth, getCart);

router.get("/cart-item-id", userAuth, getCartItemID);

router.post("/cart/updateQuantity", userAuth, updateCart);

router.get("/cart/:id", userAuth, addToCart);

router.delete("/cart/:id", userAuth, deleteItemFromCart);

// Wishlist 
router.post('/wishlist/add/:id', userAuth, addToWishlist);
router.get('/wishlist', userAuth, getWishList);
router.get('/wishlist/remove/:id', userAuth, removeWishlist);

// Get the stock of a product
router.get("/stock", userAuth, getStock);

router.get("/:id", getProduct);


module.exports = router;
