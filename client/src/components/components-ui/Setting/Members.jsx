// src/components/components-ui/Setting/Members.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, Mail, Crown, Shield, User as UserIcon, Eye,
  Trash2, Clock, Loader2, X, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchTeam, inviteMember, changeMemberRole, removeMember, cancelInvite,
} from "../../../store/slices/teamSlice";

const ROLE_META = {
  owner:  { label: "Owner",  icon: Crown,  color: "bg-amber-50 text-amber-700 border-amber-100" },
  admin:  { label: "Admin",  icon: Shield, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  member: { label: "Member", icon: UserIcon, color: "bg-blue-50 text-blue-700 border-blue-100" },
  viewer: { label: "Viewer", icon: Eye,    color: "bg-gray-100 text-gray-600 border-gray-200" },
};

const RoleBadge = ({ role }) => {
  const m = ROLE_META[role] || ROLE_META.member;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-semibold ${m.color}`}>
      <Icon className="w-3 h-3" /> {m.label}
    </span>
  );
};

const avatarGrad = (name = "") => {
  const grads = ["from-indigo-500 to-violet-600","from-emerald-500 to-teal-600","from-amber-500 to-orange-600","from-pink-500 to-rose-600","from-blue-500 to-cyan-600"];
  return grads[(name.charCodeAt(0) || 0) % grads.length];
};

// ─── Invite Modal ─────────────────────────────────────────────────────────────
const InviteModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { inviting } = useSelector((s) => s.team);
  const [email, setEmail] = useState("");
  const [role,  setRole]  = useState("member");

  const handleInvite = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email"); return; }
    try {
      const msg = await dispatch(inviteMember({ email, role })).unwrap();
      toast.success(msg || "Invitation sent");
      dispatch(fetchTeam());
      onClose();
    } catch (err) {
      toast.error(err || "Failed to send invite");
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
          onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><UserPlus className="w-4 h-4 text-indigo-500" /></div>
              <div><h3 className="text-sm font-semibold text-gray-800">Invite Team Member</h3>
                <p className="text-xs text-gray-400 mt-0.5">They'll get an email to join</p></div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {["admin", "member", "viewer"].map((r) => {
                  const m = ROLE_META[r]; const Icon = m.icon; const active = role === r;
                  return (
                    <button key={r} onClick={() => setRole(r)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${active ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      <Icon className="w-4 h-4" /> {m.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {role === "admin" && "Full access except removing the owner."}
                {role === "member" && "Can manage assistants, contacts & calls. No billing or team access."}
                {role === "viewer" && "Read-only access."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} disabled={inviting} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button onClick={handleInvite} disabled={inviting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
              {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Mail className="w-4 h-4" /> Send Invite</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Members = () => {
  const dispatch = useDispatch();
  const { members, pendingInvites, loading } = useSelector((s) => s.team);
  const { user } = useSelector((s) => s.auth);
  const myRole = user?.role || "owner";
  const canManage = myRole === "owner" || myRole === "admin";

  const [inviteOpen, setInviteOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { dispatch(fetchTeam()); }, [dispatch]);

  const handleRole = async (id, role) => {
    setBusyId(id);
    try { await dispatch(changeMemberRole({ id, role })).unwrap(); toast.success("Role updated"); }
    catch (err) { toast.error(err || "Failed"); }
    finally { setBusyId(null); }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the team?`)) return;
    setBusyId(id);
    try { await dispatch(removeMember(id)).unwrap(); toast.success("Member removed"); }
    catch (err) { toast.error(err || "Failed"); }
    finally { setBusyId(null); }
  };

  const handleCancelInvite = async (inviteId) => {
    try { await dispatch(cancelInvite(inviteId)).unwrap(); toast.success("Invite cancelled"); }
    catch (err) { toast.error(err || "Failed"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"><Users className="w-4 h-4 text-indigo-500" /></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Team Members</h3>
            <p className="text-xs text-gray-500">{members.length} member{members.length !== 1 ? "s" : ""}{pendingInvites.length > 0 && ` · ${pendingInvites.length} pending`}</p>
          </div>
        </div>
        {canManage && (
          <button onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all">
            <UserPlus className="w-3.5 h-3.5" /> Invite Member
          </button>
        )}
      </div>

      {loading && members.length === 0 ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : (
        <>
          {/* Active members */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {members.map((m) => {
              const name = `${m.firstName} ${m.lastName}`.trim() || m.email;
              return (
                <div key={m._id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGrad(name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {(name[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                  </div>

                  {/* Role: editable dropdown for manageable non-owner members */}
                  {canManage && !m.isOwner ? (
                    <div className="relative">
                      <select value={m.role} disabled={busyId === m._id}
                        onChange={(e) => handleRole(m._id, e.target.value)}
                        className="appearance-none pl-2.5 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer">
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <RoleBadge role={m.role} />
                  )}

                  {canManage && !m.isOwner && (
                    <button onClick={() => handleRemove(m._id, name)} disabled={busyId === m._id}
                      className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                      {busyId === m._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pending invites */}
          {pendingInvites.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Pending Invites
              </p>
              <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {pendingInvites.map((inv) => (
                  <div key={inv._id} className="flex items-center gap-3 px-4 py-3 bg-amber-50/30">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"><Mail className="w-3.5 h-3.5 text-amber-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{inv.email}</p>
                      <p className="text-[11px] text-gray-400">Invited as {ROLE_META[inv.role]?.label}</p>
                    </div>
                    <RoleBadge role={inv.role} />
                    {canManage && (
                      <button onClick={() => handleCancelInvite(inv._id)} className="p-2 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}
    </div>
  );
};

export default Members;
