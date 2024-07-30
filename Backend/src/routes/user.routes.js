import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import userCtrl from "../controllers/userController.js";

const router = Router();

// Public routes
router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);

// Private routes
router.get("/:userId", verifyToken, userCtrl.getUserById);
router.get("/token/:token", verifyToken, userCtrl.getUserByToken);
router.get("/email/:email", verifyToken, userCtrl.getUserByEmail);
router.delete("/:email", verifyToken, userCtrl.deleteUser);
router.put("/:email", verifyToken, userCtrl.updateUser);
router.get("/", verifyToken, userCtrl.getAllUsers);

export default router;
