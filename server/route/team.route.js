const express = require("express");
const router = express.Router();
const { verifyAccessToken, requireRole } = require("../jwt_helpers");
const {
  inviteMember,
  getTeamMembers,
  acceptInvite,
  changeMemberRole,
  removeMember,
  cancelInvite,
} = require("../controller/team.controller");

// Public — accept an invite (creates the member account)
router.post("/accept-invite", acceptInvite);

// Any authenticated team member can view the team
router.get("/members", verifyAccessToken, getTeamMembers);

// Owner/Admin only — manage the team
router.post("/invite",            verifyAccessToken, requireRole("owner", "admin"), inviteMember);
router.put("/members/:id/role",   verifyAccessToken, requireRole("owner", "admin"), changeMemberRole);
router.delete("/members/:id",     verifyAccessToken, requireRole("owner", "admin"), removeMember);
router.delete("/invites/:inviteId", verifyAccessToken, requireRole("owner", "admin"), cancelInvite);

module.exports = router;
