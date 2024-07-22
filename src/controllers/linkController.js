import { response } from "../helpers/Response.js";
import { LinkModel } from "../models/linkModel.js";

const linkCtrl = {};

// Create or Update Link
linkCtrl.updateLink = async (req, res) => {
  try {
    const { senderId, receiverId, feeRate, amount } = req.body;

    let link = await LinkModel.findOne({ senderId, receiverId });

    if (!link) {
      link = new LinkModel({ senderId, receiverId, feeRate, amount });
      await link.save();
      return response(res, 201, true, link, "Link created successfully");
    } else {
      link.feeRate = feeRate;
      link.amount += amount; //If link already exist add amount
      await link.save();
      return response(res, 200, true, link, "Link updated successfully");
    }
  } catch (error) {
    response(res, 500, false, null, error.message);
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
