import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";
import linkCtrl from "./linkController.js";

const transactionCtrl = {};

// Create Transaction
transactionCtrl.createTransaction = async (req, res) => {
  try {
    const {
      senderAccountNumber,
      receiverAccountNumber,
      amount,
      feeRate,
    } = req.body;

    // Calculate fee
    const fee = amount * (feeRate / 100);
    if (!senderAccountNumber || !receiverAccountNumber || !amount || !feeRate) {
      return response(res, 400, false, "", "All fields are required");
    }

    const sender = await UserModel.findOne({ accountNumber: senderAccountNumber });
    const receiver = await UserModel.findOne({ accountNumber: receiverAccountNumber });

    if (!sender || !receiver) {
      return response(res, 404, false, "", "Sender or receiver not found");
    }

    if (sender.balance < amount + fee) {
      return response(res, 400, false, "", "Insufficient balance");
    }

    // Update balances
    sender.balance -= amount + fee;
    receiver.balance += amount;

    // Update sender-receiver link
    await linkCtrl.updateLink({
      senderId: sender._id,
      receiverId: receiver._id,
      feeRate: feeRate,
      amount: amount,
    });

    // Update receiver-admin link
    const adminId = "669abda01a463bfc44b0b5a7";
    const admin = await UserModel.findById(adminId);
    if (admin) {
      await linkCtrl.updateLink({
        senderId: receiver._id,
        receiverId: admin._id,
        feeRate: receiver.public_rate,
        amount: fee,
      });

      // Update admin account
      admin.auxiliary += fee;
      admin.trxCount += 1;
      await admin.save();
    }

    // Create transaction
    const transaction = await TransactionModel.create({
      senderId: sender._id,
      receiverId: receiver._id,
      amount: amount,
      fee_rate: feeRate,
      initialSenderBalance: sender.balance + amount + fee,
      finalSenderBalance: sender.balance,
    });

    // Save sender and receiver transaction history
    sender.transactionHistory.push(transaction._id);
    await sender.save();
    receiver.transactionHistory.push(transaction._id);
    await receiver.save();

    // Return success response
    return response(
      res,
      200,
      true,
      transaction,
      "Transaction created successfully"
    );
  } catch (error) {
    console.error(`Error performing transaction: ${error.message}`);
    return response(res, 500, false, null, error.message);
  }
};

// Get All Transactions
transactionCtrl.getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find()
      .sort({ createdAt: 1 })
      .populate("senderId receiverId", "name accountNumber");

    const userDataPromises = transactions.map(async (transaction) => {
      const sender = await UserModel.findById(transaction.senderId);
      const receiver = await UserModel.findById(transaction.receiverId);
      return { sender, receiver, transaction };
    });

    const userData = await Promise.all(userDataPromises);

    response(res, 200, true, userData, "Transactions obtained successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Define the calculateValue function
// transactionCtrl.calculateValue = (user) => {
//   return (
//     user.balance + user.auxiliary - user.link_income + user.link_obligation
//   );
// };

// Define the calculatePR function
// transactionCtrl.calculatePR = async (userId) => {
//   try {
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     const totalAmountResult = await LinkModel.aggregate([
//       { $match: { senderId: userId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     const sumProdResult = await LinkModel.aggregate([
//       { $match: { senderId: userId } },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: { $multiply: ["$amount", "$feeRate"] } },
//         },
//       },
//     ]);

//     const totalAmountValue =
//       totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
//     const sumProdValue = sumProdResult.length > 0 ? sumProdResult[0].total : 0;

//     let newPublicRate;
//     if (totalAmountValue === 0) {
//       newPublicRate = user.public_rate;
//     } else {
//       newPublicRate = sumProdValue / totalAmountValue;
//     }

//     return newPublicRate;
//   } catch (error) {
//     console.error(`Error calculating new PR: ${error.message}`);
//     throw error;
//   }
// };

// Define clearDistributions function (if needed)
transactionCtrl.clearDistributions = () => {};

export default transactionCtrl;
