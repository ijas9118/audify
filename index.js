const express = require("express");
const path = require("node:path");
const connectDB = require("./config/db");
const session = require("express-session");
require("dotenv").config();
const { notFound, errorHandler } = require("./middleware/errorHandler");
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const shopRouter = require('./routes/shopRouter');
const accountRouter = require('./routes/accountRouter')
const checkoutRouter = require('./routes/checkoutRouter')

const PORT = process.env.PORT || 3000;
const app = express();
connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Prevent caching by setting headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },

  })
);

app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/shop", shopRouter);
app.use("/account", accountRouter);
app.use("/checkout", checkoutRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
