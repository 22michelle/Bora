import mongoose from "mongoose";
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
    senderName: { type: String },
    receiverName: { type: String },
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
    },
    amount: {
      type: Number,
      required: true,
    },
    fee_rate: {
      type: Number,
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
