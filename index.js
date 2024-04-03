import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import { connectDB } from "./database.js";

// Routes
import userRoutes from "./src/routes/user.routes.js"

connectDB();

const app = express();
app.set("Port", 4000);

app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.use("/user", userRoutes);

app.listen(app.get("Port"), () => {
  console.log("Servidor escuchando por el puerto", app.get("Port"));
});
