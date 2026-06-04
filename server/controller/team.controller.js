const crypto = require("crypto");
const userModel = require("../model/user.model");
const emailHelper = require("../resendObject");
const { createNotification } = require("./notification.controller");

const ROLE_LABELS = { admin: "Admin", member: "Member", viewer: "Viewer" };

// ─── Invite a team member ─────────────────────────────────────────────────────
const inviteMember = async (req, res) => {
  try {
    const ownerId = req.user; // resolved agency owner id
    const { email, role = "member" } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: false, message: "A valid email is required" });
    }
    if (!["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({ status: false, message: "Invalid role" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Can't invite someone who already has an account
    const existing = await userModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ status: false, message: "A user with this email already exists" });
    }

    const owner = await userModel.findById(ownerId);
    if (!owner) return res.status(404).json({ status: false, message: "Agency not found" });

    // Prevent duplicate pending invites
    const dup = (owner.teamInvites || []).find(
      (i) => i.email === normalizedEmail && i.status === "pending",
    );
    if (dup) {
      return res.status(400).json({ status: false, message: "An invite is already pending for this email" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    owner.teamInvites.push({ email: normalizedEmail, role, token, status: "pending" });
    await owner.save();

    const acceptLink = `${process.env.FRONTEND_URL}/accept-invite/${token}`;
    const agencyName = owner.company?.name || `${owner.firstName || "Your"}'s agency`;

    await emailHelper(
      normalizedEmail,
      `You've been invited to join ${agencyName}`,
      `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#111827">You're invited 🎉</h2>
          <p style="color:#6B7280">You've been invited to join <strong>${agencyName}</strong>
            as a <strong>${ROLE_LABELS[role]}</strong> on Yashayah AI.</p>
          <a href="${acceptLink}" style="display:inline-block;background:#6366F1;color:#fff;
            padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
            Accept Invitation</a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
            If you weren't expecting this, you can ignore this email.</p>
        </div>`,
    );

    console.log(`✅ inviteMember → invited ${normalizedEmail} as ${role}`);
    return res.status(200).json({ status: true, message: `Invitation sent to ${normalizedEmail}` });
  } catch (err) {
    console.error("❌ inviteMember error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── List members + pending invites ───────────────────────────────────────────
const getTeamMembers = async (req, res) => {
  try {
    const ownerId = req.user;
    const owner = await userModel.findById(ownerId).lean();
    if (!owner) return res.status(404).json({ status: false, message: "Agency not found" });

    // Active members = users linked to this owner + the owner themselves
    const members = await userModel
      .find({ $or: [{ _id: ownerId }, { agencyOwnerId: ownerId }] })
      .select("firstName lastName email role agencyOwnerId isActive createdAt")
      .lean();

    const formattedMembers = members.map((m) => ({
      _id: m._id,
      firstName: m.firstName || "",
      lastName: m.lastName || "",
      email: m.email,
      role: m.role || "owner",
      isOwner: !m.agencyOwnerId,
      isActive: m.isActive !== false,
      joinedAt: m.createdAt,
    }));

    const pendingInvites = (owner.teamInvites || [])
      .filter((i) => i.status === "pending")
      .map((i) => ({ _id: i._id, email: i.email, role: i.role, invitedAt: i.invitedAt }));

    return res.status(200).json({ status: true, members: formattedMembers, pendingInvites });
  } catch (err) {
    console.error("❌ getTeamMembers error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Accept an invite (public) ────────────────────────────────────────────────
const acceptInvite = async (req, res) => {
  try {
    const { token, firstName, lastName, password } = req.body;

    if (!token || !password || !firstName) {
      return res.status(400).json({ status: false, message: "First name, password and token are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: false, message: "Password must be at least 6 characters" });
    }

    const owner = await userModel.findOne({
      "teamInvites.token": token,
      "teamInvites.status": "pending",
    });
    if (!owner) {
      return res.status(404).json({ status: false, message: "Invite not found or already used" });
    }

    const invite = owner.teamInvites.find((i) => i.token === token && i.status === "pending");

    // Guard: email might have been claimed since invite was sent
    const exists = await userModel.findOne({ email: invite.email });
    if (exists) {
      return res.status(400).json({ status: false, message: "This email is already registered" });
    }

    // Create the team-member user (password auto-hashed by model pre-save hook)
    const member = new userModel({
      firstName,
      lastName: lastName || "",
      email: invite.email,
      password,
      role: invite.role,
      agencyOwnerId: owner._id,
      isActive: true,
    });
    await member.save();

    // Mark invite accepted
    invite.status = "accepted";
    owner.markModified("teamInvites");
    await owner.save();

    // Notify the agency
    await createNotification({
      userId: owner._id,
      type: "general",
      title: "Team Member Joined",
      message: `${firstName} ${lastName || ""} accepted your invitation as ${ROLE_LABELS[invite.role]}.`,
      metadata: { email: invite.email, role: invite.role },
    });

    console.log(`✅ acceptInvite → ${invite.email} joined as ${invite.role}`);
    return res.status(200).json({ status: true, message: "Account created. You can now log in." });
  } catch (err) {
    console.error("❌ acceptInvite error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Change a member's role ───────────────────────────────────────────────────
const changeMemberRole = async (req, res) => {
  try {
    const ownerId = req.user;
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({ status: false, message: "Invalid role" });
    }

    const member = await userModel.findOne({ _id: id, agencyOwnerId: ownerId });
    if (!member) {
      return res.status(404).json({ status: false, message: "Member not found in your team" });
    }

    member.role = role;
    await member.save();

    return res.status(200).json({ status: true, message: "Role updated", data: { id, role } });
  } catch (err) {
    console.error("❌ changeMemberRole error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Remove a member ──────────────────────────────────────────────────────────
const removeMember = async (req, res) => {
  try {
    const ownerId = req.user;
    const { id } = req.params;

    // Only members of THIS agency can be removed (never the owner)
    const member = await userModel.findOne({ _id: id, agencyOwnerId: ownerId });
    if (!member) {
      return res.status(404).json({ status: false, message: "Member not found in your team" });
    }

    await userModel.deleteOne({ _id: id });
    return res.status(200).json({ status: true, message: "Member removed" });
  } catch (err) {
    console.error("❌ removeMember error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Cancel a pending invite ──────────────────────────────────────────────────
const cancelInvite = async (req, res) => {
  try {
    const ownerId = req.user;
    const { inviteId } = req.params;

    const owner = await userModel.findById(ownerId);
    if (!owner) return res.status(404).json({ status: false, message: "Agency not found" });

    const invite = owner.teamInvites.id(inviteId);
    if (!invite) return res.status(404).json({ status: false, message: "Invite not found" });

    invite.status = "cancelled";
    owner.markModified("teamInvites");
    await owner.save();

    return res.status(200).json({ status: true, message: "Invite cancelled" });
  } catch (err) {
    console.error("❌ cancelInvite error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = {
  inviteMember,
  getTeamMembers,
  acceptInvite,
  changeMemberRole,
  removeMember,
  cancelInvite,
};
