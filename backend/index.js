import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import fs from "fs";
const envPath = fs.existsSync(path.join(process.cwd(), "backend/.env"))
  ? path.join(process.cwd(), "backend/.env")
  : path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import settingRouter from "./routes/settingRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import shopRoutes from "./routes/shopRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

let port = process.env.PORT || 6000;

let app = express();

const localOrigins = [
  "https://shopx-50ym.onrender.com",
  "https://shopx-admin-ktdc.onrender.com",
  "https://shopx-6u3e.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:8082",
];
const productionOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.FRONTEND_URL_2,
  process.env.ADMIN_URL_2,
  "https://shop-x-lac.vercel.app",
  "https://shop-x-teal.vercel.app",
].filter(Boolean);
const normalizeOrigin = (value) => value.replace(/\/$/, "").toLowerCase();
const allowedOrigins = [...localOrigins, ...productionOrigins].map(
  normalizeOrigin,
);
const uniqueAllowedOrigins = [...new Set(allowedOrigins)];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server/no-origin requests (e.g. Mobile Expo apps, curl)
    if (!origin) return callback(null, true);

    const normalized = normalizeOrigin(origin);

    // Development & local network origins (any port on localhost or 127.0.0.1)
    if (
      normalized.startsWith("http://localhost:") ||
      normalized.startsWith("http://127.0.0.1:") ||
      normalized.startsWith("https://localhost:") ||
      normalized.startsWith("https://127.0.0.1:")
    ) {
      return callback(null, true);
    }

    if (uniqueAllowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/return", returnRoutes);
app.use("/api/setting", settingRouter);
app.use("/api/review", reviewRouter);
app.use("/api/shop", shopRoutes);
app.use("/api/delivery", deliveryRoutes);

app.listen(port, () => {
  console.log("Hello From Server");
  connectDb();
});
