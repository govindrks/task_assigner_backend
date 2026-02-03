// import dotenv from 'dotenv';

// dotenv.config();
// import app from './app.js';
// import { connectDB } from './config/config.db.js';


// const PORT = process.env.PORT || 3000;

// const start = async () => {
//     await connectDB();
//     app.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`);
//     });
// }

// start();

import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/config.db.js";

const PORT = process.env.PORT || 3000;

/* =====================================================
   Start Server
===================================================== */
const start = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    /* Graceful shutdown */
    process.on("SIGINT", () => {
      console.log("Shutting down...");
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
