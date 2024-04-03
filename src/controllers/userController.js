import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../helpers/generateToken.js";

const userCtrl = {};

userCtrl.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await UserModel.findOne({ email });

    if (userExists) {
      return response(
        res,
        409,
        false,
        "",
        "El correo ya existe en otro registro"
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = new UserModel({ email, password: passwordHash, name });
    await newUser.save();

    const token = generateToken({ user: newUser._id });

    response(
      res,
      201,
      true,
      { ...newUser._doc, password: null, token },
      "Usuario creado con éxito"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

userCtrl.login = async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await UserModel.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken({ user: user._id });
      return response(
        res,
        200,
        true,
        { ...user.toJSON(), password: null, token },
        "Bienvenido"
      );
    }

    response(res, 400, false, "", "Email o Password incorrectos");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

userCtrl.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return response(res, 404, false, "", "Usuario no encontrado");
    }

    response(
      res,
      200,
      true,
      { ...user._doc, password: null },
      "Usuario encontrado"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

userCtrl.getUserByToken = async (req, res) => {
  try {
    const userId = re.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return response(res, 404, false, "", "Usuario no encontrado");
    }

    response(
      res,
      200,
      true,
      { ...user._doc, password: null },
      "Usuario encontrado"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

userCtrl.deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserModel.findOneAndDelete({ email });

    if (!user) {
      return response(res, 404, false, "", "Usuario no encontrado");
    }

    response(res, 200, true, null, "Usuario eliminado con éxito");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

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
      return response(res, 404, false, "", "Usuario no encontrado");
    }

    response(
      res,
      200,
      true,
      { ...user._doc, password: null },
      "Usuario actualizado con éxito"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

export default userCtrl;
