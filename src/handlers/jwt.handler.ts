// Import Package
import jwt from "jsonwebtoken";
import _ from "lodash";

// Import Type
import { SignOptions } from "jsonwebtoken";

// Import Interface
import UserDocument from "../interfaces/user.interface";

// Import Model
import { Session } from "../models/session.model";
import User from "../models/user.model";

// Import Config
const recoveryTokenTTL = process.env.RECOVERY_TOKEN_TTL as string;
const privateKey = process.env.PRIVATE_KEY as string;
const host = process.env.HOST as string;
const port = process.env.PORT as string;

// Sign Session & Generate JWT
function signAndGenerateJWT(data: Object, options?: SignOptions | undefined) {
  return jwt.sign(data, privateKey, options);
}

// Decode JWT
function decodeToken(token: string) {
  try {
    const decoded = jwt.verify(token, privateKey);
    return { valid: true, expired: false, decoded };
  } catch (err: any) {
    return { valid: false, expired: err.message === "jwt expired", decoded: null };
  }
}

// ReIssue Token
async function reIssueAccessToken(refreshToken: string) {
  // Decoded Refresh Token
  const { decoded } = decodeToken(refreshToken);
  if (!decoded || !_.get(decoded, "_id")) return false;

  // Get Session
  const session = await Session.findById(_.get(decoded, "_id"));

  // Validate Session
  if (!session || !session?.valid) return false;

  // Fetch User
  const user = await User.findById({ _id: _.get(session, "user") });
  if (!user) return false;

  // Access Token
  const accessToken = signAndGenerateJWT({ user, session });

  // Return
  return accessToken;
}

// Generate Recovery Token
function generateRecoveryLink(fetchedUser: UserDocument) {
  // Creating User Data to be Encoded
  const userInformation = { email: _.get(fetchedUser, "email"), id: _.get(fetchedUser, "_id") };

  // One-Time Secret
  const secret = privateKey + _.get(fetchedUser, "password");

  // Generating Token
  const token = jwt.sign(userInformation, secret, { expiresIn: recoveryTokenTTL });

  // Creating Recovery Link
  const recoveryLink = `http://${host}:${port}/user/recovery/${_.get(fetchedUser, "_id")}/${token}`;

  // Return
  return recoveryLink;
}

// Validate Recovery Token
function validateRecoveryToken(fetchedUser: UserDocument, token: string) {
  // One-Time Secret
  const secret = privateKey + _.get(fetchedUser, "password");

  try {
    jwt.verify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

// Exports
export { signAndGenerateJWT, decodeToken, reIssueAccessToken, generateRecoveryLink, validateRecoveryToken };
