import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";
import linkCtrl from "./linkController.js";
import { LinkModel } from "../models/linkModel.js";

const transactionCtrl = {};

// Get All Transactions
transactionCtrl.getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find()
      .sort({ createdAt: 1 })
      .populate("senderId receiverId", "name accountNumber");

    const userDataPromises = transactions.map(async (transaction) => {
      const senderData = await transactionCtrl.calculateUserData(
        transaction.senderId._id
      );
      const receiverData = await transactionCtrl.calculateUserData(
        transaction.receiverId._id
      );

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

// Define calculateValue function
transactionCtrl.calculateValue = (sender) => {
  return sender.balance +
         sender.auxiliary -
         sender.link_income +
         sender.link_obligation;
};

// Create transaction
transactionCtrl.createTransaction = async (req, res) => {
  try {
    const {
      senderAccountNumber,
      receiverAccountNumber,
      amount,
      feeRate,
    } = req.body;

    if (!senderAccountNumber || !receiverAccountNumber || !amount || !feeRate) {
      return response(res, 400, false, "", "All fields are required");
    }

    const sender = await UserModel.findOne({
      accountNumber: senderAccountNumber,
    });
    const receiver = await UserModel.findOne({
      accountNumber: receiverAccountNumber,
    });

    if (!sender || !receiver) {
      return response(res, 404, false, "", "Sender or receiver not found");
    }

    if (sender.balance < amount) {
      return response(res, 400, false, "", "Insufficient balance");
    }

    const fee = amount * (feeRate / 100);
    const initialSenderBalance = sender.balance;
    const finalSenderBalance = sender.balance - (amount + fee);

    const transaction = await TransactionModel.create({
      senderId: sender._id,
      receiverId: receiver._id,
      amount: amount,
      fee_rate: feeRate,
      initialSenderBalance: initialSenderBalance,
      finalSenderBalance: finalSenderBalance,
    });

    // Crear o actualizar el enlace después de crear la transacción
    const linkUpdateResponse = await linkCtrl.updateLink({
      body: {
        senderId: sender._id,
        receiverId: receiver._id,
        feeRate: feeRate,
        amount: amount,
      },
    });

    sender.balance -= amount + fee;
    const senderData = await transactionCtrl.calculateUserData(sender._id);
    sender.public_rate = await transactionCtrl.calculatePR(sender);
    sender.link_obligation = senderData.sumOutgoing;
    sender.link_income = senderData.sumIncoming;
    sender.value = transactionCtrl.calculateValue(sender); // Use the new function

    await sender.save();

    receiver.balance += amount;
    const receiverData = await transactionCtrl.calculateUserData(receiver._id);
    receiver.link_obligation = receiverData.sumOutgoing;
    receiver.link_income = receiverData.sumIncoming;
    receiver.value =
      receiver.balance +
      receiver.auxiliary -
      receiver.link_income +
      receiver.link_obligation;

    await receiver.save();

    // Update transactionHistory for both sender and receiver
    sender.transactionHistory.push(transaction._id);
    receiver.transactionHistory.push(transaction._id);

    await sender.save();
    await receiver.save();

    // Solo aumenta el trigger si se ha creado un nuevo enlace
    if (
      linkUpdateResponse.success &&
      linkUpdateResponse.message === "Link created successfully"
    ) {
      receiver.trigger += 1;
      await receiver.save();
    }

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


// Define calculatePR function
transactionCtrl.calculatePR = async (userId) => {
  try {
    // Fetch user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Calculate the totalAmount by summing up amounts of outbound links
    const totalAmountResult = await LinkModel.aggregate([
      { $match: { senderId: userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Calculate sumProd by summing up the product of amounts and fee rates of outbound links
    const sumProdResult = await LinkModel.aggregate([
      { $match: { senderId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$amount", "$feeRate"] } },
        },
      },
    ]);

    const totalAmountValue =
      totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
    const sumProdValue = sumProdResult.length > 0 ? sumProdResult[0].total : 0;

    console.log("Total sum of Lo (totalAmount):", totalAmountValue);
    console.log("Amount * Fee (sumProd):", sumProdValue);

    // Calculate newPR
    let newPublicRate;
    if (totalAmountValue === 0) {
      newPublicRate = user.public_rate; // Fallback to the current rate if no outgoing links
    } else {
      newPublicRate = sumProdValue / totalAmountValue;
    }

    console.log("New Public Rate:", newPublicRate);
    return newPublicRate;
  } catch (error) {
    console.error(`Error calculating new PR: ${error.message}`);
    throw new Error(`Error calculating new PR: ${error.message}`);
  }
};

// Calculate userData
transactionCtrl.calculateUserData = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    const outgoingTransactions = await TransactionModel.find({
      senderId: userId,
    }).populate("receiverId", "name _id");
    const incomingTransactions = await TransactionModel.find({
      receiverId: userId,
    }).populate("senderId", "name _id");

    const sumOutgoing = outgoingTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    const sumIncoming = incomingTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    const totalFees = outgoingTransactions.reduce(
      (sum, tx) => sum + transactionCtrl.calculateFee(tx.amount, tx.fee_rate),
      0
    );

    // Aggregate outgoing links by receiverId
    const outgoingLinksMap = outgoingTransactions.reduce((acc, tx) => {
      const key = tx.receiverId._id.toString();
      if (!acc[key]) {
        acc[key] = {
          receiverId: tx.receiverId._id,
          receiverName: tx.receiverId.name,
          amount: 0,
          feeRate: tx.fee_rate,
        };
      }
      acc[key].amount += tx.amount;
      return acc;
    }, {});

    const outgoingLinks = Object.values(outgoingLinksMap);

    // Aggregate incoming links by senderId
    const incomingLinksMap = incomingTransactions.reduce((acc, tx) => {
      const key = tx.senderId._id.toString();
      if (!acc[key]) {
        acc[key] = {
          senderId: tx.senderId._id,
          senderName: tx.senderId.name,
          amount: 0,
          feeRate: tx.fee_rate,
        };
      }
      acc[key].amount += tx.amount;
      return acc;
    }, {});

    const incomingLinks = Object.values(incomingLinksMap);

    const metabalance = user.balance + sumIncoming - sumOutgoing;

    const userData = {
      balance: user.balance,
      sumOutgoing,
      sumIncoming,
      outgoingLinks,
      totalOutgoingLinks: outgoingLinks.length,
      incomingLinks,
      totalIncomingLinks: incomingLinks.length,
      totalFees,
      metabalance,
      link_obligation: user.link_obligation,
      link_income: user.link_income,
      value: user.value,
      public_rate: user.public_rate,
      auxiliary: user.auxiliary,
      trigger: user.trigger,
      trxCount: user.transactionHistory.length,
    };

    return userData;
  } catch (error) {
    console.error(`Error calculating user data: ${error.message}`);
    throw new Error(`Error calculating user data: ${error.message}`);
  }
};

// Calculate fee
transactionCtrl.calculateFee = (amount, feeRate) => {
  return amount * (feeRate / 100);
};

export default transactionCtrl;
