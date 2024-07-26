import { UserModel } from "../models/userModel.js";
import { TransactionModel } from "../models/transactionModel.js";
import { LinkModel } from "../models/linkModel.js";
import { response } from "../helpers/Response.js";
import linkCtrl from "./linkController.js";

const transactionCtrl = {};

// Initialize users
const initializeUsers = async () => {
  try {
    // Delete all transactions
    await TransactionModel.deleteMany({});

    // Delete all links
    await LinkModel.deleteMany({});

    // Update all users
    await UserModel.updateMany(
      {},
      {
        $set: {
          balance: 1000,
          value: 1000,
          public_rate: 10,
          link_obligation: 0,
          link_income: 0,
          auxiliary: 0,
          trigger: 0,
          trxCount: 0,
          transactionHistory: [], // Clear transaction history
        },
      }
    );

    // Update admin user separately
    await UserModel.updateOne(
      { _id: "669abda01a463bfc44b0b5a7" },
      {
        $set: {
          balance: 1000,
          value: 1000,
          public_rate: 10,
          link_obligation: 0,
          link_income: 0,
          auxiliary: 0,
          trigger: 2,
          trxCount: 0,
          transactionHistory: [], // Clear transaction history
        },
      }
    );

    console.log("Users initialized successfully.");
  } catch (error) {
    console.error(`Error initializing users: ${error.message}`);
  }
};

// Call initializeUsers to set initial values
initializeUsers();

// Create Transaction
transactionCtrl.createTransaction = async (req, res) => {
  try {
    const { senderAccountNumber, receiverAccountNumber, amount, feeRate } = req.body;

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

    // Clear pending distributions if necessary
    await transactionCtrl.clearPendingDistributions();

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
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ["$amount", "$feeRate"] } },
      },
    },
  ]);

  const totalAmountValue = totalAmount[0]?.total || 0;
  const sumProdValue = sumProd[0]?.total || 0;

  if (totalAmountValue === 0) {
    return user.public_rate;
  } else {
    return sumProdValue / totalAmountValue;
  }
};

// Clear pending distributions
transactionCtrl.clearPendingDistributions = async () => {
  try {
    const users = await UserModel.find({});

    // Log the users obtained from the query
    console.log("All users:", users);

    const usersWithPendingDistributions = users.filter(user => user.trxCount >= user.trigger + 1);

    // Log the users that meet the condition
    console.log("Users with pending distributions:", usersWithPendingDistributions);

    for (const user of usersWithPendingDistributions) {
      await transactionCtrl.Distribute(user);
    }
  } catch (error) {
    console.error(`Error clearing pending distributions: ${error.message}`);
  }
};

// Distribute function (to be implemented as needed)
transactionCtrl.Distribute = async (user) => {
  try {
    console.log('Distributing for user:', user._id);

    const distributionAmount = user.auxiliary;

    // Identify all links where the user is the receiver
    const links = await LinkModel.find({ receiverId: user._id });

    let totalPR = 0;
    const participants = [];

    // Sum up PR values for each participant
    for (const link of links) {
      const participant = await UserModel.findById(link.senderId);
      totalPR += participant.public_rate;
      console.log(participant.public_rate);
      participants.push(participant);
    }

    // Check if the user should also be considered as a participant
    if (user.balance < user.value) {
      participants.push(user);
      totalPR += user.public_rate;
    }

    // Calculate and distribute shares for each participant
    for (const participant of participants) {
      const pr = participant.public_rate > 0 ? participant.public_rate : 10; // Assuming a minimum PR of 10

      const share = distributionAmount * (pr / totalPR);
      console.log('Share for', participant.name, ':', share);

      if (share > 0) {
        console.log(share, 'goes to', participant.name);
        await transactionCtrl.createDistributionTransaction(user, participant, share);
      }
    }

    // Reset transaction count (trxCount) to zero after distribution
    user.trxCount = 0;
    await user.save();
  } catch (error) {
    console.error(`Error distributing for user: ${user._id}`, error.message);
  }
};

// Create a distribution transaction
transactionCtrl.createDistributionTransaction = async (distributor, recipient, share) => {
  try {
    // Update balances of distributor and recipient
    distributor.balance -= share;
    recipient.balance += share;

    // Save updated balances
    await distributor.save();
    await recipient.save();

    // Create and save the distribution transaction record
    const transaction = await TransactionModel.create({
      senderName: distributor.name,
      receiverName: recipient.name,
      senderId: distributor._id,
      receiverId: recipient._id,
      amount: share,
      fee_rate: 0,  // No fee for distribution transactions
      initialSenderBalance: distributor.balance + share,
      finalSenderBalance: distributor.balance,
    });

    // Add transaction ID to transaction histories
    distributor.transactionHistory.push(transaction._id);
    recipient.transactionHistory.push(transaction._id);
    await distributor.save();
    await recipient.save();

    console.log('Distribution transaction created successfully:', transaction._id);
  } catch (error) {
    console.error('Error creating distribution transaction:', error.message);
  }
};

// Get all transactions
transactionCtrl.getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find().populate('senderId receiverId');
    return response(res, 200, true, transactions, "List of all transactions");
  } catch (error) {
    console.error(`Error retrieving transactions: ${error.message}`);
    return response(res, 500, false, "", "Error retrieving transactions");
  }
};

export default transactionCtrl;