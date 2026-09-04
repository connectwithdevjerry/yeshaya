const express = require("express");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");
const authRoutes = require("./route/user.route");
const integrationsRoutes = require("./route/integrations.route");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const assistantsRoutes = require("./route/assistant.route");
const notificationRoutes = require("./route/notification.route");
const invoiceRoutes = require("./route/invoice.route");
const teamRoutes = require("./route/team.route");
const rebillingRoutes = require("./route/rebilling.route");
const poolRoutes = require("./route/pool.route");
const appointmentRoutes = require("./route/appointment.route");
const templateRoutes = require("./route/template.route");
const apiKeyRoutes = require("./route/apikey.route");
const { widgetRouter, embedRouter } = require("./route/widget.route");
const publicApiRoutes = require("./route/publicApi.route");
const activeTagRoutes = require("./route/activeTag.route");
const customerMemoryRoutes = require("./route/customerMemory.route");
const cookieParser = require("cookie-parser");
const { verifyAccessToken } = require("./jwt_helpers");
const { stripeWebhook } = require("./controller/payments.controller");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 60001;

// Explicit CORS headers and preflight handler at the very top
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, x-api-key, Access-Control-Allow-Credentials"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

const corsOptions = {
  origin: true, // Reflects the actual request origin
  credentials: true, // Required for cookies and credentials
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Gzip all responses (JSON + static). Biggest single site-wide speedup.
app.use(compression());

app.post(
  "/integrations/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// Sessions are persisted in MongoDB. The default express-session store keeps
// everything in process memory, which is lost on every restart and is not
// shared between instances — fine for a single long-lived dev server, wrong for
// the deployed app.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "0c83b09a933ee6f028d62",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  }),
);

// app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/auth", authRoutes);
app.use("/integrations", integrationsRoutes);
app.use("/assistants", assistantsRoutes);
app.use("/notifications", notificationRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/team", teamRoutes);
app.use("/rebilling", rebillingRoutes);
app.use("/pools", poolRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/templates", templateRoutes);
app.use("/integrations/api-keys", apiKeyRoutes);
app.use("/api/v1", publicApiRoutes);
app.use("/active-tags", activeTagRoutes);
app.use("/memory", customerMemoryRoutes);
app.use("/widgets", widgetRouter);
app.use("/embed", embedRouter);
app.use("/cron", require("./route/cron.route"));

app.get("/", (req, res) => {
  res.send("homepage");
});

const { startAppointmentReminders } = require("./helpers/appointmentReminders");
const { startCalendarHealthChecks } = require("./helpers/calendarHealth");

// ── Connect to MongoDB then start server ──────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Appointment reminder scheduler (24h + 1h before)
    startAppointmentReminders();

    // Daily sweep for calendars that have silently stopped working
    startCalendarHealthChecks();

    // Auto top-up is no longer driven by a MongoDB change stream. This process
    // runs on Vercel's serverless runtime, where nothing keeps a change stream
    // open, so the listener was not reliably firing in production and wallets
    // could hit zero with no top-up and no warning. helpers/autoTopUp is now
    // called directly after every debit instead, which behaves the same in a
    // long-running process and in a serverless function.

    app.listen(PORT, (err) => {
      if (err) {
        console.log("server error", err);
      } else {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
