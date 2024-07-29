import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { generateToken } from "../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { encryptPassword } from "../helpers/encryptPassword.js";

const userCtrl = {};

// Create User
userCtrl.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const exist = await UserModel.findOne({ email });

    if (exist) {
      return response(res, 400, false, null, "Email is already in use");
    }

    if (password !== confirmPassword) {
      return response(res, 400, false, null, "Passwords do not match");
    }

    if (password.length < 6) {
      return response(
        res,
        400,
        false,
        null,
        "Password must be at least 6 characters long"
      );
    }

    const hashedPassword = encryptPassword(password); // Encriptar la contraseña
    const newUser = new UserModel({ name, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken({ user: newUser._id }); // Generar token con userId
    response(
      res,
      201,
      true,
      { ...newUser.toJSON(), token },
      "Registration successful"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Login
userCtrl.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken({ user: user._id }); // Genera el token

      return response(
        res,
        200,
        true,
        { ...user.toJSON(), token }, // Incluye el token en la respuesta
        "Welcome to Bora"
      );
    }

    response(res, 400, false, "", "Incorrect Email or Password");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Get User by Token
userCtrl.getUserByToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return response(res, 400, false, null, "Token is required");
    }

    // Verifica el token
    const decoded = jwt.verify(token, process.env.KEYWORD_TOKEN);
    const userId = decoded.user;

    const user = await UserModel.findById(userId);
    if (!user) {
      return response(res, 404, false, null, "User not found");
    }

    response(
      res,
      200,
      true,
      { ...user._doc, password: null, token },
      "User found"
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      response(res, 401, false, null, "The token has expired");
    } else if (error.name === "JsonWebTokenError") {
      response(res, 401, false, null, "Invalid token");
    } else {
      response(res, 500, false, null, error.message);
    }
  }
};

// Get User by Id
userCtrl.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await UserModel.findById(userId);
    if (!user) {
      return response(res, 404, false, "", "User not found");
    }

    response(res, 200, true, { ...user._doc, password: null }, "User found");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Delete User
userCtrl.deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserModel.findOneAndDelete({ email });

    if (!user) {
      return response(res, 404, false, "", "User not found");
    }

    response(res, 200, true, null, "User deleted successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Update User
userCtrl.updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { name } = req.body;

    const user = await UserModel.findOneAndUpdate(
      { email },
      { name },
      { new: true }
    );

    if (!user) {
      return response(res, 404, false, "", "User not found");
    }

    response(
      res,
      200,
      true,
      { ...user._doc, password: null },
      "User updated successfully"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Get all Users
userCtrl.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    response(res, 200, true, users, "Users obtained successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Get User by Email
userCtrl.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return response(res, 404, false, "", "User not found");
    }

    response(res, 200, true, { ...user._doc, password: null }, "User found");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

export default userCtrl;
