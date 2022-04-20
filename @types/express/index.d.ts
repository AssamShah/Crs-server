// Import Interface
import UserDocument from "../../src/interfaces/user.interface";

// Extending Interface
declare global {
  namespace Express {
    interface Request {
      user: UserDocument | JwtPayload;
    }
  }
}
