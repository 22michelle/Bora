import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";

const transactionCtrl = {};

// Helper function to calculate fee
transactionCtrl.calculateFee = (amount, feePercentage) => {
  return amount * (feePercentage / 100);
};

// Function to handle the distribution logic
transactionCtrl.distributeAmount = async (from, to, amount, feePercentage) => {
  try {
    let remainingAmount = amount;

    while (remainingAmount > 0) {
      const sender = await UserModel.findById(from);
      const receiver = await UserModel.findOne({ accountNumber: to });

      if (!sender || !receiver) {
        throw new Error(`User with account ${from} or ${to} not found`);
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
    await transactionCtrl.distributeAmount(sender._id, receiver.accountNumber, amount, feePercentage);

    response(res, 200, true, null, "Transaction successful");
  } catch (error) {
    console.error(`Error performing transaction: ${error.message}`);
    response(res, 500, false, null, error.message);
  }
};

// Controller method to get all transactions
transactionCtrl.getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find().populate('senderId receiverId', 'name accountNumber');
    response(res, 200, true, transactions, "Transactions obtained successfully");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

export default transactionCtrl;
