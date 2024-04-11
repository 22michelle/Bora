import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import userCtrl from "../controllers/userController.js";

const route = new Router();

// Public routes
route.post("/register", verifyToken, userCtrl.register);
route.post("/login", verifyToken, userCtrl.login);
route.get("/token/:token", verifyToken, userCtrl.getUserByToken);

// Private routes 
route.get("/:userId", verifyToken, userCtrl.getUserById);
route.get("/email/:email", verifyToken, userCtrl.getUserByEmail);
route.delete("/:email", verifyToken, userCtrl.deleteUser);
route.put("/:email", verifyToken, userCtrl.updateUser);
route.get("/", verifyToken, userCtrl.getAllUsers);

export default route;
