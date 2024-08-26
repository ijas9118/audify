const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

exports.createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User signed up successfully",
      user: newUser,
    });
  } else {
    throw new Error("User Already Exists");
  }
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });

  if (findUser && await findUser.isPasswordMatched(password)) {
    req.session.user = findUser._id;
    res.redirect('/');
  } else {
    throw new Error('Invalid Credentials')
  }
});

exports.logoutUser = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.redirect('/login');
  });
});

