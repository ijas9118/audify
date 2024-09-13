const User = require("../models/userModel");
const Product = require("../models/products");
const Address = require("../models/address");
const Cart = require("../models/cart");
const OrderItem = require("../models/orderItem");
const Order = require("../models/order");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const addToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [], shippingCharge: 50, total: 0 });
  }

  const itemIndex = cart.items.findIndex((item) =>
    item.productId.equals(productId)
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal =
      cart.items[itemIndex].quantity * cart.items[itemIndex].price;
  } else {
    cart.items.push({
      productId: product._id,
      name: product.name,
      image: product.images.main,
      price: product.price,
      quantity: quantity,
      subtotal: product.price * quantity,
    });
  }

  cart.calculateTotals();
  await cart.save();
  return cart;
};

exports.sendOtp = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    const otp = crypto.randomInt(100000, 999999);
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    req.session.otp = otp;
    req.session.otpExpiry = otpExpiry;
    req.session.tempUser = { firstName, lastName, email, password };

    const mailOptions = {
      from: "ahammedijas9118@gmail.com",
      to: email,
      subject: "Your OTP for Signup",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.render("layout", {
        title: "Verify OTP",
        header: "partials/header",
        viewName: "users/verifyOtp",
        error: null,
        isAdmin: false,
        activePage: "home",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  } else {
    throw new Error("User Already Exists");
  }
});

exports.verifyAndSignUp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (req.session.otp && req.session.otpExpiry > Date.now()) {
    if (req.session.otp == otp) {
      const { firstName, lastName, email, password } = req.session.tempUser;

      const newUser = new User({
        firstName,
        lastName,
        email,
        password,
      });

      await newUser.save();

      req.session.otp = null;
      req.session.otpExpiry = null;
      req.session.tempUser = null;

      req.session.user = newUser._id;
      res.redirect("/");
    } else {
      res.render("layout", {
        title: "Verify OTP",
        header: "partials/header",
        viewName: "users/verifyOtp",
        error: "Invalid OTP",
        isAdmin: false,
        activePage: "home",
      });
    }
  } else {
    res.render("layout", {
      title: "Verify OTP",
      header: "partials/header",
      viewName: "users/verifyOtp",
      error: "OTP has expired. Please sign up again.",
      isAdmin: false,
      activePage: "home",
    });
  }
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });

  if (
    findUser &&
    (await findUser.isPasswordMatched(password)) &&
    findUser.status === "Active"
  ) {
    req.session.user = findUser._id;
    res.status(200).json({
      success: true,
      message: "Login successful",
      redirectUrl: "/",
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid Credentials",
    });
  }
});

exports.logoutUser = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.redirect("/login");
  });
});

exports.getShop = asyncHandler(async (req, res) => {
  const products = await Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$categoryDetails",
    },
    {
      $match: {
        "categoryDetails.isActive": true, // Only include products where the associated category is active
        isActive: true,
      },
    },
  ]);
  res.render("layout", {
    title: "Audify",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/shop",
    activePage: "shop",
    isAdmin: false,
    products,
  });
});

exports.filterShop = asyncHandler(async (req, res) => {
  const sortBy = req.body.sort;

  let sortCriteria = {};

  switch (sortBy) {
    case "popularity":
      sortCriteria = { popularity: -1 };
      break;
    case "price-asc":
      sortCriteria = { price: 1 };
      break;
    case "price-desc":
      sortCriteria = { price: -1 };
      break;
    case "rating":
      sortCriteria = { averageRatings: -1 };
      break;
    case "featured":
      sortCriteria = { featured: -1 };
      break;
    case "new":
      sortCriteria = { createdAt: -1 };
      break;
    case "a-z":
      sortCriteria = { name: 1 };
      break;
    case "z-a":
      sortCriteria = { name: -1 };
      break;
    default:
      sortCriteria = null;
      break;
  }

  const pipeline = [
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$categoryDetails",
    },
    {
      $match: {
        "categoryDetails.isActive": true,
        isActive: true,
      },
    },
  ];

  if (sortCriteria !== null) {
    pipeline.push({ $sort: sortCriteria });
  }

  const products = await Product.aggregate(pipeline);

  res.render("layout", {
    title: "Audify",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/shop",
    activePage: "shop",
    isAdmin: false,
    products,
  });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const categoryId = product.categoryId;
  if (!product) {
    return res.status(404).send("Product not found");
  }
  const relatedProducts = await Product.find({
    categoryId: categoryId,
    _id: { $ne: product._id },
  });
  res.render("layout", {
    title: "Audify",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/product-detail",
    activePage: "shop",
    isAdmin: false,
    product,
    relatedProducts,
  });
});

exports.getStock = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Return the stock quantity
    res.json({ stock: product.stock });
  } catch (error) {
    console.error("Error fetching stock information:", error);
    res.status(500).json({ error: "Server error" });
  }
});

exports.getUserAccount = asyncHandler(async (req, res) => {
  const id = req.session.user;
  const user = await User.findById(id);

  res.render("layout", {
    title: "My Audify Account",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/userAccount",
    activePage: "Home",
    isAdmin: false,
    user,
  });
});

exports.updateUserAccount = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({
    email,
    _id: { $ne: req.params.id },
  });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "Email is already in use" });
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  });

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "Account updated successfully" });
});

exports.getAddresses = asyncHandler(async (req, res) => {
  const userId = req.session.user;
  const addresses = await Address.find({ user: userId });

  res.render("layout", {
    title: "Manage Address",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/manageAddress",
    activePage: "Home",
    isAdmin: false,
    addresses,
  });
});

exports.getAddressDetails = asyncHandler(async (req, res) => {
  const addressid = req.params.id;
  const userId = req.session.user;

  const user = await User.findById(userId);
  const address = await Address.findById(addressid);

  const result = {
    name: user.firstName + user.lastName,
    mobile: user.mobile,
    location: address.location,
    city: address.city,
    state: address.state,
    landmark: address.landmark || "",
    zip: address.zip,
  }
  res.status(200).json(result);
})

exports.addAddress = asyncHandler(async (req, res) => {
  const userId = req.session.user;
  const userAddresses = await Address.find({ user: userId });

  if (req.body.isDefault == "true")
    await Address.updateMany({}, { $set: { isDefault: false } });

  const newAddress = new Address({
    user: userId,
    location: req.body.location,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    zip: req.body.zip,
    addressType: req.body.addressType,
    customName: req.body.customName,
    isDefault: userAddresses.length === 0 || req.body.isDefault,
  });

  await newAddress.save();

  await User.findByIdAndUpdate(userId, {
    $push: { addresses: newAddress._id },
  });

  res.redirect("/account/addresses");
});

exports.updateDefaultAddress = asyncHandler(async (req, res) => {
  const { newDefaultId } = req.body;

  try {
    await Address.updateMany({}, { $set: { isDefault: false } });

    await Address.findByIdAndUpdate(newDefaultId, {
      $set: { isDefault: true },
    });

    res.status(200).send("Default address updated successfully");
  } catch (error) {
    console.error("Error updating default address:", error);
    res.status(500).send("Internal Server Error");
  }
});

exports.editAddressPage = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  const address = await Address.findById(addressId);

  res.render("layout", {
    title: "Edit Address",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/editAddress",
    activePage: "Home",
    isAdmin: false,
    address,
  });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  const updatedAddress = {
    customName: req.body.customName,
    addressType: req.body.addressType,
    location: req.body.location,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    country: req.body.country,
  };

  await Address.findByIdAndUpdate(addressId, updatedAddress);

  res.redirect("/account/addresses");
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;

  const result = await Address.findByIdAndDelete(addressId);

  if (!result) {
    return res.status(404).send("Address not found");
  }

  res.status(200).send("Address deleted successfully");
});

exports.getCart = asyncHandler(async (req, res) => {
  const userId = req.session.user;
  const cart = await Cart.findOne({ user: userId });

  res.render("layout", {
    title: "Cart",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/cart",
    activePage: "Shop",
    isAdmin: false,
    cart,
  });
});

exports.getCartItemID = asyncHandler(async (req, res) => {
  const userId = req.session.user;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Find the cart for the user
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Extract product IDs and quantities
    const products = cart.items.map((item) => ({
      productId: item.productId._id.toString(),
      quantity: item.quantity,
      name: item.name,
    }));

    // Return product IDs and quantities as response
    res.json({ products });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Server error" });
  }
});

exports.addToCart = asyncHandler(async (req, res) => {
  const userId = req.session.user;
  const productId = req.params.id;
  try {
    await addToCart(userId, productId, 1);
    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
});

exports.updateCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.user;

  const cart = await addToCart(userId, productId, quantity);

  res.json(cart);
});

exports.deleteItemFromCart = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the item with the specified productId
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    // Save the updated cart
    cart.calculateTotals();
    await cart.save();

    res.status(200).json({ message: "Item removed successfully", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

exports.getCheckoutPage = asyncHandler(async (req, res) => {
  const userId = req.session.user;
  const cart = await Cart.findOne({ user: userId });
  const addresses = await Address.find({ user: userId });
  res.render("layout", {
    title: "Checkout",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/checkout",
    activePage: "Shop",
    isAdmin: false,
    cart,
    addresses,
  });
});

exports.orderSuccessPage = asyncHandler(async (req, res) => {
  console.log(req.body)
})

exports.orderSuccessPage2 = asyncHandler(async (req, res) => {
  console.log(req.body);
  
  const { selectedAddressId, paymentMethod } = req.body;
  const userId = req.session.user;
  const user = await User.findById(userId);
  const address = await Address.findById(selectedAddressId);
  const cart = await Cart.findOne({ user: userId });

  const insufficientStockItems = [];
  await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (item.quantity > product.stock) {
        insufficientStockItems.push({
          product: product.name,
          availableStock: product.stock,
          requestedQuantity: item.quantity,
        });
      }
    })
  );

  const orderItems = await Promise.all(
    cart.items.map(async (item) => {
      const orderItem = new OrderItem({
        quantity: item.quantity,
        product: item.productId,
      });
      await orderItem.save();

      const product = await Product.findById(item.productId);
      const updatedStock = product.stock - item.quantity;

      // Check if product is out of stock
      const isOutOfStock = updatedStock <= 0;
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity }, $set: { isOutOfStock } } // Decrement stock by the ordered quantity
      );

      return orderItem;
    })
  );

  const order = new Order({
    user: userId,      
    name: user.firstName + " " + user.lastName,
    mobile: user.mobile,
    alternateMobile: address.alternateMobile,  
    location: address.location,
    city: address.city,
    state: address.state,
    landmark: address.landmark,
    zip: address.zip,
    orderItems: orderItems.map((item) => item._id),
    paymentMethod,
    shippingCharge: cart.shippingCharge,
    totalAmount: cart.total,
    status: "Pending",
  });

  await order.save();

  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

  res.render("layout", {
    title: "Thank You",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/orderSuccess",
    activePage: "Shop",
    isAdmin: false,
    cart,
    address,
    paymentMethod,
  });
});

exports.getOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.session.user;

  const orders = await Order.find({ user: userId })
    .populate("address", "location city state country zip")
    .populate({ path: "orderItems", populate: "product" })
    .sort({ dateOrdered: -1 });

  res.render("layout", {
    title: "Order History",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/orderHistory",
    activePage: "Order History",
    isAdmin: false,
    orders,
  });
});

exports.getOrderDetail = asyncHandler(async (req, res) => {
  const order = await Order.find({ _id: req.params.id })
    .populate("address", "location city state country zip")
    .populate({ path: "orderItems", populate: "product" })
    .sort({ dateOrdered: -1 });

  res.render("layout", {
    title: "Order Detail",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/orderDetail",
    activePage: "Order",
    isAdmin: false,
    order,
  });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const orderId = req.body.orderId;
  await Order.updateOne({ _id: orderId }, { $set: { isCancelled: true } });
  return res.json({ message: "Order Cancel Requested" });
});
