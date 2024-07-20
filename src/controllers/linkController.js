import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";

const linkCtrl = {};

// Create Link
linkCtrl.updateLink = async (req, res) => {
  try {
    const { senderId, receiveId, feeRate, amount } = req.body;
    const newLink = new LinkModel.create(senderId, receiveId, feeRate, amount);

    if (!link) {
      link = await LinkModel.create({
        senderId,
        receiveId,
        feeRate,
        amount,
      });
      await link.save();
      return response(res, 201, true, link, "Link created successfully");
    } else {
      return response(res, 200, true, link, "Link found successfully");
    }
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Get All Links
linkCtrl.getAllLinks = async (req, res) => {
    
}

// Get Link by ID
linkCtrl.getLinkById = async (req, res) => {
  try {
    const linkId = req.params.linkId;
    const link = await LinkModel.findById(linkId);
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
