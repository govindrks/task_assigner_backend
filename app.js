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

/* =====================================================
   CORS
===================================================== */

const normalizeOrigin = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // If an env var contains a full URL (e.g. https://site.com/login) normalize to origin
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/$/, "");
  }
};

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ORIGIN,
    process.env.CORS_ORIGINS, // optional comma-separated list
  ]
    .flatMap((v) => (typeof v === "string" ? v.split(",") : []))
    .map(normalizeOrigin)
    .filter(Boolean),
);

const allowAll = process.env.CORS_ALLOW_ALL === "true";

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // non-browser clients

    const normalized = normalizeOrigin(origin);

    if (allowAll) return cb(null, true);

    // Netlify previews: https://deploy-preview-123--taskassignergrks.netlify.app
    const isNetlifyPreview = /^https?:\/\/([a-z0-9-]+--)?taskassignergrks\.netlify\.app$/.test(
      normalized,
    );

    // Allow any localhost port during development (http://localhost:5174 etc)
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(normalized);

    if (allowedOrigins.has(normalized) || isNetlifyPreview || isLocalhost) {
      return cb(null, true);
    }

    // Helpful for deployment debugging
    console.warn("CORS blocked origin:", normalized);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // cache preflight 24h
};

// Handle preflight across the board BEFORE rate limiting/auth
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));

/* Rate limit (protect from abuse) */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
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

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Task Assigner API",
    health: "/health",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =====================================================
   404 Handler
===================================================== */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
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
