// Import Package
import mongoose from "mongoose";

// Import Interface
import FollowRequestDocument from "../interfaces/followRequest.interface";

const followRequestSchema = new mongoose.Schema(
  {
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Declined"], default: "Pending" },
  },
  { timestamps: true }
);

//Model
const FollowRequest = mongoose.model<FollowRequestDocument>("FollowRequest", followRequestSchema);

//Exports
export { followRequestSchema, FollowRequest };
