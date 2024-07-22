import { response } from "../helpers/Response.js";
import { LinkModel } from "../models/linkModel.js";

const linkCtrl = {};

// Create or Update Link
linkCtrl.updateLink = async (req) => {
  try {
    const { senderId, receiverId, feeRate, amount } = req.body;

    let link = await LinkModel.findOne({ senderId, receiverId });

    if (link) {
      let newRate = link.feeRate;
      // Update rate only if new rate is not 0
      if (feeRate !== 0) {
        newRate =
          (link.amount * link.feeRate + amount * feeRate) /
          (link.amount + amount);
      }
      // Update the link with the new amount and rate
      link.amount += amount;
      link.feeRate = newRate;

      await link.save();
      return { success: true, message: "Link created successfully", link };
    } else {
      link = new LinkModel({ senderId, receiverId, feeRate, amount });
      await link.save();
      return { success: true, message: "Link updated successfully", link };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get All Links
linkCtrl.getAllLinks = async (req, res) => {
  try {
    const links = await LinkModel.find();
    return response(res, 200, true, links, "Links obtained successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

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
