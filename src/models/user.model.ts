// Import Package
import mongoose from "mongoose";

// Import Interface
import UserDocument from "../interfaces/user.interface";

var ObjectId = require("mongodb").ObjectId;

// Import Schemas
import { type } from "os";

// Defining User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    about: String,
    profileImage: String,
    coverImage: String,
    userTotalEarnedSeed: { type: Number, default: 0 },
    userSeedPercentChange: { type: Number, default: 0 },
    userSeedChangeDifference: { type: Number, default: 0 },
    userTotalItemsSold: { type: Number, default: 0 },
    userTotalComments: { type: Number, default: 0 },
    userComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    userTotalLikes: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    followingUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isFollowing: { type: Boolean, default: false },
    isFollower: { type: Boolean, default: false },
    isFriend: { type: Boolean, default: false },
    isMatchedDonator: { type: Boolean, default: false },
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
    },
    followingUsersAmount: { type: Number, default: 0 },
    followersAmount: { type: Number, default: 0 },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    userBlockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    userItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    totalDonatedSeed: { type: Number, default: 0 },
    userTotalDonatedSeedPercentChange: { type: Number, default: 0 },
    userTotalDonatedSeedDifference: { type: Number, default: 0 },
    userTotalPosts: { type: Number, default: 0 },
    userTotalPostsPercentChange: { type: Number, default: 0 },
    userTotalPostsDifference: { type: Number, default: 0 },
    userDribbble: String,
    userBehance: String,
    userFacebook: String,
    userTwitter: String,
    userInstagram: String,
    userSite: String,
    userTiktok: String,
    isVerified: { type: Boolean, default: false },
    userNotifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    privacy: { type: String, enum: ["public", "private", "none", "donated"], default: "public" },
    lastPostTime: { type: Date, default: null },
    followRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "FollowRequest" }],
    followRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "FollowRequest" }],
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);


// User Model
const User = mongoose.model<UserDocument>("User", userSchema);

// Exports
export default User;
