import mongoose, { SchemaType } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema, model } = mongoose;

const TransactionSchema = new Schema(
  {
    senderAccountNumber: {
      type: Number,
      ref: "User",
      required: true,
    },
    receiverAccountNumber: {
      type: Number,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.plugin(mongoosePaginate);

export const TransactionModel = model("Transaction", TransactionSchema);