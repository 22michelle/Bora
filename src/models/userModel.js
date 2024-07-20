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

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    balance: {
      type: Number,
      required: true,
      default: 1000,
    },
    link_obligation: {
      type: Number,
      required: true,
      default: 0,
    },
    link_income: {
      type: Number,
      required: true,
      default: 0,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    public_rate: {
      type: Number,
      required: true,
      default: 0,
    },
    auxiliary: {
      type: Number,
      required: true,
      default: 0,
    },
    trigger: {
      type: Number,
      required: true,
      default: 0,
    },
    trxCount: {
      type: Number,
      required: true,
      default: 0,
    },
    accountNumber: {
      type: String,
      unique: true,
      required: true,
      default: generateAccountNumber,
    },
    transactionHistory: [
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.KEYWORD_TOKEN, {
    expiresIn: "300d",
  });
};

UserSchema.plugin(mongoosePaginate);

export const UserModel = model("User", UserSchema);
