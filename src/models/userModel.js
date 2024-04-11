import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
      required: [true, "The field is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "The field is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please, enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "The field is required"],
      minlength: [6, "The password must be at least 6 characters"],
    },
    balance: {
      type: Number,
      default: 1000,
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