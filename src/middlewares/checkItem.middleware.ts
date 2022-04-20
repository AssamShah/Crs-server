// Import Package
import _ from "lodash";

// Import Types
import { Request, Response, NextFunction } from "express";

//Import Models
import { Item } from "../models/item.model";

//Check if the item exists
async function checkItem(req: Request, res: Response, next: NextFunction) {
  //Get the item
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Item not found",
    });
  }
  //TODO User cannot donate to its own Item

  //If the item exists continue to the next middleware
  return next();
}

export default checkItem;
