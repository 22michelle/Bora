import { Router } from "express";
// import { verifyToken } from "../middleware/auth.js";
import linkCtrl from "../controllers/linkController.js"

const router = new Router();

// Routes
router.get("/links", linkCtrl.getAllLinks);
router.get("/link/:linkId", linkCtrl.getLinkById);

export default router;