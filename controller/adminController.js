const Admin = require("../models/adminModel");
const asyncHandler = require("express-async-handler");

exports.loginAdmin = asyncHandler(async (req, res) => {
  const { user, password } = req.body;
  const findAdmin = await Admin.findOne({ user });

  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    req.session.admin = findAdmin._id;
    console.log('Admin logged in');
    
    res.redirect("/admin");
  } else {
    throw new Error("Invalid Credentials");
  }
});