// src/pages/pages-ghl/Contacts.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Trash2, Edit3, Users, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts, deleteContact } from "../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl } from "../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { NewContactFormPanel } from "../../components/components-ghl/Contact/NewContactFormPanel";
import ConfirmDeleteModal from "../../components/components-ghl/ConfirmDeleteModal";

/* ── Avatar initials ── */
const COLORS = [
  "from-indigo-500 to-violet-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
];
const getColor = (name = "") => COLORS[name.charCodeAt(0) % COLORS.length];

const ContactAvatar = ({ first = "", last = "" }) => (
  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColor(first)} flex items-center justify-center flex-shrink-0`}>
    <span className="text-white text-xs font-bold">
      {(first[0] || "").toUpperCase()}{(last[0] || "").toUpperCase()}
    </span>
  </div>
);

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <td key={i} className="px-5 py-4">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ── Empty state ── */
const EmptyState = ({ onAdd }) => (
  <tr>
    <td colSpan={6} className="px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Users className="w-7 h-7 text-indigo-400" />
        </div>
        <p className="text-gray-500 font-medium">No contacts found</p>
        <p className="text-gray-400 text-sm">Add your first contact to get started.</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
        >
          <UserPlus className="w-4 h-4" /> New Contact
        </motion.button>
      </div>
    </td>
  </tr>
);

const Contacts = () => {
  const dispatch = useDispatch();
  const [isPanelOpen,     setIsPanelOpen]     = useState(false);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [searchParams]    = useSearchParams();

  const { contacts = [], fetchingContacts } = useSelector(s => s.assistants);
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  useEffect(() => {
    if (subaccountId) dispatch(fetchContacts({ subaccountId }));
  }, [dispatch, subaccountId]);

  const handleEditClick    = c => { setSelectedContact(c); setIsPanelOpen(true); };
  const handleAddNewClick  = () => { setSelectedContact(null); setIsPanelOpen(true); };
  const handleClosePanel   = () => { setIsPanelOpen(false); setSelectedContact(null); };
  const openDeleteModal    = c => { setContactToDelete(c); setShowDeleteModal(true); };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    const contactId = contactToDelete._id || contactToDelete.id;
    try {
      await dispatch(deleteContact({ subaccountId, contactId })).unwrap();
      toast.success("Contact deleted");
      setShowDeleteModal(false);
      setContactToDelete(null);
      dispatch(fetchContacts({ subaccountId }));
    } catch (err) { toast.error(err || "Failed to delete contact"); }
  };

  const filteredContacts = useMemo(() => {
    const base = Array.isArray(contacts) ? [...contacts] : [];
    base.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const q = searchTerm.toLowerCase();
    return base.filter(c =>
      !c ? false : (
        (c.firstName || "").toLowerCase().includes(q) ||
        (c.lastName  || "").toLowerCase().includes(q) ||
        (c.email     || "").toLowerCase().includes(q) ||
        (c.company   || "").toLowerCase().includes(q)
      )
    );
  }, [contacts, searchTerm]);

  return (
    <div className="flex-grow bg-gray-50/60 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Top bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
            <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {filteredContacts.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search contacts…"
                className="w-56 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Add button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddNewClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200 flex-shrink-0"
            >
              <UserPlus className="w-4 h-4" /> New Contact
            </motion.button>
          </div>
        </motion.div>

        {/* ── Table card ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-10">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Company</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetchingContacts ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredContacts.length === 0 ? (
                  <EmptyState onAdd={handleAddNewClick} />
                ) : (
                  filteredContacts.map((contact, idx) => (
                    <motion.tr
                      key={contact?._id || contact?.id || idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.03 }}
                      className="hover:bg-indigo-50/30 transition-colors duration-150 group"
                    >
                      <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <ContactAvatar first={contact?.firstName} last={contact?.lastName} />
                          <span className="text-sm font-semibold text-gray-900">
                            {contact?.firstName} {contact?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{contact?.email || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{contact?.phone || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{contact?.company || "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditClick(contact)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteModal(contact)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!fetchingContacts && filteredContacts.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filteredContacts.length} contact{filteredContacts.length !== 1 ? "s" : ""}
            </div>
          )}
        </motion.div>
      </div>

      {/* Side panel */}
      {isPanelOpen && (
        <NewContactFormPanel
          onClose={handleClosePanel}
          subaccountId={subaccountId}
          initialData={selectedContact}
        />
      )}

      {/* Delete modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setContactToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contactToDelete?.firstName || "this contact"}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Contacts;
