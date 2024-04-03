import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.KEYWORD_TOKEN, {
      expiresIn: "30d",
    });
  } catch (error) {
    console.log("Error al generar token", error.message);
  }
};
