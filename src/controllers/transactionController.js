import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";

const transactionCtrl = {};

// Get all transactions
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

// Create Transaction
transactionCtrl.createTransaction = async (req, res) => {
  try {
    const {
      senderAccountNumber,
      receiverAccountNumber,
      amount,
      feeRate,
    } = req.body;

    if (!senderAccountNumber || !receiverAccountNumber || !amount || !feeRate) {
      return res
        .status(400)
        .json({ ok: false, message: "All fields are required" });
    }

    const sender = await UserModel.findOne({
      accountNumber: senderAccountNumber,
    });
    const receiver = await UserModel.findOne({
      accountNumber: receiverAccountNumber,
    });

    if (!sender || !receiver) {
      return res
        .status(404)
        .json({ ok: false, message: "Sender or receiver not found" });
    }

    if (sender.balance < amount) {
      return res
        .status(400)
        .json({ ok: false, message: "Insufficient balance" });
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

    sender.balance -= amount + fee;
    sender.public_rate = await transactionCtrl.calculateNewPR(sender);
    sender.value =
      sender.balance +
      sender.auxiliary -
      sender.link_income +
      sender.link_obligation;

    await sender.save();

    receiver.balance += amount;
    receiver.auxiliary += fee;
    receiver.trxCount += 1;
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

    // await transactionCtrl.clearPendingDistributions();

    return res
      .status(200)
      .json({ ok: true, data: transaction, message: "Transaction successful" });
  } catch (error) {
    console.error(`Error performing transaction: ${error.message}`);
    return res.status(500).json({ ok: false, message: error.message });
  }
};

// Define calculateNewPR function
transactionCtrl.calculateNewPR = async (user) => {
  try {
    if (!user.sentTransactions || !Array.isArray(user.sentTransactions)) {
      console.error("sentTransactions is not defined or not an array");
      return 0;
    }

    const totalAmount = user.sentTransactions.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );
    const sumProd = user.sentTransactions.reduce(
      (sum, transaction) =>
        sum + (transaction.amount || 0) * (transaction.fee_rate || 0),
      0
    );

    if (totalAmount === 0) {
      return 0;
    } else {
      return sumProd / totalAmount;
    }
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

    const metabalance = user.balance + totalFees + sumOutgoing - sumIncoming;

    return {
      balance: user.balance,
      sumOutgoing,
      sumIncoming,
      outgoingLinks,
      incomingLinks,
      totalFees,
      totalIncomingLinks: incomingLinks.length,
      totalOutgoingLinks: outgoingLinks.length,
      metabalance,
      link_obligation: user.link_obligation,
      link_income: user.link_income,
      value: user.value,
      public_rate: user.public_rate,
      auxiliary: user.auxiliary,
      trigger: user.trigger,
      trxCount: user.trxCount,
    };
  } catch (error) {
    console.error(`Error calculating user data: ${error.message}`);
    throw new Error(`Error calculating user data: ${error.message}`);
  }
};

// Calculate fee
transactionCtrl.calculateFee = (amount, feeRate) => {
  return amount * (feeRate / 100);
};

// Function to send amount to admin
transactionCtrl.sendToAdmin = async (amount) => {
  try {
    const account = await AccountModel.findById(1); // Assuming the admin account has ID 1

    if (!account) {
      throw new Error("Admin account not found");
    }

    account.balance += 0 * amount; // No change to balance
    account.auxiliary += 1 * amount; // Increment auxiliary by amount
    account.trxCount += 1; // Increment transaction count
    account.value = await transactionCtrl.calculateValue(account); // Calculate new value

    await account.save(); // Save changes to the database
  } catch (error) {
    console.error(`Error sending to admin: ${error.message}`);
    throw new Error(`Error sending to admin: ${error.message}`);
  }
};

// transactionCtrl.clearPendingDistributions = async () => {
//   try {
//     const pendingDistributions = await UserModel.find({
//       status: "pending",
//     });
//     for (const distribution of pendingDistributions) {
//       distribution.status = "cleared";
//       await distribution.save();
//     }
//   } catch (error) {
//     console.error(`Error clearing pending distributions: ${error.message}`);
//     throw new Error(`Error clearing pending distributions: ${error.message}`);
//   }
// };

export default transactionCtrl;
