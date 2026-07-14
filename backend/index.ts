import "dotenv/config";
import app from "./app.js";
import pool from "./database.js";
import { gracefulShutdown } from "./controllers/helpers.js";
import { Server } from "http";

const server: Server = app.listen(Number(process.env.PORT) || 3000, "0.0.0.0", () => {
    console.clear();
    console.log(`Server running on port ${process.env.PORT || 3000}.....`);    
});


// TASK: A Scheduler will reset the today_views to 0 to all locations

process.on('SIGTERM', gracefulShutdown(server, pool));
process.on('SIGINT', gracefulShutdown(server, pool));