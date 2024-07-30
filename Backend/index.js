import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./database.js";

// Routes
import userRoutes from "./src/routes/user.routes.js";
import transactionRoutes from "./src/routes/transaction.routes.js";
import linkRoutes from "./src/routes/link.routes.js";

connectDB();

const app = express();
const port = process.env.PORT || 4000;

app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.use("/user", userRoutes);
app.use("/transaction", transactionRoutes);
app.use("/link", linkRoutes);

// Ruta raíz (opcional, solo para verificación)
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
