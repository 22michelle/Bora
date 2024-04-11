import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import transationCtrl from "../controllers/transactionController.js";

const route = new Router();

// Routes
route.post("/transaction", verifyToken, transationCtrl.performTransaction);
route.get("/transactions", verifyToken, transationCtrl.getAllTransactions);
route.get("/transactions/:userId", verifyToken, transationCtrl.getUserTransactions);
route.get("/transaction/:transactionId", verifyToken, transationCtrl.deleteTransaction);

export default route;
