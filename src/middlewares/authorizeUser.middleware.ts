// Import Package
import _ from "lodash";

// Import Types
import { Request, Response, NextFunction } from "express";

// Authorized User
function authorizeUser(req: Request, res: Response, next: NextFunction) {
  // Get User
  const user = _.get(req, "user");

  // If User Not Found
  if (!user) return res.status(403).json({ message: "Unauthorized" });

  // Return
  return next();
}
function authorizeUserOptional(req: Request, res: Response, next: NextFunction) {
  // Get User
  const user = _.get(req, "user");
  // Return
  return next();
}

// Export
export {authorizeUser, authorizeUserOptional};
