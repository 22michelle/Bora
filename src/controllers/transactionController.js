import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";
import { LinkModel } from "../models/linkModel.js";
import linkCtrl from "./linkController.js";

const transactionCtrl = {};

// Initialize users
const initializeUsers = async () => {
  await UserModel.updateMany({}, { $set: { public_rate: 10 } });
  await UserModel.updateOne({ _id: "669abda01a463bfc44b0b5a7" }, { $set: { trigger: 3 } });
};
initializeUsers();

// Create Transaction
transactionCtrl.createTransaction = async (req, res) => {
  try {
    const {
      senderAccountNumber,
      receiverAccountNumber,
      amount,
      feeRate,
    } = req.body;

    // Validate required fields
    if (!senderAccountNumber || !receiverAccountNumber || !amount || !feeRate) {
      return response(res, 400, false, "", "All fields are required");
    }

    // Calculate fee
    const fee = amount * (feeRate / 100);

    // Find sender and receiver
    const sender = await UserModel.findOne({
      accountNumber: senderAccountNumber,
    });
    const receiver = await UserModel.findOne({
      accountNumber: receiverAccountNumber,
    });

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
      senderName: sender.name,
      receiverName: receiver.name,
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
        senderName: receiver.name,
        receiverName: admin.name,
        senderId: receiver._id,
        receiverId: admin._id,
        feeRate: receiver.public_rate,
        amount: fee,
      });

      // Update admin account
      admin.auxiliary += fee;
      admin.trxCount += 1;
      admin.value = await transactionCtrl.calculateValue(admin);
      await admin.save();
    }

    // Create transaction
    const transaction = await TransactionModel.create({
      senderName: sender.name,
      receiverName: receiver.name,
      senderId: sender._id,
      receiverId: receiver._id,
      amount: amount,
      fee_rate: feeRate,
      initialSenderBalance: sender.balance + amount + fee,
      finalSenderBalance: sender.balance,
    });

    // Calculate value for sender and receiver
    sender.value = await transactionCtrl.calculateValue(sender);
    receiver.value = await transactionCtrl.calculateValue(receiver);

    // Calculate PR for sender
    sender.public_rate = await transactionCtrl.calculatePR(sender);

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

// Calculate value for a user
transactionCtrl.calculateValue = async (user) => {
  const linkObligation = await LinkModel.aggregate([
    { $match: { senderId: user._id } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const linkIncome = await LinkModel.aggregate([
    { $match: { receiverId: user._id } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalObligation = linkObligation[0]?.total || 0;
  const totalIncome = linkIncome[0]?.total || 0;

  return user.balance + user.auxiliary + totalObligation - totalIncome;
};

// Calculate public rate for a user
transactionCtrl.calculatePR = async (user) => {
  const totalAmount = await LinkModel.aggregate([
    { $match: { senderId: user._id } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const sumProd = await LinkModel.aggregate([
    { $match: { senderId: user._id } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$amount", "$feeRate"] } } } },
  ]);

  const totalAmountValue = totalAmount[0]?.total || 0;
  const sumProdValue = sumProd[0]?.total || 0;

  if (totalAmountValue === 0) {
    return user.public_rate;
  } else {
    return sumProdValue / totalAmountValue;
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

    return response(
      res,
      200,
      true,
      userData,
      "Transactions obtained successfully"
    );
  } catch (error) {
    console.error(`Error fetching transactions: ${error.message}`);
    return response(res, 500, false, null, error.message);
  }
};

export default transactionCtrl;
