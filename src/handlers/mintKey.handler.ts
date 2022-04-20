// Import Models
import { MintKey } from "../models/mintKey.model";

async function createMintKeyHandler(data: Object) {
  try {
    const mintKey = new MintKey(data);
    const result = await mintKey.save();
    return result;
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

export { createMintKeyHandler };
