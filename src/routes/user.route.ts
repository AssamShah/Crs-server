// Import Package
import express from "express";

// Import Type
import { Router } from "express";

// Import Controllers
import {
  createUser,
  createUserSession,
  invalidateUserSession,
  getUserSessions,
  recoverUserPassword,
  validateUserRecovery,
  resetUserPassword,
  setupTwoFactorAuth,
  verifyTwoFactorAuth,
  updateUser,
  deleteUser,
  verifyUser,
  unverifyUser,
  getUserDetails,
  followUser,
  unfollowUser,
  me,
  changePassword,
  blockUser,
  unblockUser,
  checkUser,
  userDetails,
  userItems,
  userFollowers,
  userFollowing,
  blockedUsers,
  userLikes,
  userComments,
  topDonors,
  getFollowerStatistics,
  sendFollowRequest,
  updateRequestStatus,
  getPendingFollowRequests,
  getFollowRequest,
  listUsers,
} from "../controllers/user.controller";

// Import Validation
import {
  validateSignUpRoute,
  validateValidateUserRecoveryRoute,
  validateUpdateUser,
  validateLoginRoute,
  validateRecoverUserPasswordRoute,
  validateResetUserPasswordRoute,
  validateId,
  validateUserPassword,
  validateCheckUser,
} from "../validations/user.validator";

// Middlewares
import {authorizeUser, authorizeUserOptional} from "../middlewares/authorizeUser.middleware";

// Express Router
const router = express.Router() as Router;

// Session Route
router.get("/sessions", authorizeUser, getUserSessions); ///done

// SignUp Route
router.post("/signup", validateSignUpRoute, createUser); ///done

// Check username and email availability
router.get("/checkUser", validateCheckUser, checkUser); ///done

// Update User Route
router.post("/update", validateUpdateUser, authorizeUser, updateUser); ///done

// Change Password
router.post("/changePassword", validateUserPassword, authorizeUser, changePassword); ///done

// Get logged In User Route
router.get("/me", authorizeUser, me); ///done

// Get All users //TODO this is for development purpose we will remove this later
router.get("/", authorizeUser, listUsers); ///done

// Get logged In User Route
router.get("/topDonors", authorizeUserOptional, topDonors); ///done

// Get logged In User Route
router.get("/items", authorizeUser, userItems); ///done

//get logged In User Followers
router.get("/followers", authorizeUser, userFollowers); ///done

// get logged In User Followers
router.get("/followings", authorizeUser, userFollowing); ///done

// get logged In User Followers
router.get("/blockedUsers", authorizeUser, blockedUsers); ///done

// get logged In User Followers
router.get("/likes", authorizeUser, userLikes); ///done

// get logged In User Followers
router.get("/comments", authorizeUser, userComments); ///done

// Get User By ID Route
router.get("/details/:id", validateId, authorizeUser, userDetails); ///done

// Login Route
router.post("/login", validateLoginRoute, createUserSession); ///done

// Logout Route
router.post("/logout", authorizeUser, invalidateUserSession); ///done

// Setup 2FA Route
router.post("/2fa/setup", authorizeUser, setupTwoFactorAuth); ///done

// Verify 2FA Route
router.post("/2fa/verify", authorizeUser, verifyTwoFactorAuth); ///done

// Recovery Route
router.post("/recovery", validateRecoverUserPasswordRoute, recoverUserPassword); ///done

// Validate Recovery Route
router.get("/recovery/:id/:token", validateValidateUserRecoveryRoute, validateUserRecovery); ///done

// Reset Password Route
router.post("/recovery/:id/:token", validateResetUserPasswordRoute, resetUserPassword); ///done

// Delete User Route
router.delete("/", authorizeUser, deleteUser); ///done

//Verify User Route
router.get("/verify/:id", validateId, verifyUser); ///done

//Unverify User Route
router.get("/unverify/:id", validateId, unverifyUser); ///done

//Get User Details Route
router.get("/userDetails/:id", validateId, getUserDetails); ///done

//Follow User Route
router.get("/follow/:id", validateId, authorizeUser, followUser); ///done

//Unollow User Route
router.get("/unfollow/:id", validateId, authorizeUser, unfollowUser); ///done

//Block User Route
router.get("/block/:id", validateId, authorizeUser, blockUser); ///done

//Unblock User Route
router.get("/unblock/:id", validateId, authorizeUser, unblockUser); ///done

//Get follower statistics
router.get("/followerStatistics/:id", validateId, getFollowerStatistics); ///done

//Send Follow Request
router.get("/sendFollowRequest/:id", validateId, authorizeUser, sendFollowRequest); ///done

//Update Follow Request Status
router.patch("/updateFollowRequestStatus/:id", validateId, authorizeUser, updateRequestStatus); ///done

//Get Pending Follow Requests
router.get("/getPendingFollowRequests/:id", validateId, getPendingFollowRequests); ///done

//Get Follow Request
router.get("/getFollowRequest/:id", validateId, getFollowRequest); ///done

// Exports
export default router;
