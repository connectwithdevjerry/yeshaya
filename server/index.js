const express = require("express");
const cors = require("cors");
const authRoutes = require("./route/user.route");
const integrationsRoutes = require("./route/integrations.route");
const assistantsRoutes = require("./route/assistant.route");
const cookieParser = require("cookie-parser");
const { verifyAccessToken } = require("./jwt_helpers");
require("dotenv").config();

const app = express();
const PORT = 6000;

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

app.get("/dashboard", verifyAccessToken, async (req, res) => {
  const beaconRequests = await BeaconRequestModel.find({
    surveyor: req.user,
  }).sort({
    createdAt: 1,
  });
  const lodgeRequests = await LodgementModel.find({
    createdBy: req.user,
  }).sort({ createdAt: 1 });

  const num = Math.random() < 0.5 ? 2 : 3;
  const lnum = Math.random() < 0.5 ? 2 : 3;

  const beaconReq = await BeaconRequestModel.find({
    approval_status: APPROVED,
    surveyor: req.user,
  });
  const lodgeReq = await LodgementModel.find({
    approval_status: APPROVED,
    createdBy: req.user,
  });

  return res.send({
    status: true,
    recentActivities: [
      ...beaconRequests.slice(0, num),
      ...lodgeRequests.slice(0, lnum),
    ],
    reqBeaconsTotal: beaconRequests.length,
    reqLodgeTotal: lodgeRequests.length,
    approved: beaconReq.length + lodgeReq.length,
  });
});

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
