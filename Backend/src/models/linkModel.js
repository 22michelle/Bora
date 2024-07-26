import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const { Schema, model } = mongoose;

const LinkSchema = new Schema(
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
    feeRate: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    senderName: { type: String },
    receiverName: { type: String },
  },
  { timestamps: true }
);

LinkSchema.plugin(mongoosePaginate);

export const LinkModel = model("Link", LinkSchema);
