// import express from "express";
// import cors from "cors";

// import authRoutes from "./routes/auth.route.js";
// import userRoutes from "./routes/user.route.js";
// import taskRoutes from "./routes/task.route.js";
// import adminRoutes from "./routes/admin.route.js";
// import activityRoutes from "./routes/activity.route.js";
// import notificationRoutes from "./routes/notification.routes.js";
// import inviteRoutes from "./routes/invite.route.js";
// import organizationRoutes from "./routes/organization.route.js";

// const app = express();

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     const allowedOrigins = [
//       "http://localhost:5173",
//       "https://taskassignergrks.netlify.app"
//     ];

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"]
// }));


// app.options(/.*/, cors());


// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api", taskRoutes);
// app.use("/api", adminRoutes);
// app.use("/api", notificationRoutes);
// app.use("/api", activityRoutes);
// app.use("/api", inviteRoutes);
// app.use("/api", organizationRoutes);

// app.get("/", (req, res) => {
//   res.send("API is running");
// });

// export default app;

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

/* Routes */
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import taskRoutes from "./routes/task.route.js";
import adminRoutes from "./routes/admin.route.js";
import activityRoutes from "./routes/activity.route.js";
import notificationRoutes from "./routes/notification.routes.js";
import inviteRoutes from "./routes/invite.route.js";
import organizationRoutes from "./routes/organization.route.js";

const app = express();

/* =====================================================
   Security Middlewares
===================================================== */

app.set("trust proxy", 1);


app.use(express.json({ limit: "10mb" }));

/* Rate limit (protect from abuse) */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  })
);

/* =====================================================
   CORS
===================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://taskassignergrks.netlify.app",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* =====================================================
   API Routes (v1 versioned)
===================================================== */

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/invites", inviteRoutes);
app.use("/api/v1/org", organizationRoutes);

/* =====================================================
   Health check
===================================================== */

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =====================================================
   404 Handler
===================================================== */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.get("/", (req, res) => {
  res.send("API is running");
});

/* =====================================================
   Global Error Handler
===================================================== */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
