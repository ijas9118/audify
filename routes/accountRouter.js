const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuth");
const {
  getUserAccount,
  getAddresses,
  addAddress,
  updateDefaultAddress,
  editAddressPage,
  updateAddress,
  deleteAddress,
  updateUserAccount,
  getOrderHistory,
  cancelOrder,
} = require("../controller/userController");

router.get("/", userAuth, getUserAccount);

router.get("/addresses", userAuth, getAddresses);

router.post("/addresses", userAuth, addAddress);

router.post("/addresses/default", userAuth, updateDefaultAddress);

router.get("/addresses/edit/:id", userAuth, editAddressPage);

router.post("/addresses/edit/:id", userAuth, updateAddress);

router.delete("/addresses/delete/:id", userAuth, deleteAddress);

router.post("/:id", userAuth, updateUserAccount);

router.get("/order-history", userAuth, getOrderHistory);

router.post("/order-history/cancel", userAuth, cancelOrder);

module.exports = router;
