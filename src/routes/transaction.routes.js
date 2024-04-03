import router from "express";
import trasactionController from "../controllers/transaction.controller";

router.post("/create", trasactionController.createTransaction);

module.exports = router;
