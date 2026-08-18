const express = require("express");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");
const authRoutes = require("./route/user.route");
const integrationsRoutes = require("./route/integrations.route");
const session = require("express-session");
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
const cookieParser = require("cookie-parser");
const { verifyAccessToken } = require("./jwt_helpers");
const { stripeWebhook } = require("./controller/payments.controller");
const userModel = require("./model/user.model");
const { default: axios } = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 60001;

// Gzip all responses (JSON + static). Biggest single site-wide speedup.
app.use(compression());

app.post(
  "/integrations/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

const corsOptions = {
  origin: true, // Reflects the actual request origin (required when credentials: true — can't use "*")
  credentials: true, // Must be true: /auth/signin sets a SameSite=None; Secure cookie
  optionsSuccessStatus: 200, // Fixed typo: optionSuccessStatus -> optionsSuccessStatus
};
app.use(
  session({
    secret: "0c83b09a933ee6f028d62", // Change this to a random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  }),
);

app.use(cors(corsOptions));

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
app.use("/widgets", widgetRouter);
app.use("/embed", embedRouter);

app.get("/", (req, res) => {
  res.send("homepage");
});

const { createNotification } = require("./controller/notification.controller");
const { startAppointmentReminders } = require("./helpers/appointmentReminders");

// ── Connect to MongoDB then start server ──────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Appointment reminder scheduler (24h + 1h before)
    startAppointmentReminders();

    // ── Wallet change stream (must run after DB connects) ──────────────────
    const changeStream = userModel.watch([
      {
        $match: {
          "updateDescription.updatedFields.walletBalance": { $exists: true },
        },
      },
    ]);

    changeStream.on("change", async (change) => {
      try {
        const userId = change.documentKey._id;

        const user = await userModel
          .findById(userId)
          .select("walletBalance autoCardPay.least autoCardPay.status");

        if (!user) return;

        if (
          user.autoCardPay.status &&
          user.walletBalance < user.autoCardPay.least
        ) {
          await axios.post(
            `${process.env.SERVER_URL}/integrations/autopay/webhook`,
            {
              userId,
              walletBalance: user.walletBalance,
              least: user.autoCardPay.least,
            },
          );

          await createNotification({
            userId,
            type: "low_balance",
            title: "Low Wallet Balance",
            message: `Your wallet balance ($${user.walletBalance.toFixed(2)}) has dropped below your threshold ($${user.autoCardPay.least}). Auto top-up has been triggered.`,
            metadata: {
              walletBalance: user.walletBalance,
              threshold: user.autoCardPay.least,
            },
          });
        }
      } catch (err) {
        console.error("changeStream handler error:", err.message);
      }
    });

    changeStream.on("error", (err) => {
      console.error("MongoDB changeStream error:", err.message);
    });

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
