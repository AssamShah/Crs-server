// Import Type
import { Document } from "mongoose";
import mongoose from "mongoose";

// Import Interfaces
import UserDocument from "./user.interface";

interface FollowRequestDocument extends Document {
  to: UserDocument["_id"];
  from: UserDocument["_id"];
  status: String;
  createdAt: Date;
  updatedAt: Date;
}

//Exports
export default FollowRequestDocument;
