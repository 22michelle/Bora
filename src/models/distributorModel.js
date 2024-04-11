import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const UserShema = new Schema(
  {
    from: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    to: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    amount: {
        type: Number,
      },
  },
  {
    timestamps: true,
  }
);

UserShema.plugin(mongoosePaginate);

export const UserModel = model("Distributor", distributorShema);
