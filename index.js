const express = require("express");
const path = require("node:path");
const connectDB = require("./config/db");
require("dotenv").config();
const { notFound, errorHandler } = require("./middleware/errorHandler");
const userRouter = require("./routes/userRoute");
const adminRouter = require('./routes/adminRoute');

const PORT = process.env.PORT || 3000;
const app = express();
connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", userRouter);
app.use('/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
