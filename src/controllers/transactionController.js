import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";

const transactionCtrl = {};

// Helper function to calculate fee
transactionCtrl.calculateFee = (amount, feePercentage) => {
  return amount * (feePercentage / 100);
};

// Function to handle the distribution logic
transactionCtrl.distributeAmount = async (from, toAccountNumber, amount, feePercentage) => {
  try {
    let remainingAmount = amount;

    while (remainingAmount > 0) {
      const sender = await UserModel.findById(from);
      const receiver = await UserModel.findOne({ accountNumber: toAccountNumber });

      if (!sender || !receiver) {
        throw new Error(`User with account ${from} or ${toAccountNumber} not found`);
      }

      // Calculate the amount to be sent in this iteration
      const fee = transactionCtrl.calculateFee(remainingAmount, feePercentage);
      const transactionAmount = Math.min(sender.balance - fee, remainingAmount);

      if (transactionAmount <= 0) {
        throw new Error('Insufficient funds for the transaction after fee deduction');
      }

      // Create a new transaction record
      const newTransaction = new TransactionModel({
        senderId: sender._id,
        receiverId: receiver._id,
        amount: transactionAmount,
        feeRate: feePercentage,
        isDistributed: true,
      });
      await newTransaction.save();

      // Update sender's balance and transaction history
      await UserModel.findByIdAndUpdate(sender._id, {
        $inc: { balance: -1 * (transactionAmount + fee) },
        $push: { transactionHistory: newTransaction._id },
      });

      // Update receiver's balance and transaction history
      await UserModel.findByIdAndUpdate(receiver._id, {
        $inc: { balance: transactionAmount },
        $push: { transactionHistory: newTransaction._id },
      });

      remainingAmount -= transactionAmount;
    }
  } catch (error) {
    throw new Error(`Error distributing amount: ${error.message}`);
  }
};

// Controller method to perform transaction
transactionCtrl.performTransaction = async (req, res) => {
  try {
    const { senderAccountNumber, receiverAccountNumber, amount, feePercentage } = req.body;

    const sender = await UserModel.findOne({ accountNumber: senderAccountNumber });
    const receiver = await UserModel.findOne({ accountNumber: receiverAccountNumber });

    if (!sender || !receiver) {
      return response(res, 404, false, null, "Sender or receiver not found");
    }

    if (sender.balance < amount) {
      return response(res, 400, false, null, "Insufficient balance");
    }

    // Perform the transaction and update balances
    await transactionCtrl.distributeAmount(sender._id, receiverAccountNumber, amount, feePercentage);

    response(res, 200, true, null, "Transaction successful");
  } catch (error) {
    console.error(`Error performing transaction: ${error.message}`);
    response(res, 500, false, null, error.message);
  }
};

// Helper function to calculate additional user data
const calculateUserData = async (userId) => {
  const user = await UserModel.findById(userId);
  const outgoingTransactions = await TransactionModel.find({ senderId: userId });
  const incomingTransactions = await TransactionModel.find({ receiverId: userId });

  const sumOutgoing = outgoingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const sumIncoming = incomingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalFees = outgoingTransactions.reduce((sum, tx) => sum + transactionCtrl.calculateFee(tx.amount, tx.feeRate), 0);

  const outgoingLinks = outgoingTransactions.map(tx => ({
    amount: tx.amount,
    feeRate: tx.feeRate
  }));

  const incomingLinks = incomingTransactions.map(tx => ({
    amount: tx.amount,
    feeRate: tx.feeRate
  }));

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
    metabalance
  };
};

// Controller method to get all transactions and additional user data
transactionCtrl.getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find().populate('senderId receiverId', 'name accountNumber');

    const userDataPromises = transactions.map(async (transaction) => {
      const senderData = await calculateUserData(transaction.senderId._id);
      const receiverData = await calculateUserData(transaction.receiverId._id);

      return {
        transaction,
        sender: {
          name: transaction.senderId.name,
          balance: senderData.balance,
          sumOutgoing: senderData.sumOutgoing,
          sumIncoming: senderData.sumIncoming,
          outgoingLinks: senderData.outgoingLinks,
          totalOutgoingLinks: senderData.totalOutgoingLinks,
          metabalance: senderData.metabalance
        },
        receiver: {
          name: transaction.receiverId.name,
          balance: receiverData.balance,
          sumOutgoing: receiverData.sumOutgoing,
          sumIncoming: receiverData.sumIncoming,
          incomingLinks: receiverData.incomingLinks,
          totalIncomingLinks: receiverData.totalIncomingLinks,
          totalFees: receiverData.totalFees,
          metabalance: receiverData.metabalance
        }
      };
    });

    const userData = await Promise.all(userDataPromises);

    response(res, 200, true, userData, "Transactions obtained successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

export default transactionCtrl;