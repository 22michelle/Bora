import { response } from "../helpers/Response.js";
import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";

const transactionCtrl = {};

transactionCtrl.performTransaction = async (req, res) => {
  try {
    const { senderAccountNumber, receiverAccountNumber, amount } = req.body;

    console.log("Sender Account Number:", senderAccountNumber);
    // console.log("Receiver Account Number:", receiverAccountNumber);
    // console.log("Amount: ", amount)

    const sender = await UserModel.findOne({ accountNumber: senderAccountNumber });
    const receiver = await UserModel.findOne({ accountNumber: receiverAccountNumber });

    // console.log("Sender:", sender);
    // console.log("Receiver:", receiver);

    if (!sender || !receiver) {
      return response(res, 404, false, "", "User not found");
    }
    if (sender.balance < amount) {
      return response(res, 400, false, "", "Insufficient balance");
    }

    // Create Transaction
    const transaction = new TransactionModel({
      senderAccountNumber: sender.accountNumber,
      receiverAccountNumber: receiver.accountNumber,
      amount: amount,
    });

    await transaction.save();

    // Update the user's balance
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    response(res, 200, true, "Transaction successful");
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

transactionCtrl.getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find();
    response(
      res,
      200,
      true,
      transactions,
      "Transaction obtained successfully"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

transactionCtrl.getUserTransactions = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const transactions = await TransactionModel.find({
      $or: [{ senderAccountNumber: accountNumber }, { receiverAccountNumber: accountNumber }],
    });
    response(
      res,
      200,
      true,
      transactions,
      "Transactions obtained successfully"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

transactionCtrl.deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await TransactionModel.findById(transactionId);

    if (!transaction) {
      return response(res, 404, false, "", "Transaction not found");
    }

    const sender = await UserModel.findOne({ accountNumber: transaction.senderAccountNumber });
    const receiver = await UserModel.findOne({ accountNumber: transaction.receiverAccountNumber });

    // Restore the balance of deleted users to their initial state
    sender.balance += transaction.amount;
    receiver.balance -= transaction.amount;

    await sender.save();
    await receiver.save();

    await TransactionModel.findByIdAndDelete(transactionId);
    response(
      res,
      200,
      true,
      null,
      "Transaction deleted successfully"
    );
  } catch (error) {
    response(res, 500, false, null, error.message);
  }
};

export default transactionCtrl;