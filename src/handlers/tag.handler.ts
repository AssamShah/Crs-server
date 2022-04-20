import { Tag } from "../models/itemTag.model";

//Create tag handler
async function createTagHandler(data: Object) {
  try {
    const tag = new Tag(data);
    const result = await tag.save();
    return result;
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

export { createTagHandler };
