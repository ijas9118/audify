const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const createUser = asyncHandler(async (req, res) => {
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

module.exports = { createUser };
