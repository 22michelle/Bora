import { response } from "../helpers/Response.js";
import { LinkModel } from "../models/linkModel.js";

const linkCtrl = {};

// Create or Update Link
linkCtrl.updateLink = async (data) => {
  try {
    const { senderId, receiverId, feeRate, amount } = data;

    let link = await LinkModel.findOne({ senderId, receiverId });

    if (link) {
      let newRate = link.feeRate;
      if (link.feeRate < feeRate) {
        newRate = feeRate;
      }

      link.amount += amount;
      link.feeRate = newRate;
      await link.save();
      return { success: true, message: "Link updated successfully" };
    } else {
      link = new LinkModel({
        senderId,
        receiverId,
        amount,
        feeRate,
      });

      await link.save();
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