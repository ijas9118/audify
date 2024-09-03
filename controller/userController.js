const User = require("../models/userModel");
const Product = require("../models/products");
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
    res.redirect("/");
  } else {
    throw new Error("Invalid Credentials");
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

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).send("Product not found");
  }
  res.render("layout", {
    title: "Audify",
    header: req.session.user ? "partials/login_header" : "partials/header",
    viewName: "users/product-detail",
    activePage: "shop",
    isAdmin: false,
    product,
  });
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
  const updatedUser = await User.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  });

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  res.redirect("/account");
});
