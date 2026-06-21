const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../jwt_helpers");
const { getAppointments, getCalendarSlots, bookAppointmentManual } = require("../controller/appointment.controller");

router.get("/",      verifyAccessToken, getAppointments);
router.get("/slots", verifyAccessToken, getCalendarSlots);
router.post("/book", verifyAccessToken, bookAppointmentManual);

module.exports = router;
