import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.KEYWORD_TOKEN, {
      expiresIn: "30d",
    });
    return token;
  } catch (error) {
    console.log("Error generating token", error.message);
  }
};