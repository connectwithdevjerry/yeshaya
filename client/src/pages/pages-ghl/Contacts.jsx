// src/pages/pages-ghl/Contacts.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Loader2, Trash2, Edit3, Users, UserPlus,
  Mail, Phone as PhoneIcon, Building2, LayoutGrid,
  List, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  SlidersHorizontal, X, UploadCloud,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts, deleteContact } from "../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl } from "../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { NewContactFormPanel } from "../../components/components-ghl/Contact/NewContactFormPanel";
import ConfirmDeleteModal from "../../components/components-ghl/ConfirmDeleteModal";
import ImportContactsModal from "../../components/components-ghl/Contact/ImportContactsModal";

/* ──────────────── helpers ──────────────── */

const GRAD_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-blue-500  to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500  to-rose-500",
  "from-sky-500   to-blue-500",
];
const getGrad = (name = "") => GRAD_COLORS[(name.charCodeAt(0) || 0) % GRAD_COLORS.length];

const Avatar = ({ first = "", last = "", size = "md" }) => {
  const sz = size === "lg" ? "w-12 h-12 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${getGrad(first)} flex items-center justify-center flex-shrink-0 shadow-sm font-bold text-white`}>
      {(first[0] || "").toUpperCase()}{(last[0] || "").toUpperCase()}
    </div>
  );
};

const ITEMS_PER_PAGE = 12;

/* ──────────────── sub-components ──────────────── */

const SortIcon = ({ col, sortBy, sortDir }) =>
  sortBy === col
    ? sortDir === "asc"
      ? <ChevronUp   className="w-3 h-3 ml-1 text-indigo-500" />
      : <ChevronDown className="w-3 h-3 ml-1 text-indigo-500" />
    : <ChevronDown className="w-3 h-3 ml-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;

/* skeleton rows */
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    {[40, 180, 160, 120, 140, 80].map((w, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3.5 bg-gray-100 rounded-full" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

/* empty state */
const EmptyState = ({ filtered, onAdd, onClear, source, onShowAll }) => {
  // "From assistants" is empty until an assistant has actually spoken to
  // someone, so say that rather than implying there are no contacts at all —
  // the full address book is one click away.
  const assistantEmpty = !filtered && source === "assistant";

  return (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
      <Users className="w-8 h-8 text-indigo-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700">
      {filtered
        ? "No contacts match your search"
        : assistantEmpty
          ? "No contacts from assistants yet"
          : "No contacts yet"}
    </p>
    <p className="text-xs text-gray-400 mt-1 mb-5 max-w-sm">
      {filtered
        ? "Try a different search term or clear filters."
        : assistantEmpty
          ? "People appear here once an assistant has spoken to them on a call, text or chat. Contacts gathered before assistant memory was enabled won't be listed."
          : "Add your first contact to get started."}
    </p>
    {filtered ? (
      <button onClick={onClear} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        <X className="w-3.5 h-3.5" /> Clear search
      </button>
    ) : assistantEmpty ? (
      <button onClick={onShowAll} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        <Users className="w-3.5 h-3.5" /> Show all contacts
      </button>
    ) : (
      <button onClick={onAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all">
        <UserPlus className="w-4 h-4" /> New Contact
      </button>
    )}
  </div>
  );
};

/* contact card (grid view) */
const ContactCard = ({ contact, onEdit, onDelete, idx }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2, delay: idx * 0.04 }}
    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100/80 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col gap-4"
  >
    {/* top row */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Avatar first={contact.firstName} last={contact.lastName} size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
            {contact.firstName} {contact.lastName}
            {contact.source === "ghl" && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100">GHL</span>
            )}
          </p>
          {contact.company && (
            <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {contact.company}
            </p>
          )}
        </div>
      </div>
      {/* action buttons — edit/delete only apply to app-saved contacts */}
      {contact.source !== "ghl" && (
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>

    {/* contact info rows */}
    <div className="space-y-2">
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition-colors truncate group/link"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Mail className="w-3 h-3 text-indigo-400" />
          </div>
          <span className="truncate group-hover/link:underline">{contact.email}</span>
        </a>
      )}
      {contact.phone && (
        <a
          href={`tel:${contact.phone}`}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-600 transition-colors truncate group/link"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <PhoneIcon className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="truncate group-hover/link:underline">{contact.phone}</span>
        </a>
      )}
      {!contact.email && !contact.phone && (
        <p className="text-xs text-gray-300 italic">No contact info</p>
      )}
    </div>
  </motion.div>
);

/* ──────────────── main component ──────────────── */

const Contacts = () => {
  const dispatch = useDispatch();
  const [isPanelOpen,     setIsPanelOpen]     = useState(false);
  const [isImportOpen,    setIsImportOpen]    = useState(false);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [viewMode,        setViewMode]        = useState("table"); // "table" | "grid"
  const [sortBy,          setSortBy]          = useState("createdAt");
  const [sortDir,         setSortDir]         = useState("desc");
  const [currentPage,     setCurrentPage]     = useState(1);
  // "assistant" = only people an assistant actually spoke to (the default,
  // because that is the list this page is useful for). "all" = every app-saved
  // and GoHighLevel contact, most of which no assistant has touched.
  const [contactSource,   setContactSource]   = useState("assistant");
  const [searchParams]    = useSearchParams();

  const { contacts = [], fetchingContacts } = useSelector((s) => s.assistants);
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  useEffect(() => {
    if (subaccountId) dispatch(fetchContacts({ subaccountId, source: contactSource }));
  }, [dispatch, subaccountId, contactSource]);

  /* reset page on search/sort/source change */
  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortBy, sortDir, contactSource]);

  const handleEditClick   = (c) => { setSelectedContact(c); setIsPanelOpen(true); };
  const handleAddNew      = ()  => { setSelectedContact(null); setIsPanelOpen(true); };
  const handleClosePanel  = ()  => { setIsPanelOpen(false); setSelectedContact(null); };
  const openDeleteModal   = (c) => { setContactToDelete(c); setShowDeleteModal(true); };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    try {
      await dispatch(deleteContact({ subaccountId, contactId: contactToDelete._id || contactToDelete.id })).unwrap();
      toast.success("Contact deleted");
      setShowDeleteModal(false);
      setContactToDelete(null);
      dispatch(fetchContacts({ subaccountId, source: contactSource }));
    } catch (err) { toast.error(err || "Failed to delete contact"); }
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  /* filtered + sorted data */
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return (Array.isArray(contacts) ? [...contacts] : [])
      .filter((c) => !c ? false : (
        (c.firstName || "").toLowerCase().includes(q) ||
        (c.lastName  || "").toLowerCase().includes(q) ||
        (c.email     || "").toLowerCase().includes(q) ||
        (c.company   || "").toLowerCase().includes(q) ||
        (c.phone     || "").toLowerCase().includes(q)
      ))
      .sort((a, b) => {
        let aVal = a[sortBy] || "";
        let bVal = b[sortBy] || "";
        if (sortBy === "createdAt") {
          aVal = new Date(aVal); bVal = new Date(bVal);
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortDir === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
  }, [contacts, searchTerm, sortBy, sortDir]);

  /* pagination */
  const totalPages   = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const TABLE_COLS = [
    { key: "#",         label: "#",       sortKey: null          },
    { key: "name",      label: "Name",    sortKey: "firstName"   },
    { key: "email",     label: "Email",   sortKey: "email"       },
    { key: "phone",     label: "Phone",   sortKey: "phone"       },
    { key: "company",   label: "Company", sortKey: "company"     },
    { key: "actions",   label: "",        sortKey: null          },
  ];

  /* stats for hero */
  const totalCount = Array.isArray(contacts) ? contacts.length : 0;
  const weekAgo    = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = (Array.isArray(contacts) ? contacts : []).filter(
    (c) => c?.createdAt && new Date(c.createdAt) > weekAgo
  ).length;

  return (
    <div className="flex-grow bg-gray-50/60 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage your CRM contacts and leads
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts…"
                className="w-52 pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Source filter */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-0.5 gap-0.5">
              {[
                { key: "assistant", label: "From assistants" },
                { key: "all",       label: "All contacts" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setContactSource(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    contactSource === key
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-0.5 gap-0.5">
              {[{ mode: "table", Icon: List }, { mode: "grid", Icon: LayoutGrid }].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-colors ${viewMode === mode ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Import CSV */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <UploadCloud className="w-4 h-4" /> Import
            </motion.button>

            {/* New contact */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
            >
              <UserPlus className="w-4 h-4" /> New Contact
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Total Contacts",  value: totalCount,           gradient: "from-indigo-500 to-violet-600",  Icon: Users      },
            { label: "Showing",         value: filtered.length,      gradient: "from-sky-500    to-blue-600",    Icon: SlidersHorizontal },
            { label: "New This Week",   value: newThisWeek,          gradient: "from-emerald-500 to-teal-500",   Icon: UserPlus   },
            { label: "With Email",      value: (Array.isArray(contacts) ? contacts : []).filter((c) => c.email).length, gradient: "from-orange-500 to-amber-500", Icon: Mail },
          ].map(({ label, value, gradient, Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08 + i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 leading-none tabular-nums">
                  {fetchingContacts ? <span className="inline-block w-8 h-5 bg-gray-100 rounded animate-pulse" /> : value}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Table view ── */}
        <AnimatePresence mode="wait">
          {viewMode === "table" && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      {TABLE_COLS.map(({ key, label, sortKey }) => (
                        <th
                          key={key}
                          onClick={() => sortKey && toggleSort(sortKey)}
                          className={`px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide select-none
                            ${sortKey ? "cursor-pointer hover:text-indigo-500 group" : ""}`}
                        >
                          <span className="inline-flex items-center">
                            {label}
                            {sortKey && <SortIcon col={sortKey} sortBy={sortBy} sortDir={sortDir} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fetchingContacts ? (
                      Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState
                            filtered={!!searchTerm}
                            onAdd={handleAddNew}
                            onClear={() => setSearchTerm("")}
                            source={contactSource}
                            onShowAll={() => setContactSource("all")}
                          />
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence>
                        {currentItems.map((contact, idx) => (
                          <motion.tr
                            key={contact?._id || contact?.id || idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, delay: idx * 0.025 }}
                            className="hover:bg-indigo-50/30 transition-colors group"
                          >
                            {/* # */}
                            <td className="px-5 py-3.5 text-xs text-gray-300 font-mono w-10">
                              {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                            </td>

                            {/* Name */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar first={contact?.firstName} last={contact?.lastName} />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                    {contact?.firstName} {contact?.lastName}
                                    {contact?.source === "ghl" && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100">GHL</span>
                                    )}
                                  </p>
                                  {contact?.company && (
                                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                      <Building2 className="w-2.5 h-2.5" /> {contact.company}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-5 py-3.5">
                              {contact?.email
                                ? <a href={`mailto:${contact.email}`} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors truncate max-w-[180px] block">
                                    {contact.email}
                                  </a>
                                : <span className="text-sm text-gray-300">—</span>
                              }
                            </td>

                            {/* Phone */}
                            <td className="px-5 py-3.5">
                              {contact?.phone
                                ? <a href={`tel:${contact.phone}`} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                                    {contact.phone}
                                  </a>
                                : <span className="text-sm text-gray-300">—</span>
                              }
                            </td>

                            {/* Company */}
                            <td className="px-5 py-3.5 text-sm text-gray-500">
                              {contact?.company || <span className="text-gray-300">—</span>}
                            </td>

                            {/* Actions — edit/delete only for app-saved contacts */}
                            <td className="px-5 py-3.5 text-right">
                              {contact?.source === "ghl" ? (
                                <span className="text-[11px] text-gray-300">In GoHighLevel</span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEditClick(contact)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                  >
                                    <Edit3 className="w-3 h-3" /> Edit
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(contact)}
                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer / pagination */}
              {!fetchingContacts && filtered.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                  <span className="text-xs text-gray-400">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} contacts
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Grid view ── */}
          {viewMode === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {fetchingContacts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-100 rounded" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  filtered={!!searchTerm}
                  onAdd={handleAddNew}
                  onClear={() => setSearchTerm("")}
                  source={contactSource}
                  onShowAll={() => setContactSource("all")}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentItems.map((contact, idx) => (
                      <ContactCard
                        key={contact?._id || idx}
                        contact={contact}
                        onEdit={handleEditClick}
                        onDelete={openDeleteModal}
                        idx={idx}
                      />
                    ))}
                  </div>

                  {/* Grid pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-1">
                      <span className="text-xs text-gray-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <span className="text-xs text-gray-500">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Side panel ── */}
      {isPanelOpen && (
        <NewContactFormPanel
          onClose={handleClosePanel}
          subaccountId={subaccountId}
          initialData={selectedContact}
        />
      )}

      {/* ── Delete confirm ── */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setContactToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contactToDelete?.firstName || "this contact"}? This action cannot be undone.`}
      />

      {/* ── Import CSV ── */}
      <ImportContactsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        subaccountId={subaccountId}
      />
    </div>
  );
};

export default Contacts;
