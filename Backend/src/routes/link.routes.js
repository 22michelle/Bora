import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import linkCtrl from "../controllers/linkController.js"

const route = new Router();

// Routes
route.get("/links", verifyToken, linkCtrl.getAllLinks);
route.get("/link/:linkId", verifyToken, linkCtrl.getLinkById);

export default route;