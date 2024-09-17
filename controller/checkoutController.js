const Address = require("../models/address");
const Cart = require("../models/cart");
const OrderItem = require("../models/orderItem");
const Order = require("../models/order");
const Product = require("../models/products");
const Coupon = require('../models/coupon')
const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const { applyCoupon } = require("../services/couponService");

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

exports.applyCoupon = asyncHandler(async (req,res) => {
  const { totalPrice, couponCode } = req.body;
  console.log(req.body)
  const now = new Date()
  
  
  try {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon code.' });
    }

    const finalPrice = await applyCoupon(totalPrice, coupon);

    if (finalPrice === null) {
      return res.status(400).json({ message: 'Invalid or expired coupon code.' });
    }

    res.status(200).json({ newTotal: finalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while applying the coupon.' });
  }
})

exports.razorPay = asyncHandler(async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error");
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

exports.handleOrderSubmission = asyncHandler(async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.session.user });

    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        const orderItem = new OrderItem({
          quantity: item.quantity,
          product: item.productId,
        });
        await orderItem.save();

        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        const updatedStock = product.stock - item.quantity;
        const isOutOfStock = updatedStock <= 0;

        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: { stock: -item.quantity, popularity: 1 },
            $set: { isOutOfStock },
          } // Decrement stock by the ordered quantity
        );

        return orderItem;
      })
    );

    const order = new Order({
      user: req.session.user,
      name: req.body.name,
      mobile: req.body.mobile,
      alternateMobile: req.body.alternateMobile,
      location: req.body.location,
      city: req.body.city,
      state: req.body.state,
      landmark: req.body.landmark,
      zip: req.body.zip,
      orderItems: orderItems.map((item) => item._id),
      paymentMethod,
      shippingCharge: cart.shippingCharge,
      totalAmount: cart.total,
      status: "Pending",
    });

    await order.save();

    cart.items = [];
    cart.calculateTotals();

    await Cart.findByIdAndUpdate(cart._id, {
      $set: { items: cart.items, total: cart.total },
    });

    res
      .status(200)
      .json({ message: "Order placed successfully", orderId: order._id });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

exports.orderSuccessPage = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          select: "name price",
        },
      })
      .exec();

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.render("layout", {
      title: "Order Success",
      header: req.session.user ? "partials/login_header" : "partials/header",
      viewName: "users/orderSuccess",
      activePage: "Order",
      isAdmin: false,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).send("Server Error");
  }
});

exports.getOrderHistory = asyncHandler(async (req, res) => {
  const userId = req.session.user;

  const orders = await Order.find({ user: userId })
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
  const order = await Order.findById(req.params.id).populate({
    path: "orderItems",
    populate: {
      path: "product",
    },
  });

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
