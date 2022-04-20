// Import Package
import { schedule } from "node-cron";
import path from "path";
import _ from "lodash";
import fs from "fs";

// Construct Paths
const pathToCacheFile = path.join(__dirname, "../../", "cache", "media", "cache.json");
const pathToCacheDir = path.join(__dirname, "../../", "cache", "media");

// Garbage Collector
// Every Month
const job = schedule(
  "0 0 1 * *",
  function garbageCollector() {
    // Logging
    console.log(`Running Garbage Collector - ${new Date().toLocaleString()}`);

    // Read Cache JSON
    let content = JSON.parse(fs.readFileSync(pathToCacheFile, { encoding: "utf8" }));
    // Updated Cache JSON
    let updatedContent = Array();
    // Looping Through Cache
    for (let ctx = 0; ctx < content.length; ctx++) {
      if (content[ctx].accessCount < 6) fs.rmSync(path.join(pathToCacheDir, content[ctx].image));
      else updatedContent.push(content[ctx]);
    }
    // Updating Cache
    if (updatedContent.length > 0) fs.writeFileSync(pathToCacheFile, JSON.stringify(updatedContent));

    // Clearing Dirs
    for (let theDir of fs.readdirSync(pathToCacheDir)) {
      try {
        const files = fs.readdirSync(path.join(pathToCacheDir, theDir));
        if (files.length === 0) fs.rmdirSync(path.join(pathToCacheDir, theDir));
      } catch (error) {}
    }

    // Logging
    console.log(`Garbage Collector Run Complete - ${new Date().toLocaleString()}`);
  },
  { scheduled: false }
);

// Exports
export default job;
