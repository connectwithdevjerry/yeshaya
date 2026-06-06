// src/pages/pages-ui/ConfirmEmailChange.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { confirmEmailChange } from "../../store/slices/authSlice";

const ConfirmEmailChange = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, ok: false, message: "" });

  useEffect(() => {
    dispatch(confirmEmailChange(token)).unwrap()
      .then((res) => setState({ loading: false, ok: true, message: res.message || "Your email has been updated." }))
      .catch((err) => setState({ loading: false, ok: false, message: err || "This link is invalid or expired." }));
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="p-10 text-center">
            {state.loading ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <h1 className="text-lg font-bold text-white">Confirming your email…</h1>
              </>
            ) : state.ok ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-xl font-black text-white">Email Updated</h1>
                <p className="text-sm text-white/50 mt-2">{state.message}</p>
                <button onClick={() => navigate("/login")}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-lg hover:brightness-110 transition-all">
                  <Mail className="w-4 h-4" /> Go to Login
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-rose-400" />
                </div>
                <h1 className="text-xl font-black text-white">Couldn't Confirm</h1>
                <p className="text-sm text-white/50 mt-2">{state.message}</p>
                <button onClick={() => navigate("/login")}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5 transition-all">
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmEmailChange;
