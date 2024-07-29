import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import transationCtrl from "../controllers/transactionController.js";

const router = new Router();

// Routes
router.post("/transaction", verifyToken, transationCtrl.createTransaction);
router.get("/transactions", verifyToken, transationCtrl.getAllTransactions);

export default router;
