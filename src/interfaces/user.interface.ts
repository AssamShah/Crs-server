// Import Type
import { Document } from "mongoose";

// Import Interfaces
import DonationLeaderboardDocument from "./donationLeaderboard.interface";
import ItemDocument from "./item.interface";
import CommentDocument from "./comment.interface";
import NotificationDocument from "./notification.interface";
import FollowRequestDocument from "./followRequest.interface";

// User Interface
interface UserDocument extends Document {
  userName: string;
  screenName: String;
  email: String;
  password: string;
  about: String;
  profileImage: String;
  coverImage: String;
  userTotalEarnedSeed: Number;
  userSeedPercentChange: Number;
  userSeedChangeDifference: Number;
  userTotalItemsSold: Number;
  userTotalComments: Number;
  userComments: [CommentDocument];
  userTotalLikes: Number;
  followingUsers: [UserDocument];
  followers: [UserDocument];
  followingUsersAmount: number;
  followersAmount: number;
  blockedUsers: [UserDocument];
  userBlockedBy: [UserDocument];
  userItems: ItemDocument["_id"];
  totalDonatedSeed: Number;
  userTotalDonatedSeedPercentChange: Number;
  userTotalDonatedSeedDifference: Number;
  userTotalPosts: Number;
  userTotalPostsPercentChange: Number;
  userTotalPostsDifference: Number;
  userDribbble: String;
  userBehance: String;
  userFacebook: String;
  userTwitter: String;
  userInstagram: String;
  donationLeaderboard: DonationLeaderboardDocument;
  isVerified: Boolean;
  userNotifications: [NotificationDocument];
  privacy: String;
  lastPostTime: Date;
  createdAt: Date;
  updatedAt: Date;
  isFollowing: boolean;
  isFollower: boolean;
  isFriend: boolean;
  isMatchedDonator: boolean;
  isFollowingUser: (user: any) => boolean;
  isFollowerUser: (user: any) => boolean;
  isFriendUser: (user: any) => boolean;
  isMatchedDonatorUser: (user: any) => boolean;
  getRelatedData: (user: any) => boolean;
  followRequestsSent: [FollowRequestDocument];
  followRequestsReceived: [FollowRequestDocument];
  isAdmin: boolean;
}

// Exports
export default UserDocument;
