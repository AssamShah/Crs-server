//Import Models
import { TransactionHistoryTable } from "../models/transactionHistoryTable.model";
import { SeedWallet } from "../models/seedWallet.model";

// Import Handlers
import { createNotificationHandler } from "../handlers/notification.handler";
//Create transaction handler
async function createTransactionHandler(data: any) {
  try {
    //Get wallets
    const toWallet: any = await SeedWallet.findOne({ walletOwner: data.to });
    const fromWallet: any = await SeedWallet.findOne({ walletOwner: data.from });

    if (!toWallet || !fromWallet) {
      return { statusCode: 404, message: "Wallet not found" };
    }

    //Get transfer amount
    const transferAmount = data.transactionAmount;

    //If funds not available throw a 400 error
    if (fromWallet.seedAmount < transferAmount) {
      return { statusCode: 400, message: "Insufficient funds" };
    }

    //Update wallets
    fromWallet.seedAmount -= transferAmount;
    toWallet.seedAmount += transferAmount;
    const updatedFromWallet = await fromWallet.save();
    const updatedToWallet = await toWallet.save();

    const transaction = new TransactionHistoryTable(data);
    const result = await transaction.save();

    //Send Notification
    const notificationData = {
      notificationTitle: "Transaction Successfully Created",
      notificationCaller: result._id,
      notificationType: "Transaction",
      notificationOwner: data.from,
    };
    const notification = await createNotificationHandler(notificationData);

    const notificationData2 = {
      notificationTitle: "Transaction Successfully Recieved",
      notificationCaller: result._id,
      notificationType: "Transaction",
      notificationOwner: data.to,
    };
    const notification2 = await createNotificationHandler(notificationData2);

    return { transaction: result, statusCode: 201 };
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

export { createTransactionHandler };
