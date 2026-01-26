import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import taskRoutes from "./routes/task.route.js";
import adminRoutes from "./routes/admin.route.js";
import activityRoutes from "./routes/activity.route.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://taskassignergrks.netlify.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", taskRoutes);
app.use("/api", adminRoutes);
app.use("/api", notificationRoutes);
app.use("/api", activityRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
