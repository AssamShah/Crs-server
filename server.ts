// Import Handler
import garbageCollector from "./src/handlers/garbage.handler";
import connect from "./src/handlers/db.handler";

// Import Express App
import app from "./src/app";

// Initialize Garbage Collector
garbageCollector.start();

// Config
const port = process.env.PORT as unknown as number;
const host = process.env.HOST as string;

// Listening to Requests
(async () => {
  try {
    // Connecting to Database
    const isConnected = await connect();

    // If Connection Successful
    if (isConnected) app.listen(port, () => console.log(`Server is Listening for Requests on Port http://${host}:${port}`));
    else process.exit();
  } catch (e) {
    console.log(e);
  }
})();
