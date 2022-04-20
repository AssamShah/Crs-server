// Import Type
import { Document } from "mongoose";

// Import Interface
import UserDocument from "./user.interface";

// Session Interface
interface SessionDocument extends Document {
  user: UserDocument["_id"];
  valid: Boolean;
  userAgent: String;
  createdAt: Date;
  updatedAt: Date;
}

// Exports
export default SessionDocument;
