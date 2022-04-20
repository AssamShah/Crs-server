import { Notification } from "../models/notification.model";
import User from "../models/user.model";

//Create notification handler
async function createNotificationHandler(data: any) {
  try {
    const notification = new Notification(data);
    const result = await notification.save();
    const notificationId = result._id;
    const userId = data.notificationOwner;
    const user = await User.findByIdAndUpdate(userId, { $push: { userNotifications: notificationId } });
    return result;
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

export { createNotificationHandler };
