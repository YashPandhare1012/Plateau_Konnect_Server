const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const userRouter = require("./routes/user.route.js");
const authRouter = require("./routes/auth.route.js");
const enumRouter = require("./routes/enum.route.js");
const listingRouter = require("./routes/listing.route.js");

const CustomError = require("./utils/error/CustomError.js");
const { globalErrorHandler } = require("./utils/error/errorHelpers.js");

dotenv.config();

// ✅ Handle Unhandled Promise Rejections & Uncaught Exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// ✅ Connect to MongoDB with error handling
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();



app.use(
  cors()
);

app.use(express.json());
app.use(cookieParser());

// ✅ Default route to check server status
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// ✅ Register API Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/enums", enumRouter);
app.use("/api/listings", listingRouter);

// ✅ Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "public")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"), function (err) {
      if (err) {
        res.status(500).send(err);
      }
    });
  });
}

// ✅ Handle Undefined Routes
app.use("*", (req, res, next) => {
  const err = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404);
  next(err);
});

// ✅ Register Global Error Handler
app.use(globalErrorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
