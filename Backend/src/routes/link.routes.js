import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import linkCtrl from "../controllers/linkController.js"

const router = new Router();

// Routes
router.get("/links", verifyToken, linkCtrl.getAllLinks);
router.get("/link/:linkId", verifyToken, linkCtrl.getLinkById);

export default router;