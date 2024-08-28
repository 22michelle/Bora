import { Router } from "express";
// import { verifyToken } from "../middleware/auth.js";
import transationCtrl from "../controllers/transactionController.js";

const router = new Router();

// Routes
router.post("/transaction",  transationCtrl.createTransaction);
router.post("/deposit",  transationCtrl.depositMoney);
router.post("/withdraw",  transationCtrl.withdrawMoney);
router.get("/transactions", transationCtrl.getAllTransactions);
router.get("/:transactionId", transationCtrl.getTransactionById);

export default router;