import mongoose from "mongoose";
import bcrypt from "bcrypt";
import shortid from "shortid";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema, model } = mongoose;

const generateAccountNumber = () => {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const UserShema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El campo es obligatorio"],
    },
    email: {
      type: String,
      required: [true, "El campo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Por favor, introduce un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "El campo es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    balance: {
      type: Number,
      default: 0,
    },
    accountNumber: {
      type: String,
      unique: true,
      required: true,
      default: generateAccountNumber,
    },
    transactionHistroy: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserShema.method.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserShema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "300d",
  });
};

UserShema.plugin(mongoosePaginate);

export const UserModel = model("User", UserShema);
