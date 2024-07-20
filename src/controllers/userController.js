import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../helpers/generateToken.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userCtrl = {};

// Create User
userCtrl.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return response(res, 400, false, null, "Passwords do not match");
    }

    const newUser = new UserModel({ name, email, password });
    await newUser.save();

    const token = newUser.generateAuthToken(); // Generate token with userId
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
    const { password, email } = req.body;
    const user = await UserModel.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
      // Generate token with user ID
      const token = user.generateAuthToken();
      return response(
        res,
        200,
        true,
        { ...user.toJSON(), password: null, token },
        "Welcome to Bora"
      );
    }

    response(res, 400, false, "", "Incorrect Email or Password");
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

// Get User by Token
userCtrl.getUserByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return response(res, 400, false, "", "Token is required");
    }

    // Decodificar el token
    const decoded = jwt.verify(token, process.env.KEYWORD_TOKEN);
    const userId = decoded.user;

    const user = await UserModel.findById(userId);

    if (!user) {
      return response(res, 404, false, "", "User not found");
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
    }
    response(res, 500, false, null, error.message);
  }
};

// Get User by Id
userCtrl.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return response(res, 400, false, null, "Invalid User ID");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return response(res, 404, false, "", "User not found");
    }

    response(res, 200, true, { ...user._doc, password: null }, "User found");
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