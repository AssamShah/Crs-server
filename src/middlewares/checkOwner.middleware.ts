// Import Package
import _ from "lodash";

// Import Types
import { Request, Response, NextFunction } from "express";

//Import Models
import { Item } from "../models/item.model";

//Check if owner of NFT is the authorized user
async function checkOwner(req: Request, res: Response, next: NextFunction) {
  //Get the id of the logged in user
  const userId = _.get(req, "user._id");

  //Get the user id of the NFT owner
  const item = await Item.findById(req.params.id);

  const ownerId = item?.itemOwner;

  //Check if the user is the owner of the NFT
  if (userId.toString() !== ownerId.toString()) {
    return res.status(403).json({
      message: "User not authorized",
    });
  }

  //If the user is the owner of the NFT, continue to the next middleware
  return next();
}

export default checkOwner;
