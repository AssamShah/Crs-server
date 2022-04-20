// Import Package
import mongoose from "mongoose";

// Import Interface
import SessionDocument from "../interfaces/session.interface";

// Session Schema
const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    valid: { type: Boolean, default: true },
    userAgent: String,
  },
  { timestamps: true }
);

// Session Model
const Session = mongoose.model<SessionDocument>("Session", sessionSchema);

// Exports
export { sessionSchema, Session };
