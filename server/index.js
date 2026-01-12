const express = require("express");
const cors = require("cors");
const authRoutes = require("./route/user.route");
const integrationsRoutes = require("./route/integrations.route");
const assistantsRoutes = require("./route/assistant.route");
const cookieParser = require("cookie-parser");
const { verifyAccessToken } = require("./jwt_helpers");
require("dotenv").config();

const app = express();
const PORT = 60001;

const corsOptions = {
  origin: true, // Accepts all origins
  credentials: false,
  optionsSuccessStatus: 200, // Fixed typo: optionSuccessStatus -> optionsSuccessStatus
};

app.use(cors(corsOptions));

// app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/auth", authRoutes);
app.use("/integrations", integrationsRoutes);
app.use("/assistants", assistantsRoutes);

app.get("/", (req, res) => {
  res.send("homepage");
});

app.listen(PORT, (err) => {
  if (err) {
    console.log("server error", err);
  } else {
    console.log(`check running server on url http://localhost:${PORT}`);
  }
});
