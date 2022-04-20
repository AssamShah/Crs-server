// Import Package
import _ from "lodash";

// Import Types
import { NextFunction, Request, Response } from "express";

// Import Model
import User from "../models/user.model";

// Import Handler
import { decodeToken, reIssueAccessToken } from "../handlers/jwt.handler";

// Validate & Deserialize User
async function deserializeUser(req: Request, res: Response, next: NextFunction) {
  // Get Access Token
  const accessToken = _.get(req, "headers.authorization", "").replace(/^Bearer\s/, "") as string;

  // Get Refresh Token
  const refreshToken = _.get(req, "headers.x-refresh") as string;

  // If Access Token
  if (!accessToken) return next();

  // Decode Access Token
  const { decoded, expired } = decodeToken(accessToken);

  // If Decoded
  if (decoded) {
    const userId = _.get(decoded, "_id") || _.get(decoded, "user._id");
    req.user = await User.findById(userId);
    return next();
  }

  // Validate Session & Regenerate Access Token
  if (expired && refreshToken) {
    // ReIssue Refresh Token
    const newAccessToken = await reIssueAccessToken(refreshToken);
    // If New Access Token Generated
    if (newAccessToken) {
      // Set Request Headers
      res.setHeader("x-access-token", newAccessToken);
      const { decoded } = decodeToken(newAccessToken);
      req.user = await User.findById(_.get(decoded, "_id"));
    }
    return next();
  }

  // Return
  return next();
}

// Export
export default deserializeUser;
