const asyncHandler = require('express-async-handler');

const userAuth = asyncHandler(async (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
});

module.exports = userAuth;
