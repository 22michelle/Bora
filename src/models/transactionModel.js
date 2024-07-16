import mongoose, { SchemaType } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema, model } = mongoose;

const TransactionSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    feeRate: {
      type: Number,
      required: true,
    },
    isDistributed: {
      type: Boolean,
      required: true,
    },
    initialSenderBalance: {
      type: Number,
      required: true,
    },
    finalSenderBalance: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

TransactionSchema.plugin(mongoosePaginate);

export const TransactionModel = model("Transaction", TransactionSchema);
