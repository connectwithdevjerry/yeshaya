// src/components/components-ui/Setting/Members.jsx
import React, { useState } from "react";
import { Users, Trash2, Mail, ShieldCheck, UserPlus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Avatar initials tile ── */
const Avatar = ({ name, email }) => {
  const initials = name && name !== "-"
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
  ];
  const color = colors[(email.charCodeAt(0) + email.charCodeAt(1)) % colors.length];

  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
      {initials}
    </div>
  );
};

/* ── Invite modal ── */
const InviteModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900)); // replace with real dispatch
    setSending(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
          initial={{ scale: 0.95, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Invite Member</h3>
                <p className="text-xs text-gray-400 mt-0.5">Send an invite to your workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="colleague@example.com"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-gray-400"
                autoFocus
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!email.trim() || sending}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {sending ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ── Member row ── */
const MemberRow = ({ name, email, isAdmin, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -8 }}
    transition={{ duration: 0.18 }}
    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 py-3.5 border-b border-gray-50 last:border-b-0 px-1 hover:bg-gray-50/50 rounded-lg transition-colors group"
  >
    {/* Avatar */}
    <Avatar name={name} email={email} />

    {/* Name + email */}
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate">
        {name && name !== "-" ? name : <span className="text-gray-400 italic">No name</span>}
      </p>
      <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
    </div>

    {/* Admin badge */}
    <div className="w-24 flex justify-center">
      {isAdmin ? (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
          <ShieldCheck className="w-3 h-3" />
          Admin
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100 font-semibold">
          Member
        </span>
      )}
    </div>

    {/* Delete */}
    <button
      onClick={onRemove}
      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);

/* ── Main component ── */
const MembersSettings = () => {
  const [members, setMembers] = useState([
    { id: 1, name: "Super Admin", email: "superadmin@centerfy.ai",   isAdmin: true  },
    { id: 2, name: "-",           email: "kenny@mail.yashayah.ai",   isAdmin: false },
    { id: 3, name: "-",           email: "sylvesterzed@gmail.com",   isAdmin: false },
    { id: 4, name: "-",           email: "jp@centerfy.ai",           isAdmin: false },
  ]);
  const [showInvite, setShowInvite] = useState(false);

  const remove = (id) => setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Team Members</h3>
              <p className="text-xs text-gray-400 mt-0.5">{members.length} member{members.length !== 1 ? "s" : ""} in your workspace</p>
            </div>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite Member
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <div className="w-8" />
            <div>Member</div>
            <div className="w-24 text-center">Role</div>
            <div className="w-8" />
          </div>

          {/* Rows */}
          <div className="px-3 min-h-[160px]">
            <AnimatePresence>
              {members.length > 0 ? (
                members.map((m) => (
                  <MemberRow key={m.id} {...m} onRemove={() => remove(m.id)} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-14 text-center text-gray-400"
                >
                  <Users className="w-8 h-8 mb-2 text-gray-200" />
                  <p className="text-sm">No members yet.</p>
                  <p className="text-xs mt-1">Invite your first team member above.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default MembersSettings;
