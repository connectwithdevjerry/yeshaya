import React, { useMemo, useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { importSubAccounts } from "../../../store/slices/integrationSlice";
import apiClient from "../../../store/api/config";
import toast from "react-hot-toast";

const ImportSubaccountsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [subAccounts, setSubAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [importing, setImporting] = useState(false);
  const perPage = 8;

  // Fetch subaccounts locally when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      setSelectedIds(new Set());
      setPage(1);

      apiClient
        .get("/integrations/get-subaccounts?userType=anon")
        .then((res) => {
          const locations = res.data?.data?.locations || [];
          setSubAccounts(locations);
          setLoading(false);
        })
        .catch((err) => {
          console.error(
            "Failed to fetch subaccounts:",
            err.response?.data || err.message
          );
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load subaccounts"
          );
          setLoading(false);
        });
    }
  }, [isOpen]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return subAccounts.slice(start, start + perPage);
  }, [subAccounts, page]);

  if (!isOpen) return null;

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    const allIdsOnPage = paged.map((l) => l.id);
    const hasAll = allIdsOnPage.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (hasAll) allIdsOnPage.forEach((id) => next.delete(id));
      else allIdsOnPage.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleImport = () => {
    const selected = subAccounts.filter((l) => selectedIds.has(l.id));
    const ids = selected.map((l) => l.id);

    if (!ids.length) {
      alert("Please select at least one subaccount to import");
      return;
    }

    console.log("🚀 Starting import for IDs:", ids);
    setImporting(true);

    dispatch(importSubAccounts(ids))
      .unwrap()
      .then((response) => {
        console.log("📥 IMPORT RESPONSE RECEIVED:", response);
        
        // Handle the already installed case
        if (response.alreadyInstalled) {
          console.log("ℹ️ Sub-accounts already installed:", ids);
          toast.success("Sub-accounts Already Installed!");
        } else {
          console.log("✅ Subaccounts imported successfully:", response);
          toast.success("Subaccounts imported successfully!");
        }
        setImporting(false);
        onClose();
      })
      .catch((err) => {
        console.error("❌ IMPORT ERROR:", err);
        toast.error(`Failed to import subaccounts: ${err.message || JSON.stringify(err)}`);
        setImporting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-[820px] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">Import Sub-accounts</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-gray-100"
            disabled={importing}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-sm text-gray-500">{subAccounts.length}</div>
          </div>

          {loading ? (
            <div className="text-center p-6 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center p-6 text-red-500">{error}</div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left w-10">
                      <input
                        type="checkbox"
                        onChange={toggleAllOnPage}
                        checked={
                          paged.length > 0 &&
                          paged.every((l) => selectedIds.has(l.id))
                        }
                        disabled={importing}
                      />
                    </th>
                    <th className="p-3 text-left">NAME</th>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">INSTALLED</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400">
                        No locations to display
                      </td>
                    </tr>
                  ) : (
                    paged.map((loc) => (
                      <tr key={loc.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(loc.id)}
                            onChange={() => toggle(loc.id)}
                            disabled={importing}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-gray-800">
                            {loc.name || loc.business?.name || "Unnamed"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {loc.firstName
                              ? `${loc.firstName} ${loc.lastName ?? ""}`
                              : loc.email}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{loc.id}</td>
                        <td className="p-3 text-gray-600">
                          {loc.installed ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div>
              Page {page} of{" "}
              {Math.max(1, Math.ceil(subAccounts.length / perPage))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 1 || importing}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      Math.max(1, Math.ceil(subAccounts.length / perPage)),
                      p + 1
                    )
                  )
                }
                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  page >= Math.ceil(subAccounts.length / perPage) || importing
                }
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={importing}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-5 py-2 rounded-md bg-gradient-to-r from-violet-500 to-pink-400 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={importing || selectedIds.size === 0}
          >
            {importing ? (
              <>
                <span className="animate-spin">⏳</span>
                Importing...
              </>
            ) : (
              "Import"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportSubaccountsModal;