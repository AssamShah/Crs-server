// Import Package
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import _ from "lodash";
import mongoose from "mongoose";

// Import Types
import {Request, Response} from "express";

// Import Handler
import {signAndGenerateJWT, generateRecoveryLink, validateRecoveryToken} from "../handlers/jwt.handler";
import {compareHashedPassword, generateSaltAndHashPassword} from "../handlers/bcrypt.handler";
import sgMail from "../handlers/mail.handler";

// Import Model
import {Session} from "../models/session.model";
import User from "../models/user.model";
import { FollowRequest } from "../models/followRequest.model";

// Import Config
const refreshTokenTTL = process.env.REFRESH_TOKEN_TTL as string;
const accessTokenTTL = process.env.ACCESS_TOKEN_TTL as string;

// Get All User Sessions
async function getUserSessions(req: Request, res: Response) {
    try {
        // Get User Id
        const userId = _.get(req, "user._id");

        // Get Sessions
        const sessions = await Session.find({user: userId, valid: true});

        // Return
        return res.status(200).json(sessions);
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Create User
async function  createUser(req: Request, res: Response) {
    try {
        // Generate Salt & Hash Password
        const hashedPassword = await generateSaltAndHashPassword(req.body.password);

        // User Schema
        const user = new User({
            name: req.body.name,
            userName: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            userDribbble: req.body.userDribbble,
            userBehance: req.body.userBehance,
            userFacebook: req.body.userFacebook,
            userTwitter: req.body.userTwitter,
            userInstagram: req.body.userInstagram,
            userSite: req.body.userSite,
            userTiktok: req.body.userTiktok,
        });

        // Saving User
        const createdUser = await user.save();

        // Omitting Password Property
        const response = _.omit(createdUser.toJSON(), ["password", "__v"]) as Object;

        // Returning User
        return res.status(201).json({message: "User Successfully Created", createdUser: response});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

async function checkUser(req: Request, res: Response) {
    try {
        // Returning User
        return res.status(201).json({message: "Username and Email Available"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Create User Session
async function createUserSession(req: Request, res: Response) {
    try {
        // Creating Session
        const session = new Session({
            user: req.user._id,
            userAgent: req.get("user-agent") || "",
        });

        // Saving Session
        const createdSession = await session.save();

        // Creating Access Token
        const accessToken = signAndGenerateJWT(
            {
                ...req.user.toJSON(),
                session: createdSession._id,
            },
            {expiresIn: accessTokenTTL}
        );

        // Creating Refresh Token
        const refreshToken = signAndGenerateJWT(session.toJSON(), {expiresIn: refreshTokenTTL});

        // Return user with response
        let user = await User.findById(req.user._id).populate("blockedUsers").populate("followers").populate("followingUsers").populate("userComments").populate("likes");

        // Send Response
        const response = {accessToken, refreshToken, user} as Object;

        // Return
        return res.status(200).json({message: "User Login Successful", ...response});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Update User
async function updateUser(req: Request, res: Response) {
    try {
        // Get Data from Request
        const updates = req.body.update;

        // Looping through Updates
        for (let update of updates) {
            const {key, value} = update;
            // Hasing Updated Password Before Saving
            if (key === "password") {
                const hashedPassword = await generateSaltAndHashPassword(value);
                req.user[key] = hashedPassword;
            } else {
                req.user[key] = value;
            }
        }

        // Saving Changes
        const updatedUser = await req.user.save();

        // Omitting Password Property
        const response = _.omit(updatedUser.toJSON(), ["password", "__v"]) as Object;

        // Returning User
        return res.status(201).json({message: "User Successfully Updated", updatedUser: response});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Change Password
async function changePassword(req: Request, res: Response) {
    try {
        // Get Data from Request
        const {newPassword, oldPassword} = req.body;

        //matching old password hash
        let isValid = await compareHashedPassword(oldPassword, req.user.password);
        if (isValid) {
            const hashedPassword = await generateSaltAndHashPassword(newPassword);
            req.user["password"] = hashedPassword;

            // Saving Changes
            const updatedUser = await req.user.save();

            // Omitting Password Property
            const response = _.omit(updatedUser.toJSON(), ["password", "__v"]) as Object;

            // Returning User
            return res.status(201).json({message: "User Successfully Updated", updatedUser: response});
        } else {
            return res.status(401).json({message: "Old Password Not Matched"});
        }
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Get User
async function me(req: Request, res: Response) {
    try {
        let user = await User.findById(req.user.id);
        // Returning User
        return res.status(201).json({message: "User Successfully Found", me: user});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}
// Get All Users
async function listUsers(req: Request, res: Response) {
    try {
        let users = await User.find({});
        // Returning User
        return res.status(201).json({message: "User Successfully Found", users: users});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Get User Items
async function userItems(req: Request, res: Response) {
    try {
        let user = await User.findById(req.user.id).populate('userItems')
        // Returning User
        return res.status(201).json({message: "User Successfully Found", user: user});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}


// Get User Followers (users following us)
async function userFollowers(req: Request, res: Response) {
    try {
        let userFollowers = await User.findById(req.user.id).populate('followers')
        let user = await User.findById(req.user.id)
        if (user && userFollowers) {
            let common: any = []
            common = _.intersectionWith(user.followers, user.followingUsers, _.isEqual)
            if (common) {
                common.forEach((e: any, i: number) => {
                    common[i] = e.toString()
                })
            }
            userFollowers.followers.forEach((follower: any, i: number) => {
                if (follower) {
                    if (common.includes(follower.id)) {
                        if (userFollowers) {
                            userFollowers.followers[i].isFollowing = true
                        }
                    }
                }
            });
            // Returning User
            return res.status(201).json({message: "User Successfully Found", user: userFollowers});
        }
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Get User Following (we following users)
async function userFollowing(req: Request, res: Response) {
    try {
        let user = await User.findById(req.user.id).populate('followingUsers')
        // Returning User
        return res.status(201).json({message: "User Successfully Found", user: user});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Get Blocked Users
async function blockedUsers(req: Request, res: Response) {
    try {
        let user = await User.findById(req.user.id).populate('blockedUsers')
        // Returning User
        return res.status(201).json({message: "User Successfully Found", user: user});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Get User likes
async function userLikes(req: Request, res: Response) {
    try {
        let user = await User.findById(req.user.id).populate('likes')
        // Returning User
        return res.status(201).json({message: "User Successfully Found", user: user});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Get User Comments
async function userComments(req: Request, res: Response) {
    try {
        let user = await User.findById(req.user.id).populate('userComments')
        // Returning User
        return res.status(201).json({message: "User Successfully Found", user: user});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

async function userDetails(req: Request, res: Response) {
    try {
        //getting used data by id
        let user = await User.findById(req.params.id).populate('blockedUsers').populate('followers').populate('followingUsers').populate('userComments').populate('likes').populate('userItems')
        if(req.user.id == req.params.id && user){
            return res.status(201).json({message: "User Successfully Found", user: user});
        }
        //if user privacy not null then =>
        if (user && user.privacy !== 'none') {

            if (req.user) {
                let isFriend = user.isFriendUser(req.user.id);
                let isMatchedDonator = await user.isMatchedDonatorUser(req.user.id);
                //setting isFriend
                user.isFriend = isFriend;
                user.isMatchedDonator = isMatchedDonator;
            }

            //if user privacy public then =>
            if (user.privacy === 'public') {
                return res.status(201).json({message: "User Successfully Found", user: user});
            }
            //if user privacy public then =>
            if (req.user && user.privacy === 'private' || (user.privacy === 'donated')) {
                //checking if user is a friend
                if (user.isFriend) {
                    return res.status(201).json({message: "User Successfully Found", user: user});
                } else {
                    return res.status(404).json({message: "User not found"});
                }
            }
            //if user privacy == donated
            if (user.privacy === 'donated' && user.isMatchedDonator) {
                return res.status(201).json({message: "User Successfully Found", user: user});
            }else{
                return res.status(404).json({message: "User not found"});
            }
        } else {
            return res.status(404).json({message: "User not found"});
        }
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Invalidate User Session
async function invalidateUserSession(req: Request, res: Response) {
    try {
        // Get User Session
        const sessionId = _.get(req, "user.session");

        // Update User Session
        await Session.updateOne({_id: sessionId}, {valid: false});

        // Return
        return res.status(200).json({message: "User Logout Successful"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Recover Password
async function recoverUserPassword(req: Request, res: Response) {
    try {
        // Get Email
        const {email} = req.body;

        // Fetch User
        const fetchedUser = await User.findOne({email});

        // If User Doesn't Exist
        if (!fetchedUser) return res.status(404).json({message: "User doesn't exist"});

        // Creating One-Time Recovery Link
        const recoveryLink = generateRecoveryLink(fetchedUser);

        // Send Recovry Link to Emails
        sgMail({to: _.get(fetchedUser, "email"), subject: "Recover Your Account Password", text: recoveryLink});

        // Return
        return res.status(200).json({message: "If user is registered, will receive one-time recovery link."});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Setup 2FA
async function setupTwoFactorAuth(req: Request, res: Response) {
    try {
        // 2FA Status
        const twoFactorAuth = _.get(req, "user.twoFactorAuth.enabled");

        // If 2FA Already Setuped!
        if (twoFactorAuth) return res.status(200).json({message: "2FA already setuped!"});

        // Generating 2FA Secret
        const twoFactorAuthSecret = speakeasy.generateSecret({
            name: `The Garden Platform (${_.get(req, "user.email")})`,
        });

        // Getting OTP URL
        const otpAuthURL = _.get(twoFactorAuthSecret, "otpauth_url") as any;

        // Setup Key
        const setupKey = _.get(twoFactorAuthSecret, "base32") as string;

        // Create QR Code
        qrcode.toDataURL(otpAuthURL, (err, dataURL) => {
            if (err) return res.status(409).json({message: err.message});
            return res.status(200).json({message: "User 2FA Setup", setupKey, dataURL});
        });

        // Change User's 2FA Status
        req.user.twoFactorAuth.enabled = true;
        req.user.twoFactorAuth.secret = _.get(twoFactorAuthSecret, "ascii");

        // Save User
        req.user.save();
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Verify Time Based OneTimePassword (TOTP)
async function verifyTwoFactorAuth(req: Request, res: Response) {
    try {
        // Time Based OneTimePassword (TOTP)
        const token = _.get(req, "body.totp");

        // Getting 2FA Secret
        const twoFactorAuthSecret = _.get(req, "user.twoFactorAuth.secret");

        // Veryify
        const isVerified = speakeasy.totp.verify({
            secret: twoFactorAuthSecret,
            encoding: "ascii",
            token,
        });

        // If Verified
        if (!isVerified) return res.status(409).json({message: "Invalid TOPT"});

        // Return
        return res.status(200).json({message: "Verified"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Validate User Recovery
async function validateUserRecovery(req: Request, res: Response) {
    try {
        // Get Params
        const {id, token} = req.params;

        // Fetch User
        const fetchedUser = await User.findOne({_id: id});

        // If User Doesn't Exist
        if (!fetchedUser) return res.status(200).json({message: "Recovery Link Expired!"});

        // Validate Token
        const isValid = validateRecoveryToken(fetchedUser, token);

        // If Token is Valid
        if (!isValid) return res.status(200).json({message: "Recovery Link Expired!"});

        // Return
        return res.status(200).json({message: "Recovery Link Validated, send post request to reset password!"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Validate & Reset Password Route
async function resetUserPassword(req: Request, res: Response) {
    try {
        // Get Params
        const {id, token} = req.params;
        const {password} = req.body;

        // Fetch User
        const fetchedUser = await User.findOne({_id: id});

        // If User Doesn't Exist
        if (!fetchedUser) return res.status(200).json({message: "Recovery Link Expired!"});

        // Validate Token
        const isValid = validateRecoveryToken(fetchedUser, token);

        // If Token is Valid
        if (!isValid) return res.status(200).json({message: "Recovery Link Expired!"});

        // Generate Salt & Hash Password
        const hashedPassword = await generateSaltAndHashPassword(password);

        // Changing Password
        fetchedUser.password = hashedPassword as string;

        // Saving User
        await fetchedUser.save();

        // Return
        return res.status(201).json({message: "User Password Successfully Changed"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

// Delete User
async function deleteUser(req: Request, res: Response) {
    try {
        // Get User Id
        const userId = _.get(req, "user._id");
        // Delete User
        await User.findByIdAndDelete(userId);
        // Return
        return res.status(200).json({message: "User Successfully Deleted"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//Verify User
async function verifyUser(req: Request, res: Response) {
    try {
        // Get User Id
        const userId = req.params.id;
        // Fetch User and update
        const fetchedUser = await User.findByIdAndUpdate(userId, {isVerified: true});
        // If User Doesn't Exist
        if (!fetchedUser) return res.status(404).json({message: "User doesn't exist"});
        //Check if user is already verified
        if (fetchedUser.isVerified) return res.status(404).json({message: "User is already verified"});

        // Return
        return res.status(201).json({message: "User Verified", user: fetchedUser});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//Unverify User
async function unverifyUser(req: Request, res: Response) {
    try {
        // Get User Id
        const userId = req.params.id;
        // Fetch User and update
        const fetchedUser = await User.findByIdAndUpdate(userId, {isVerified: false});
        // If User Doesn't Exist
        if (!fetchedUser) return res.status(404).json({message: "User doesn't exist"});
        //Check if user is already verified
        if (!fetchedUser.isVerified) return res.status(404).json({message: "User is already unverified"});

        // Return
        return res.status(201).json({message: "User Unverified", user: fetchedUser});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//Get User details
async function getUserDetails(req: Request, res: Response) {
    try {
        // Get User Id
        const userId = req.params.id;
        // Fetch User
        const fetchedUser = await User.findById(userId);

        // If User Doesn't Exist
        if (!fetchedUser) return res.status(404).json({message: "User doesn't exist"});
        // Return
        return res.status(201).json({message: "User Details", user: fetchedUser});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//Follow a particular user
async function followUser(req: Request, res: Response) {
    try {
        //Get user Ids
        const followerId = _.get(req, "user._id");
        const followingId = req.params.id;

        //Fetch users
        const follower = await User.findById(followerId);
        const following = await User.findById(followingId);

        //If users don't exist
        if (!follower || !following) return res.status(404).json({message: "User doesn't exist"});

        //Check if user is already following
        const isFollowing = follower.followingUsers.some((id) => id.toString() === followingId.toString());
        if (isFollowing) return res.status(404).json({message: "User is already following"});

        //Add user to following list
        follower.followingUsers.push(following._id);
        following.followers.push(followerId);
        follower.followingUsersAmount++;
        following.followersAmount++;

        //Save user
        await follower.save();
        await following.save();

        //Return
        return res.status(201).json({message: "User followed"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//Unfollow a particular user
async function unfollowUser(req: Request, res: Response) {
    try {
        //Get user Ids
        const followerId = _.get(req, "user._id");
        const followingId = req.params.id;

        //Fetch users
        const follower = await User.findById(followerId);
        const following = await User.findById(followingId);

        //If users don't exist
        if (!follower || !following) return res.status(404).json({message: "User doesn't exist"});

        //Check if user is already not following
        const isFollowing = follower.followingUsers.some((id) => id.toString() === followingId.toString());
        if (!isFollowing) return res.status(404).json({message: "User is already not following"});

        //Remove user from following list
        await User.findByIdAndUpdate(followerId, {$pull: {followingUsers: followingId}});
        await User.findByIdAndUpdate(followingId, {$pull: {followers: followerId}});
        follower.followingUsersAmount--;
        following.followersAmount--;

        //Save user
        await follower.save();
        await following.save();

        //Return
        return res.status(201).json({message: "User unfollowed"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//Block a particular user
async function blockUser(req: Request, res: Response) {
    try {
        //Get user Ids
        const blockerId = _.get(req, "user._id");
        const blockedId = req.params.id;

        //Fetch users
        const blocker = await User.findById(blockerId);
        const blocked = await User.findById(blockedId);

        //If users don't exist
        if (!blocker || !blocked) return res.status(404).json({message: "User doesn't exist"});

        //Check if user is already blocked
        const isBlocked = blocker.blockedUsers.some((id) => id.toString() === blockedId.toString());
        if (isBlocked) return res.status(404).json({message: "User is already blocked"});

        //Add user to blocked list
        blocker.blockedUsers.push(blocked._id);
        blocked.userBlockedBy.push(blockerId);

        //Save user
        await blocker.save();
        await blocked.save();

        //Return
        return res.status(201).json({message: "User blocked"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//Unblock a particular user
async function unblockUser(req: Request, res: Response) {
    try {
        //Get user Ids
        const blockerId = _.get(req, "user._id");
        const blockedId = req.params.id;

        //Fetch users
        const blocker = await User.findById(blockerId);
        const blocked = await User.findById(blockedId);

        //If users don't exist
        if (!blocker || !blocked) return res.status(404).json({message: "User doesn't exist"});

        //Check if user is already blocked
        const isBlocked = blocker.blockedUsers.some((id) => id.toString() === blockedId.toString());
        if (!isBlocked) return res.status(404).json({message: "User is not blocked"});

        //Add user to blocked list
        await User.findByIdAndUpdate(blockerId, {$pull: {blockedUsers: blockedId}});
        await User.findByIdAndUpdate(blockedId, {$pull: {userBlockedBy: blockerId}});

        //Save user
        await blocker.save();
        await blocked.save();

        //Return
        return res.status(201).json({message: "User unblocked"});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//get follower statistics for a user
async function getFollowerStatistics(req: Request, res: Response) {
    try {
        //Get user id
        const userId = req.params.id;
        //Fetch user
        const user = await User.findById(userId);
        //If user doesn't exist
        if (!user) return res.status(404).json({message: "User doesn't exist"});

        //Get follower statistics
        const followerStatistics = {
            followersAmount: user.followersAmount,
            followingUsersAmount: user.followingUsersAmount,
            followers: user.followers,
            followingUsers: user.followingUsers,
            totalDonatedSeed: user.totalDonatedSeed,
            blockedUsers: user.blockedUsers,
            userBlockedBy: user.userBlockedBy,
        } as Object;

        return res.status(201).json({message: "Follower statistics fetched", followerStatistics: followerStatistics});
    } catch (err: any) {
        console.log(err);
        return res.status(409).json({message: err.message});
    }
}

//Send followRequest to a user
async function sendFollowRequest(req: Request, res: Response) {
  try {
    //Get user ids
    const toId = req.params.id;
    const fromId = _.get(req, "user._id");

    //Fetch users
    const toUser = await User.findById(toId);
    const fromUser = await User.findById(fromId);

    //If users don't exist
    if (!toUser || !fromUser) return res.status(404).json({ message: "User doesn't exist" });

    //Check if user is already following
    const isFollowing = toUser.followingUsers.some((id) => id.toString() === fromId.toString());
    if (isFollowing) return res.status(404).json({ message: "User is already following" });

    //Check if user is already blocked
    const isBlocked = toUser.blockedUsers.some((id) => id.toString() === fromId.toString());
    if (isBlocked) return res.status(404).json({ message: "User is blocked" });

    //Create follow request
    const followRequest = new FollowRequest({
      from: fromId,
      to: toId,
    });

    //Save follow request
    const createdRequest = await followRequest.save();

    //Add follow request to user
    toUser.followRequestsReceived.push(createdRequest._id);
    fromUser.followRequestsSent.push(createdRequest._id);

    //Save users
    await toUser.save();
    await fromUser.save();

    const response = createdRequest.toJSON() as Object;
    return res.status(201).json({ message: "Follow request sent", followRequest: response });
  } catch (err: any) {
    console.log(err);
    return res.status(409).json({ message: err.message });
  }
}

//Change the status .ie. accept or reject a request
async function updateRequestStatus(req: Request, res: Response) {
  try {
    //Get request id
    const requestId = req.params.id;
    //Get user id
    const userId = _.get(req, "user._id");

    //Fetch request
    const request = await FollowRequest.findById(requestId);
    //If request doesn't exist
    if (!request) return res.status(404).json({ message: "Request doesn't exist" });

    //Check if user is the receiver
    if (request.to.toString() !== userId.toString()) return res.status(404).json({ message: "User is not the receiver" });

    //Update request status
    request.status = req.body.status;

    //If request is accepted update the following and followers count
    if (req.body.status === "Accepted") {
      //Update the following and followers count
      const toUser = await User.findById(request.to); //who we are following
      const fromUser = await User.findById(request.from); //who is following us

      //If users don't exist
      if (!toUser || !fromUser) return res.status(404).json({ message: "User doesn't exist" });

      //Update following count
      fromUser.followingUsersAmount += 1;
      //Update followers count
      toUser.followersAmount += 1;

      //Add user to following list
      fromUser.followingUsers.push(request.to);
      //Add user to followers list
      toUser.followers.push(request.from);

      //Save users
      await toUser.save();
      await fromUser.save();
    }

    //Save request
    const updatedRequest = await request.save();

    const response = updatedRequest.toJSON() as Object;
    return res.status(201).json({ message: "Request status updated", followRequest: response });
  } catch (err: any) {
    console.log(err);
    return res.status(409).json({ message: err.message });
  }
}

async function getPendingFollowRequests(req: Request, res: Response) {
  try {
    //Get user id
    const userId = req.params.id;

    //Fetch user
    const user = await User.findById(userId);
    //If user doesn't exist
    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    //Get pending follow requests
    const pendingFollowRequests = await FollowRequest.find({ _id: user.followRequestsReceived, status: "Pending" });

    //Return
    const response = pendingFollowRequests.map((request) => request.toJSON()) as Object;
    return res.status(201).json({ message: "Pending follow requests fetched", pendingFollowRequests: response });
  } catch (err: any) {
    console.log(err);
    return res.status(409).json({ message: err.message });
  }
}

async function getFollowRequest(req: Request, res: Response) {
  try {
    //Get request id
    const requestId = req.params.id;

    //Fetch request
    const request = await FollowRequest.findById(requestId);
    //If request doesn't exist
    if (!request) return res.status(404).json({ message: "Request doesn't exist" });

    //Return
    const response = request.toJSON() as Object;
    return res.status(201).json({ message: "Follow request fetched", followRequest: response });
  } catch (err: any) {
    console.log(err);
    return res.status(409).json({ message: err.message });
  }
}

// Exports
export {
createUser,
    changePassword,
    me,
    createUserSession,
    invalidateUserSession,
    getUserSessions,
    recoverUserPassword,
    resetUserPassword,
    validateUserRecovery,
    setupTwoFactorAuth,
    verifyTwoFactorAuth,
    updateUser,
    deleteUser,
    getUserDetails,
    followUser,
    unfollowUser,
    verifyUser,
    unverifyUser,
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
    getFollowerStatistics,
    sendFollowRequest,
    updateRequestStatus,
    getPendingFollowRequests,
    getFollowRequest,
    listUsers,
};
