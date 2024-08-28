import { response } from "../helpers/Response.js";
import { LinkModel } from "../models/linkModel.js";
import { UserModel } from "../models/userModel.js";

const linkCtrl = {};

// Create or Update Link 
linkCtrl.updateLink = async (data) => {
  try {
    const { senderId, receiverId, feeRate, amount, senderName, receiverName } = data;
    const adminId = "66a8ff7bc992db5aa2ddf33f";

    let link = await LinkModel.findOne({ senderId, receiverId });

    if (link) {
      let newRate = link.feeRate;
      if (feeRate !== 0) {
        newRate = (link.feeRate * link.amount + amount * feeRate) / (link.amount + amount);
      }

      link.amount += amount;
      link.feeRate = newRate;
      link.senderName = senderName;
      link.receiverName = receiverName;
      await link.save();
      return { success: true, message: "Link updated successfully" };
    } else {
      link = new LinkModel({
        senderId,
        receiverId,
        amount,
        feeRate,
        senderName,
        receiverName,
      });

      await link.save();

      if (receiverId.toString() !== adminId) {
        const receiver = await UserModel.findById(receiverId);
        if (receiver) {
          receiver.trigger += 1;
          await receiver.save();
        }
      }

      return { success: true, message: "Link created successfully" };
    }
  } catch (error) {
    console.error(`Error creating or updating link: ${error.message}`);
    return { success: false, message: error.message };
  }
};

// Get All Links
linkCtrl.getAllLinks = async (req, res) => {
  try {
    const links = await LinkModel.find()
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    return response(res, 200, true, links, "Links obtained successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Get Link by ID
linkCtrl.getLinkById = async (req, res) => {
  try {
    const linkId = req.params.linkId;
    const link = await LinkModel.findById(linkId)
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    if (!link) {
      return response(res, 404, false, null, "Link not found");
    } else {
      return response(res, 200, true, link, "Link found successfully");
    }
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

export default linkCtrl;
