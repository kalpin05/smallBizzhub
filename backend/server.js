import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stock-history", stockRoutes);

app.get("/", (req, res) => {
  res.send("SmallBizHub API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
