import { Router } from "express";
// import { verifyToken } from "../middleware/auth.js";
import userCtrl from "../controllers/userController.js";

const router = Router();

// Public routes
router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);

// Private routes
router.get("/:userId", userCtrl.getUserById); 
router.get("/token/:token", userCtrl.getUserByToken);
router.get("/email/:email", userCtrl.getUserByEmail);
router.delete("/:email", userCtrl.deleteUser);
router.put("/:email", userCtrl.updateUser);
router.get("/", userCtrl.getAllUsers);

export default router;
