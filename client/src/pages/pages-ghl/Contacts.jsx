import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Trash2, Edit3, Ban, Users } from "lucide-react"; // Added Users icon
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContacts,
  deleteContact,
} from "../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl } from "../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { NewContactFormPanel } from "../../components/components-ghl/Contact/NewContactFormPanel";
import ConfirmDeleteModal from "../../components/components-ghl/ConfirmDeleteModal";

const Contacts = () => {
  const dispatch = useDispatch();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchParams] = useSearchParams();

  // State for Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const { contacts = [], fetchingContacts } = useSelector(
    (state) => state.assistants,
  );
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  useEffect(() => {
    if (subaccountId) {
      dispatch(fetchContacts({ subaccountId }));
    }
  }, [dispatch, subaccountId]);

  // --- Handlers ---

  const handleEditClick = (contact) => {
    setSelectedContact(contact);
    setIsPanelOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedContact(null);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedContact(null);
  };

  const openDeleteModal = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;

    const contactId = contactToDelete._id || contactToDelete.id;

    try {
      await dispatch(deleteContact({ subaccountId, contactId })).unwrap();
      toast.success("Contact deleted");
      setShowDeleteModal(false);
      setContactToDelete(null);
      // Re-fetch to ensure sync
      dispatch(fetchContacts({ subaccountId }));
    } catch (error) {
      toast.error(error || "Failed to delete contact");
    }
  };

  const filteredContacts = useMemo(() => {
    const baseContacts = Array.isArray(contacts) ? [...contacts] : [];
    baseContacts.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );

    return baseContacts.filter((contact) => {
      if (!contact) return false;
      const searchStr = searchTerm.toLowerCase();
      return (
        (contact.firstName || "").toLowerCase().includes(searchStr) ||
        (contact.lastName || "").toLowerCase().includes(searchStr) ||
        (contact.email || "").toLowerCase().includes(searchStr) ||
        (contact.company || "").toLowerCase().includes(searchStr)
      );
    });
  }, [contacts, searchTerm]);

  return (
    <div className="flex-grow bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Title with Contact Count */}
        <div className="flex items-center space-x-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <span className="bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-semibold">
            {filteredContacts.length}
          </span>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-grow max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            onClick={handleAddNewClick}
            className="ml-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 flex items-center transition-colors"
          >
            + New Contact
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fetchingContacts ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Ban className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No contacts found
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact, index) => (
                  <tr
                    key={contact?._id || contact?.id || index}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact?.firstName} {contact?.lastName}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                      {contact?.email}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {contact?.phone || "N/A"}
                    </td>
                    <td className="px-8 py-3 whitespace-nowrap text-sm text-gray-500">
                      {contact?.company || "N/A"}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(contact)}
                          className="flex items-center space-x-1 px-3 py-1 border rounded-md text-xs hover:bg-gray-100 text-gray-600 transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(contact)} // Changed to open the modal
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER PANEL */}
      {isPanelOpen && (
        <NewContactFormPanel
          onClose={handleClosePanel}
          subaccountId={subaccountId}
          initialData={selectedContact}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setContactToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contactToDelete?.firstName || "this contact"}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Contacts;
