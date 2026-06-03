import "dotenv/config";
import "express-async-errors";

import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/connect.js";
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import authMiddleware from "./middleware/authentication.js";

// Routers
import authRouter from "./routes/auth.js";
import animeRouter from "./routes/anime.js";

// Import socket handler
import handleSocketConnection from "./controllers/sockets.js";

const app = express();
app.use(json());

const server = createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

// Attach the WebSocket instance to the request object
app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Initialize the WebSocket handling logic
handleSocketConnection(io);

// Routes
app.use("/auth", authRouter);
app.use("/anime", animeRouter);

// Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(process.env.PORT || 3000, () =>
      console.log(
        `HTTP server is running on port http://localhost:${process.env.PORT || 3000
        }`
      )
    );
  } catch (error) {
    console.log(error);
  }
};

start();
