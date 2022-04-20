// Import Packages
import express from "express";
import cors from "cors";

// Import Types
import { Application } from "express";

// Import Routes

import userRoutes from "./routes/user.route";


// Import Middleware
import deserializeUser from "./middlewares/deserializeUser.middleware";

// Initializing Express App
const app = express() as Application;
// Middlewares
// - Request Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(deserializeUser);

//for the cors issue
app.use(
    cors({
        exposedHeaders: "x-access-token",
    })
);

// Routes
app.use("/user", userRoutes);


// Export App
export default app;
