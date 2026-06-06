import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Mail, Link2, Loader2, Users, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { fetchTeam, inviteMember } from "../../../../store/slices/teamSlice";

const ROLE_STYLE = {
  owner:  "bg-violet-50 text-violet-600",
  admin:  "bg-indigo-50 text-indigo-600",
  member: "bg-emerald-50 text-emerald-600",
  viewer: "bg-gray-100 text-gray-500",
};

export const CollabSessionDropdown = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { members = [], pendingInvites = [], loading, inviting } = useSelector((s) => s.team);

  const [email, setEmail] = useState("");
  const [role, setRole]   = useState("member");

  useEffect(() => { if (isOpen) dispatch(fetchTeam()); }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleInvite = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email"); return; }
    try {
      await dispatch(inviteMember({ email: email.trim(), role })).unwrap();
      toast.success("Invite sent");
      setEmail("");
      dispatch(fetchTeam());
    } catch (err) {
      toast.error(err || "Failed to send invite");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Link to this assistant copied"))
      .catch(() => toast.error("Failed to copy link"));
  };

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />

      <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-800">Collaborators</h3>
          </div>
          <button
            onClick={handleCopyLink}
            title="Copy a link to this assistant"
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Link2 size={13} /> Share
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Invite */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-800">Invite a teammate</span>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                placeholder="teammate@company.com"
                className="flex-1 min-w-0 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="p-1.5 border border-indigo-100 bg-indigo-50 rounded-lg text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
              >
                {inviting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </button>
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="admin">Admin — full access except removing the owner</option>
              <option value="member">Member — manage assistants, contacts & calls</option>
              <option value="viewer">Viewer — read-only</option>
            </select>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Team</span>
              {loading && <Loader2 size={12} className="animate-spin text-gray-300" />}
            </div>

            {members.length === 0 && !loading ? (
              <p className="text-xs text-gray-400">No teammates yet — invite someone above.</p>
            ) : (
              members.map((m) => {
                const name = `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email;
                return (
                  <div key={m._id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">{name[0] || "?"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{m.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md capitalize flex-shrink-0 ${ROLE_STYLE[m.role] || ROLE_STYLE.viewer}`}>
                      {m.role || "member"}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Pending invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-gray-50">
              <span className="text-xs font-bold text-gray-800">Pending invites</span>
              {pendingInvites.map((inv, i) => (
                <div key={inv._id || i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 text-gray-500">
                    <Mail size={13} className="flex-shrink-0" />
                    <span className="text-xs truncate">{inv.email}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md capitalize flex-shrink-0">
                    {inv.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <ShieldCheck size={12} /> Access managed in Team settings
          </span>
          <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
      </div>
    </>
  );
};
