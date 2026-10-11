const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
require("dotenv").config();
const orderRoutes = require("./routes/order");
const foodRoutes = require("./routes/food");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/orders", orderRoutes);
app.use("/api/foods", foodRoutes);

mongoose
  .connect("mongodb://127.0.0.1:27017/cafe-auth")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});