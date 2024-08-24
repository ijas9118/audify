const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const userRouter = require("./routes/userRoute");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const PORT = process.env.PORT || 3000;

const app = express();
connectDB();

app.use(express.json());

app.use("/api/user/", userRouter);

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
