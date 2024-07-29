import jwt from "jsonwebtoken";
import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";

const messageNoAuth = (res) => {
  response(res, 401, false, "", "You are not authorized to enter");
};

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.KEYWORD_TOKEN);
      const user = await UserModel.findById(decoded.user);

      if (!user) {
        return messageNoAuth(res);
      }

      req.userId = decoded.user;
      next();
    } catch (error) {
      return messageNoAuth(res);
    }
  } else {
    response(res, 401, false, "", "Authorization header is missing or invalid");
  }
};
