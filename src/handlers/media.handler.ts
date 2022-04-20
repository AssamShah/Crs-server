// Import Packages
import { ImagePool } from "@squoosh/lib";
import { v4 as uniqueHash } from "uuid";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import _ from "lodash";

// Import Type
import { Request } from "express";

// Creating Dirs If Doesn't Exists
fs.mkdir(path.join(__dirname, "../../", "media", "compressed"), { recursive: true });

// Creating worker-pool to parallelize all image processing.
const imagePool = new ImagePool();

// Storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, "./media");
  },
  filename: (req: Request, file: Express.Multer.File, cb: any) => {
    const fileExt = _.last(file.originalname.split("."));
    const uniqueFileName = `${uniqueHash().replace(/-/g, "")}.${fileExt}`;
    cb(null, uniqueFileName);
  },
});

// Filter Media Types
const acceptableMedia = ["image/jpeg", "image/png", "image/gif"];
const mediaFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // If Media is not Image
  if (!_.includes(acceptableMedia, file.mimetype)) return cb(new Error("Unsupported File Type"), false);

  // Save Media
  cb(null, true);
};

// Config Multer
const upload = multer({ storage, fileFilter: mediaFilter, limits: { fileSize: 1024 * 1024 * 10 } });

// Resize Image
async function resizeMedia(imgPath: string, dimension: string) {
  // Process Dimension
  const [width, height] = dimension.split("x");

  // Read Media
  const media = await fs.readFile(path.join(__dirname, "../../", "media", "compressed", imgPath));

  // Load Media to ProcessingPool
  const image = imagePool.ingestImage(media);

  // Wait until the image is decoded before running preprocessors
  await image.decoded;

  // Resizing
  const preprocessOptions = { resize: { enabled: true, width: parseInt(width), height: parseInt(height) } };
  await image.preprocess(preprocessOptions);

  // Encoding Options
  const fileExt = _.last(imgPath.split("."));

  // Process JPG
  if (fileExt === "jpg") {
    await image.encode({ mozjpeg: { quality: 100 } });
    const { extension, binary } = await image.encodedWith.mozjpeg;
    let filename = _.last(imgPath.split("/"));
    filename = _.first(filename?.split("."));
    await fs.mkdir(path.join(__dirname, "../../", "cache", "media", dimension), { recursive: true });
    const pathToProcessedMedia = `./cache/media/${dimension}/${filename}.${extension}`;
    await fs.writeFile(pathToProcessedMedia, binary);
    return pathToProcessedMedia;
  }

  // Process WEBP
  if (fileExt === "webp") {
    await image.encode({ webp: { quality: 100 } });
    const { extension, binary } = await image.encodedWith.webp;
    let filename = _.last(imgPath.split("/"));
    filename = _.first(filename?.split("."));
    await fs.mkdir(path.join(__dirname, "../../", "cache", "media", dimension), { recursive: true });
    const pathToProcessedMedia = `./cache/media/${dimension}/${filename}.${extension}`;
    await fs.writeFile(pathToProcessedMedia, binary);
    return pathToProcessedMedia;
  }

  // Fallout
  return "";
}

// Compress Image
async function compressMedia(imgPath: string) {
  try {
    // Read Media
    const media = await fs.readFile(path.join(__dirname, "../../", "media", imgPath));

    // Load Media to ProcessingPool
    const image = imagePool.ingestImage(media);

    // Wait until the image is decoded before running preprocessors
    await image.decoded;

    // Encoding Options
    const encodeOptions = {
      mozjpeg: { quality: 65 },
      webp: { quality: 65 },
    };

    // Compress (Encode)
    await image.encode(encodeOptions);

    // Compressed Media
    for (let key of _.keys(image.encodedWith)) {
      const { extension, binary } = await image.encodedWith[key];

      // Construct Path & Serve Media
      let filename = _.last(imgPath.split("/"));
      filename = _.first(filename?.split("."));
      const pathToProcessedMedia = `./media/compressed/${filename}.${extension}`;
      await fs.writeFile(pathToProcessedMedia, binary);
    }
    // Return
    return;
  } catch (err: any) {
    return { error: err };
  }
}

// Export
export { upload, compressMedia, resizeMedia };
