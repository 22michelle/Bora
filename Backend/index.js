import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
// import cookieParser from "cookie-parser";
import { connectDB } from "./database.js";

// Routes
import userRoutes from "./src/routes/user.routes.js";
import transactionRoutes from "./src/routes/transaction.routes.js";
import linkRoutes from "./src/routes/link.routes.js";

connectDB();

const app = express();
app.set("Port", 4000);

app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.use("/user", userRoutes);
app.use("/transaction", transactionRoutes);
app.use("/link", linkRoutes);

app.listen(app.get("Port"), () => {
  console.log("Server listening on the port:", app.get("Port"));
});
