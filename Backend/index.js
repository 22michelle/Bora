import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./database.js";
import cookieParser from "cookie-parser";

// Routes
import userRoutes from "./src/routes/user.routes.js";
import transactionRoutes from "./src/routes/transaction.routes.js";
import linkRoutes from "./src/routes/link.routes.js";

connectDB();

const app = express();
app.set("Port", 4000);
app.use(cookieParser());
app.use(morgan("dev"));

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://frontend-bora.vercel.app", // Production
];

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/user", userRoutes);
app.use("/transaction", transactionRoutes);
app.use("/link", linkRoutes);

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(app.get("Port"), () => {
  console.log(`Server listening on port:`, app.get("Port"));
});
