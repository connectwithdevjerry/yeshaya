const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../jwt_helpers");
const {
  getPools, createPool, updatePool, deletePool, setPoolNumbers,
} = require("../controller/pool.controller");

router.get("/",                  verifyAccessToken, getPools);
router.post("/",                 verifyAccessToken, createPool);
router.put("/:poolId",           verifyAccessToken, updatePool);
router.put("/:poolId/numbers",   verifyAccessToken, setPoolNumbers);
router.delete("/:poolId",        verifyAccessToken, deletePool);

module.exports = router;
