const mongoose = require("mongoose");
require("dotenv").config()

const db = mongoose.createConnection(process.env.MONGODB_URL);

db.on("connected", () => {
  console.log("DB connected successfully!");
});

db.on("error", (err) => {
  console.error("DB connection error:", err);
});

module.exports = { db };