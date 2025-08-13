import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import prisma from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import socialRoutes from "./src/routes/social.js";
import postRoutes from "./src/routes/posts.js";
import subscriptionRoutes from "./src/routes/subscriptions.js";
import onboardingRoutes from "./src/routes/onboarding.js";
import "./src/queue/postWorker.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: "*",
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/onboarding", onboardingRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AuraSocial Backend Running" });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ AuraSocial Backend running on port ${PORT}`);
});
