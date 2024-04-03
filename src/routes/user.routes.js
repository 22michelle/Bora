import { Router } from "express";
import userCtrl from "../controllers/userController.js";

const route = new Router();

// Routes
route.post("/register", userCtrl.register);
route.post("/login", userCtrl.login);
route.get("/users/:email", userCtrl.getUserByEmail);
route.get("/user", userCtrl.getUserByToken);
route.delete("/users/:email", userCtrl.deleteUser);
route.put("/users/:email", userCtrl.updateUser);

export default route;