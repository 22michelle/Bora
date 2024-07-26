import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import transationCtrl from "../controllers/transactionController.js";

const route = new Router();

// Routes
route.post("/transaction", verifyToken, transationCtrl.createTransaction);
route.get("/transactions", verifyToken, transationCtrl.getAllTransactions);

export default route;
