// Import Package
import path from "path";
import _ from "lodash";
import fs from "fs";

// Constructing Paths
const pathToCacheFile = path.join(__dirname, "../../", "cache", "media", "cache.json");
const pathToCacheDir = path.join(__dirname, "../../", "cache", "media");

// Creating Cache Records
if (!fs.existsSync(pathToCacheFile)) {
  fs.mkdirSync(pathToCacheDir, { recursive: true });
  fs.writeFileSync(pathToCacheFile, JSON.stringify([]));
}

// Get Cache
async function getCache(query: { image: string; accessCount?: number }) {
  let content = JSON.parse(fs.readFileSync(pathToCacheFile, { encoding: "utf8" }));
  const foundItem = _.find(content, (item: { image: string; accessCount: number }) => item.image === query.image);
  return foundItem ? foundItem : null;
}

// Set Cache
async function setCache(data: { image: string; accessCount?: number }) {
  let content = JSON.parse(fs.readFileSync(pathToCacheFile, { encoding: "utf8" }));
  _.remove(content, (item: { image: string; accessCount: number }) => item.image === data.image);
  content.push({ ...data, accessCount: 0 });
  fs.writeFileSync(pathToCacheFile, JSON.stringify(content));
}

// Update Cache
async function updateCache(query: { image: string; accessCount?: number }) {
  let content = JSON.parse(fs.readFileSync(pathToCacheFile, { encoding: "utf8" }));
  for (let cdx = 0; cdx < content.length; cdx++) if (content[cdx].image === query.image) _.set(content[cdx], "accessCount", content[cdx].accessCount + 1);
  fs.writeFileSync(pathToCacheFile, JSON.stringify(content));
}

// Exports
export { getCache, setCache, updateCache };
