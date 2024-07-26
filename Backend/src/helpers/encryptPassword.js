import bcrypt from "bcrypt";

export const encryptPassword = (password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordEncrypted = bcrypt.hashSync(password, salt);
    return passwordEncrypted;
  } catch (error) {
    console.log("Error encrypting password", error.message);
  }
};