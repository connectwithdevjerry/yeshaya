// src/components/components-ui/Modals/AccountDetailSidebar.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ExternalLink, Copy, Check, Loader2, Save, Building2, User,
  Bot, Users, Phone, Mail, Globe, MapPin, Archive, ArchiveRestore,
  CheckCircle2, AlertCircle, RefreshCw, Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchSubAccountDetails,
  fetchSubAccountGhlDetails,
  updateSubAccountMeta,
  toggleSubAccountArchive,
  authorizeGoHighLevel,
} from "../../../store/slices/integrationSlice";

const avatarGrad = (s = "") => {
  const g = ["from-indigo-500 to-violet-600","from-emerald-500 to-teal-600","from-amber-500 to-orange-600","from-pink-500 to-rose-600","from-blue-500 to-cyan-600"];
  return g[(s.charCodeAt(0) || 0) % g.length];
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex flex-col items-center gap-1 px-2 py-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
    <span className="text-lg font-bold text-gray-900 leading-none tabular-nums">{value}</span>
    <span className="text-[10px] text-gray-400">{label}</span>
  </div>
);

const ClientField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 px-3.5 py-3 bg-gray-50/60 rounded-xl border border-gray-100">
    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5 break-words">{value || <span className="text-gray-300">Not set</span>}</p>
    </div>
  </div>
);

export const AccountDetailSidebar = ({ isOpen, onClose, account }) => {
  const dispatch = useDispatch();
  const { subAccountDetails, fetchingSubAccountDetails, agencyId } = useSelector(s => s.integrations || {});

  const [customName, setCustomName] = useState("");
  const [notes,      setNotes]      = useState("");
  const [copied,     setCopied]     = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [dirty,      setDirty]      = useState(false);

  // Live GHL client info (local — fetched per open)
  const [client, setClient] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientReconnect, setClientReconnect] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    if (account) {
      setFormData({
        name: account.name || '',
        firstName: account.firstName || initialClientInfo.fullName.split(' ')[0] || '',
        lastName: account.lastName || initialClientInfo.fullName.split(' ')[1] || '',
        email: account.email || initialClientInfo.email,
        phoneNumber: account.phone || initialClientInfo.phoneNumber,
      });
      
      setAccessMembers(initialAccessMembers); 
=======
    if (!isOpen || !account?.id) return;
    dispatch(fetchSubAccountDetails(account.id));

    setClient(null); setClientReconnect(false); setClientLoading(true);
    dispatch(fetchSubAccountGhlDetails(account.id)).unwrap()
      .then((res) => {
        if (res?.reconnectRequired) setClientReconnect(true);
        else if (res?.status) setClient(res.data);
      })
      .catch(() => {})
      .finally(() => setClientLoading(false));
  }, [isOpen, account?.id, dispatch]);

  useEffect(() => {
    if (subAccountDetails && subAccountDetails.accountId === account?.id) {
      setCustomName(subAccountDetails.customName || account?.name || "");
      setNotes(subAccountDetails.notes || "");
      setDirty(false);
    } else if (account) {
      setCustomName(account.customName || account.name || "");
      setNotes(account.notes || "");
      setDirty(false);
>>>>>>> projects-ui
    }
  }, [subAccountDetails, account]);

  if (!account) return null;

  const connected   = subAccountDetails?.connected ?? (account.connected !== false);
  const isArchived  = subAccountDetails?.isArchived ?? account.isArchived ?? false;
  const displayName = customName || account.name || "Unnamed Account";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(account.id || "");
    setCopied(true); toast.success("Location ID copied");
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateSubAccountMeta({ id: account.id, customName, notes })).unwrap();
      toast.success("Saved"); setDirty(false);
    } catch (err) { toast.error(err || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleOpen = () => {
    const params = new URLSearchParams({
      agencyid:   account.companyId || agencyId || "UNKNOWN",
      subaccount: account.id || "NO_ID",
      allow:      "yes",
      myname:     displayName,
      myemail:    client?.email || account.email || "noemail@example.com",
      route:      "/assistants",
    });
    window.open(`/app?${params.toString()}`, "_blank");
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await dispatch(toggleSubAccountArchive(account.id)).unwrap();
      toast.success(isArchived ? "Account unarchived" : "Account archived");
    } catch (err) { toast.error("Failed to update"); }
    finally { setArchiving(false); }
  };

  const handleReconnect = () => {
    dispatch(authorizeGoHighLevel({ accountId: account.id, accountType: "Company", installationType: "directInstallation" }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

<<<<<<< HEAD
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out z-50 
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            {account.name} 
            <span className="text-sm text-gray-500 font-normal ml-3 flex items-center">
                ID: {account.id || account.locationId}
                <button className="ml-2 text-gray-400 hover:text-gray-600" title="Copy ID">
                    <Copy className="w-4 h-4" />
                </button>
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </header>

        <div className="p-6 pb-20"> 
          <section className="mb-8 border border-gray-200 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Quick Actions</h3>
            <QuickActionButton icon={ExternalLink} text="Preview" linkText="Open In A New Tab" />
            <QuickActionButton icon={Lock} text="Lock" linkText="Lock Sub-account" hasLockIcon={true} />
            <QuickActionButton icon={Users} text="Users" linkText="Invite Members" />
          </section>

          {/* Account Info */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Account Info</h3>
            <div className="space-y-4">
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Name</span>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" 
                    />
                </label>
            </div>
          </section>

          {/* Client Info */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Client Info</h3>
            <div className="space-y-4">
                <div className="flex gap-4"> 
                    <label className="block flex-1">
                        <span className="text-sm font-medium text-gray-700">First Name</span>
                        <input 
                            type="text" 
                            name="firstName" 
                            value={formData.firstName}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </label>
                    <label className="block flex-1">
                        <span className="text-sm font-medium text-gray-700">Last Name</span>
                        <input 
                            type="text" 
                            name="lastName" 
                            value={formData.lastName}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </label>
=======
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* ── Header ── */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarGrad(displayName)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {displayName.charAt(0).toUpperCase()}
>>>>>>> projects-ui
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate">{displayName}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {connected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-semibold">
                        <AlertCircle className="w-3 h-3" /> Reconnect needed
                      </span>
                    )}
                    {isArchived && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                        <Archive className="w-3 h-3" /> Archived
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {fetchingSubAccountDetails && !subAccountDetails ? (
                  [0,1,2].map(i => <div key={i} className="h-[76px] bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />)
                ) : (
                  <>
                    <StatCard icon={Bot}   label="Assistants" value={subAccountDetails?.assistantCount ?? 0} color="bg-indigo-50 text-indigo-500" />
                    <StatCard icon={Users} label="Contacts"   value={subAccountDetails?.contactCount   ?? 0} color="bg-violet-50 text-violet-500" />
                    <StatCard icon={Phone} label="Numbers"    value={subAccountDetails?.numberCount    ?? 0} color="bg-emerald-50 text-emerald-500" />
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Quick Actions</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleOpen}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </button>
                  <button onClick={handleArchive} disabled={archiving}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50 ${
                      isArchived ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                 : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {isArchived ? "Unarchive" : "Lock"}
                  </button>
                  {!connected && (
                    <button onClick={handleReconnect} title="Reconnect GoHighLevel"
                      className="px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Account Info — display name (editable) */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Account Info</h3>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">Display Name</label>
                  <input type="text" value={customName}
                    onChange={(e) => { setCustomName(e.target.value); setDirty(true); }}
                    placeholder={account.name || "Account name"}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                  {account.name && customName !== account.name && (
                    <p className="text-[11px] text-gray-400">GHL name: <span className="font-medium text-gray-500">{account.name}</span></p>
                  )}
                </div>
                {/* Location ID */}
                <div className="space-y-1.5 mt-3">
                  <label className="block text-xs font-semibold text-gray-700">Location ID</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-mono text-gray-600 truncate">{account.id}</code>
                    <button onClick={handleCopy}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-1.5 flex-shrink-0">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Client Info — live from GoHighLevel (read-only) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Client Info</h3>
                  <span className="text-[10px] text-gray-300 flex items-center gap-1"><Building2 className="w-3 h-3" /> from GoHighLevel</span>
                </div>

                {clientLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
                ) : clientReconnect ? (
                  <div className="flex flex-col items-center gap-3 py-6 px-4 text-center bg-amber-50/40 rounded-xl border border-amber-100">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    <p className="text-xs text-gray-500">Reconnect GoHighLevel to load this client's info.</p>
                    <button onClick={handleReconnect}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-all">
                      <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                    </button>
                  </div>
                ) : client ? (
                  <div className="space-y-2">
                    <ClientField icon={User}   label="Business Name" value={client.name} />
                    <div className="grid grid-cols-1 gap-2">
                      <ClientField icon={Mail}  label="Email" value={client.email} />
                      <ClientField icon={Phone} label="Phone" value={client.phone} />
                    </div>
                    {client.website && <ClientField icon={Globe}  label="Website" value={client.website} />}
                    {client.address && <ClientField icon={MapPin} label="Address" value={client.address} />}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">Client info unavailable.</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Notes</label>
                <textarea value={notes} rows={3}
                  onChange={(e) => { setNotes(e.target.value); setDirty(true); }}
                  placeholder="Internal notes about this account…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" />
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              {dirty
                ? <span className="text-xs text-amber-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Unsaved changes</span>
                : <span className="text-xs text-gray-400">All changes saved</span>}
              <button onClick={handleSave} disabled={saving || !dirty}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
