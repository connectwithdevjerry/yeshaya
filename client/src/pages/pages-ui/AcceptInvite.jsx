// src/pages/pages-ui/AcceptInvite.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { UserPlus, Loader2, CheckCircle2, Eye, EyeOff, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { acceptInvite } from "../../store/slices/teamSlice";

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) { toast.error("First name is required"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await dispatch(acceptInvite({ token, firstName, lastName, password })).unwrap();
      setDone(true);
      toast.success("Account created!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err || "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          {done ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-xl font-black text-white">You're all set!</h1>
              <p className="text-sm text-white/50 mt-2">Redirecting you to login…</p>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-black text-white text-center">Accept Your Invitation</h1>
              <p className="text-sm text-white/50 text-center mt-1.5 mb-6">
                Set up your account to join the team.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane"
                        className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:border-indigo-400 transition-all" autoFocus />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5">Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:border-indigo-400 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:border-indigo-400 transition-all" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:brightness-110 transition-all disabled:opacity-60">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create Account & Join"}
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptInvite;
