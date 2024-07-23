import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";
import linkCtrl from "./linkController.js";
import mongoose from "mongoose";
import { LinkModel } from "../models/linkModel.js";

const transactionCtrl = {};

// Get All Transactions
transactionCtrl.getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find()
      .sort({ createdAt: 1 })
      .populate("senderId receiverId", "name accountNumber");

    const userDataPromises = transactions.map(async (transaction) => {
      const senderData = await transactionCtrl.calculateUserData(transaction.senderId._id);
      const receiverData = await transactionCtrl.calculateUserData(transaction.receiverId._id);

      return {
        transaction,
        sender: {
          name: transaction.senderId.name,
          balance: senderData.balance,
          initialBalance: transaction.initialSenderBalance,
          finalBalance: transaction.finalSenderBalance,
          sumOutgoing: senderData.sumOutgoing,
          sumIncoming: senderData.sumIncoming,
          outgoingLinks: senderData.outgoingLinks,
          totalOutgoingLinks: senderData.totalOutgoingLinks,
          metabalance: senderData.metabalance,
          link_obligation: senderData.link_obligation,
          link_income: senderData.link_income,
          value: senderData.value,
          public_rate: senderData.public_rate,
          auxiliary: senderData.auxiliary,
          trigger: senderData.trigger,
          trxCount: senderData.trxCount,
        },
        receiver: {
          name: transaction.receiverId.name,
          balance: receiverData.balance,
          sumOutgoing: receiverData.sumOutgoing,
          sumIncoming: receiverData.sumIncoming,
          incomingLinks: receiverData.incomingLinks,
          totalIncomingLinks: receiverData.totalIncomingLinks,
          totalFees: receiverData.totalFees,
          metabalance: receiverData.metabalance,
          link_obligation: receiverData.link_obligation,
          link_income: receiverData.link_income,
          value: receiverData.value,
          public_rate: receiverData.public_rate,
          auxiliary: receiverData.auxiliary,
          trigger: receiverData.trigger,
          trxCount: receiverData.trxCount,
        },
      };
    });

    const userData = await Promise.all(userDataPromises);

    response(res, 200, true, userData, "Transactions obtained successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

// Define the calculateValue function
transactionCtrl.calculateValue = (user) => {
  return user.balance + user.auxiliary - user.link_income + user.link_obligation;
};

// Create Transaction
transactionCtrl.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { senderAccountNumber, receiverAccountNumber, amount, feeRate } = req.body;

    if (!senderAccountNumber || !receiverAccountNumber || !amount || !feeRate) {
      return response(res, 400, false, "", "All fields are required");
    }

    const sender = await UserModel.findOne({ accountNumber: senderAccountNumber }).session(session);
    const receiver = await UserModel.findOne({ accountNumber: receiverAccountNumber }).session(session);

    if (!sender || !receiver) {
      return response(res, 404, false, "", "Sender or receiver not found");
    }

    if (sender.balance < amount) {
      return response(res, 400, false, "", "Insufficient balance");
    }

    // Calculate fee
    const fee = amount * (feeRate / 100);

    const initialSenderBalance = sender.balance;
    const finalSenderBalance = sender.balance - (amount + fee);

    const transaction = await TransactionModel.create(
      [
        {
          senderId: sender._id,
          receiverId: receiver._id,
          amount: amount,
          fee_rate: feeRate,
          initialSenderBalance: initialSenderBalance,
          finalSenderBalance: finalSenderBalance,
        },
      ],
      { session }
    );

    // Create or update the link after creating the transaction
    const linkUpdateResponse = await linkCtrl.updateLink({
      senderId: sender._id,
      receiverId: receiver._id,
      feeRate: feeRate,
      amount: amount,
    });

    // Update sender's balance and obligations
    sender.balance -= amount + fee;
    const senderData = await transactionCtrl.calculateUserData(sender._id);
    sender.public_rate = await transactionCtrl.calculatePR(sender._id);
    sender.link_obligation = senderData.sumOutgoing;
    sender.link_income = senderData.sumIncoming;
    sender.value = transactionCtrl.calculateValue(sender);

    await sender.save({ session });

    receiver.balance += amount;
    const receiverData = await transactionCtrl.calculateUserData(receiver._id);
    receiver.link_obligation = receiverData.sumOutgoing;
    receiver.link_income = receiverData.sumIncoming;
    receiver.value = transactionCtrl.calculateValue(receiver);

    await receiver.save({ session });

    sender.transactionHistory.push(transaction._id);
    receiver.transactionHistory.push(transaction._id);

    await sender.save({ session });
    await receiver.save({ session });

    if (linkUpdateResponse.success && linkUpdateResponse.message === "Link created successfully") {
      receiver.trigger += 1;
      await receiver.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return response(res, 200, true, transaction, "Transaction created successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Error performing transaction: ${error.message}`);
    return response(res, 500, false, null, error.message);
  }
};

// Define the calculatePR function
transactionCtrl.calculatePR = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const totalAmountResult = await LinkModel.aggregate([
      { $match: { senderId: userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const sumProdResult = await LinkModel.aggregate([
      { $match: { senderId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$amount", "$feeRate"] } },
        },
      },
    ]);

    const totalAmountValue = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
    const sumProdValue = sumProdResult.length > 0 ? sumProdResult[0].total : 0;

    console.log("Total sum of Lo (totalAmount):", totalAmountValue);
    console.log("Amount * Fee (sumProd):", sumProdValue);

    let newPublicRate;
    if (totalAmountValue === 0) {
      newPublicRate = user.public_rate;
    } else {
      newPublicRate = sumProdValue / totalAmountValue;
    }

    console.log("New Public Rate:", newPublicRate);
    return newPublicRate;
  } catch (error) {
    console.error(`Error calculating new PR: ${error.message}`);
    throw error;
  }
};

transactionCtrl.calculateUserData = async (userId) => {
  const user = await UserModel.findById(userId);
  const outgoingLinks = await LinkModel.find({ senderId: userId });
  const incomingLinks = await LinkModel.find({ receiverId: userId });
  const sumOutgoing = outgoingLinks.reduce((sum, link) => sum + link.amount, 0);
  const sumIncoming = incomingLinks.reduce((sum, link) => sum + link.amount, 0);
  const metabalance = user.balance + user.auxiliary - sumIncoming + sumOutgoing;

  return {
    balance: user.balance,
    sumOutgoing,
    sumIncoming,
    outgoingLinks,
    totalOutgoingLinks: outgoingLinks.length,
    incomingLinks,
    totalIncomingLinks: incomingLinks.length,
    metabalance,
    link_obligation: sumOutgoing,
    link_income: sumIncoming,
    value: transactionCtrl.calculateValue(user),
    public_rate: user.public_rate,
    auxiliary: user.auxiliary,
    trigger: user.trigger,
    trxCount: user.trxCount,
  };
};

// Define sendToAdmin function
transactionCtrl.sendToAdmin = async (amount) => {
  const adminAccount = await UserModel.findById(1);
  if (adminAccount) {
    adminAccount.balance += 0 * amount;
    adminAccount.auxiliary += 1 * amount;
    adminAccount.trxCount += 1;
    adminAccount.value = transactionCtrl.calculateValue(adminAccount);
    await adminAccount.save();
  }
};

export default transactionCtrl;
