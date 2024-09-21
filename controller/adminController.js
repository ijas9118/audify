const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Order = require("../models/order");
const Offer = require("../models/offer");
const Product = require("../models/products");
const Category = require("../models/categories");
const Coupon = require("../models/coupon");
const asyncHandler = require("express-async-handler");
const moment = require("moment");

// ============================
//  Admin Authentication Controllers
// ============================

// Render Admin Login Page
exports.getAdminLogin = asyncHandler(async (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admin");
  }
  res.render("admin/adminLogin", { title: "Admin Login" });
});

// Handle Admin Login
exports.loginAdmin = asyncHandler(async (req, res) => {
  const { user, password } = req.body;
  const findAdmin = await Admin.findOne({ user });

  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    req.session.admin = findAdmin._id;

    res.redirect("/admin");
  } else {
    throw new Error("Invalid Credentials");
  }
});

// Render Admin Home Page (Dashboard)
exports.getAdminHome = asyncHandler(async (req, res) => {
  res.render("layout", {
    title: "Audify",
    viewName: "admin/adminHome",
    activePage: "dashboard",
    isAdmin: true,
  });
});

// Handle Admin Logout
exports.logoutAdmin = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.redirect("/admin/login");
  });
});

// ============================
//  User Management Controllers
// ============================

// Render User Management Page
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  if (!users) {
    throw new Error("Failed to fetch users");
  }

  res.render("layout", {
    title: "User Management",
    viewName: "admin/userManagement",
    activePage: "users",
    isAdmin: true,
    users: users,
  });
});

// Toggle user status
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Find user by ID
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Determine the new status
  const newStatus = user.status === "Active" ? "Inactive" : "Active";

  // Update the status field only
  const result = await User.updateOne(
    { _id: userId },
    { $set: { status: newStatus } }
  );

  // Check if the update was successful
  if (result.modifiedCount === 0) {
    res.status(404);
    throw new Error("User not found or status not changed");
  }

  // Redirect back to user management page
  res.redirect("/admin/users");
});

// ============================
//  Order Management Controllers
// ============================

// Render Order Management Page
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ dateOrdered: -1 });

  res.render("layout", {
    title: "Order Management",
    viewName: "admin/orderManagement",
    activePage: "orders",
    isAdmin: true,
    orders,
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const status = req.body.status;
  try {
    const updatedOrder = await Order.updateOne(
      { _id: orderId },
      { $set: { status } }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

exports.viewOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById({ _id: orderId })
    .populate("user", "firstName lastName email mobile")
    .populate({ path: "orderItems", populate: "product" });

  res.render("layout", {
    title: "Order Management",
    viewName: "admin/viewOrder",
    activePage: "orders",
    isAdmin: true,
    order,
  });
});

// ============================
//  Coupon Management Controllers
// ============================

// Render Coupon Management Page
exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.render("layout", {
    title: "Coupon Management",
    viewName: "admin/couponManagement",
    activePage: "coupon",
    isAdmin: true,
    coupons,
  });
});

exports.addCoupon = asyncHandler(async (req, res) => {
  console.log(req.body);
  try {
    const {
      code,
      discountType,
      discountValue,
      maxDiscountValue,
      minCartValue,
      validFrom, // Changed from expirationDate
      validUntil, // New field for expiration date
      usageLimit,
      isActive,
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Create a new coupon document
    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      maxDiscountValue,
      minCartValue: minCartValue || 0, // Default to 0 if not provided
      validFrom, // New field for start date
      validUntil, // New field for expiration date
      usageLimit: usageLimit || 1, // Default to 1 if not provided
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    });

    // Save the coupon to the database
    await newCoupon.save();

    // Send a success response
    res
      .status(201)
      .json({ success: true, message: "Coupon added successfully!" });
  } catch (error) {
    console.error("Error adding coupon:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the coupon",
    });
  }
});

exports.updateCoupon = async (req, res) => {
  const { id } = req.params;
  const {
    code,
    discountType,
    discountValue,
    maxDiscountValue,
    minCartValue,
    validFrom,
    validUntil,
    usageLimit,
    isActive,
  } = req.body;

  try {
    const coupon = await Coupon.findById(id);
    console.log(req.body)

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.code = code || coupon.code;
    coupon.discountType = discountType || coupon.discountType;
    coupon.discountValue = discountValue || coupon.discountValue;
    coupon.maxDiscountValue = maxDiscountValue;
    coupon.minCartValue = minCartValue;
    coupon.validFrom = validFrom || coupon.validFrom;
    coupon.validUntil = validUntil || coupon.validUntil;
    coupon.usageLimit = usageLimit || coupon.usageLimit;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
    console.log(coupon)
    await coupon.save();

    res
      .status(200)
      .json({ success: true, message: "Coupon updated successfully", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    const result = await Coupon.findByIdAndDelete(couponId);

    if (!result) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the coupon" });
  }
};

// ============================
//  Offer Management Controllers
// ============================

// Render Offer Management Page
exports.getOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find().populate("product").populate("category");
  res.render("layout", {
    title: "Offer Management",
    viewName: "admin/offerManagement",
    activePage: "offer",
    isAdmin: true,
    offers,
  });
});

exports.addOffer = asyncHandler(async (req, res) => {
  try {
    const {
      type,
      product,
      category,
      discountType,
      discountValue,
      maxDiscountAmount,
      minCartValue,
      validFrom,
      validUntil,
      referralBonus,
    } = req.body;

    // Validate required fields
    if (!type || !discountType || !discountValue || !validFrom || !validUntil) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Create a new offer document
    const newOffer = new Offer({
      type,
      product: type === "product" ? product : undefined,
      category: type === "category" ? category : undefined,
      discountType,
      discountValue,
      maxDiscountAmount,
      minCartValue,
      validFrom,
      validUntil,
      referralBonus: type === "referral" ? referralBonus : undefined,
    });

    // Save the offer to the database
    await newOffer.save();

    if (type === "product" && product) {
      await Product.findByIdAndUpdate(product, {
        $set: { offerId: newOffer._id },
      });
    }
    if (type === "category" && category) {
      await Category.findByIdAndUpdate(category, {
        $set: { offerId: newOffer._id },
      });
    }

    // Send a success response
    res
      .status(201)
      .json({ success: true, message: "Offer added successfully!" });
  } catch (error) {
    console.error("Error adding offer:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the offer",
    });
  }
});

exports.updateOffer = async (req, res) => {
  const { id } = req.params; // The offer ID
  const {
    type,
    discountType,
    discountValue,
    maxDiscountAmount,
    validFrom,
    validUntil,
    minCartValue,
  } = req.body;

  try {
    // Find the offer by ID
    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Update the offer details
    offer.type = type || offer.type;
    offer.discountType = discountType || offer.discountType;
    offer.discountValue = discountValue || offer.discountValue;
    offer.maxDiscountAmount = maxDiscountAmount || offer.maxDiscountAmount;
    offer.validFrom = validFrom || offer.validFrom;
    offer.validUntil = validUntil || offer.validUntil;
    offer.minCartValue = minCartValue || offer.minCartValue;

    // Save the updated offer
    await offer.save();

    // Send success response
    res
      .status(200)
      .json({ success: true, message: "Offer updated successfully", offer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteOffer = asyncHandler(async (req, res) => {
  const offerId = req.params.id;

  try {
    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await Offer.deleteOne({ _id: offerId });
    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the offer",
    });
  }
});

// ============================
//  Deals Management Controllers
// ============================

// Render Deals Management Page
exports.getDeals = asyncHandler(async (req, res) => {
  res.render("layout", {
    title: "Offer Management",
    viewName: "admin/dealManagement",
    activePage: "deal",
    isAdmin: true,
  });
});

// ============================
//  Sales Report Controllers
// ============================

const getDateRange = (filterType) => {
  const today = moment().startOf("day");

  switch (filterType) {
    case "Daily":
      return {
        start: today.clone(), // Clone to avoid mutation
        end: today.clone().endOf("day"),
      };
    case "Weekly":
      return {
        start: today.clone().startOf("week"),
        end: today.clone().endOf("week"),
      };
    case "Monthly":
      return {
        start: today.clone().startOf("month"),
        end: today.clone().endOf("month"),
      };
    case "Yearly":
      return {
        start: today.clone().startOf("year"),
        end: today.clone().endOf("year"),
      };
    default:
      return { start: null, end: null };
  }
};

exports.getSalesReport = asyncHandler(async (req, res) => {
  const { filter, startDate, endDate } = req.body;
  let start, end;

  if (filter === "Custom Date Range" && startDate && endDate) {
    start = moment(startDate).startOf("day");
    end = moment(endDate).endOf("day");
  } else {
    const dateRange = getDateRange(filter);
    start = dateRange.start;
    end = dateRange.end;
  }
  try {
    // Fetch orders within the date range
    const orders = await Order.find({
      dateOrdered: { $gte: start.toDate(), $lte: end.toDate() },
    })
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        select: 'price', // Select only the fields you need
      },
    });

    // Process sales data
    const salesData = orders.reduce((acc, order) => {
      const dateKey = moment(order.dateOrdered).format("YYYY-MM-DD");
      if (!acc[dateKey]) {
        acc[dateKey] = {
          totalSalesRevenue: 0,
          discountApplied: 0,
          netSales: 0,
          numberOfOrders: 0,
          totalItemsSold: 0,
        };
      }

      const originalPriceTotal = order.orderItems.reduce((sum, item) => {
        if (item.product && item.product.price) {
          return sum + item.product.price * item.quantity;
        } else {
          console.error('Item product or price is undefined:', item);
          return sum; // Return the sum as is if there's an issue
        }
      }, 0);

      const discountApplied = order.totalAmount - originalPriceTotal;

      acc[dateKey].totalSalesRevenue += order.totalAmount;
      // Assuming discountApplied is derived from a different source
      acc[dateKey].discountApplied += discountApplied; // Adjust if needed
      acc[dateKey].netSales += originalPriceTotal; // Adjust if needed
      acc[dateKey].numberOfOrders += 1;
      acc[dateKey].totalItemsSold += order.orderItems.length;

      return acc;
    }, {});

    // Transform sales data into an array
    const responseData = Object.keys(salesData).map((date) => ({
      date,
      ...salesData[date],
    }));

    // Summary
    const totalSalesCount = orders.length;
    const overallOrderAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const overallDiscount = orders.reduce(
      (sum, order) => {
        // Calculate discount for each order
        const originalPriceTotal = order.orderItems.reduce((sum, item) => {
          if (item.product && item.product.price) {
            return sum + item.product.price * item.quantity;
          } else {
            console.error('Item product or price is undefined:', item);
            return sum;
          }
        }, 0);
        return sum + (order.totalAmount - originalPriceTotal);
      },
      0
    );

    res.json({
      success: true,
      data: responseData,
      summary: {
        totalSalesCount,
        overallOrderAmount,
        overallDiscount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
