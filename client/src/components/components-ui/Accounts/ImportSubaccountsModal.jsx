import React, { useMemo, useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { importSubAccounts } from "../../../store/slices/integrationSlice";
import apiClient from "../../../store/api/config"; // assuming you have this for fetching

const ImportSubaccountsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [subAccounts, setSubAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);
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

    if (!ids.length) return;

    console.log("Importing subaccounts with IDs:", ids);

    dispatch(importSubAccounts(ids))
      .unwrap()
      .then((res) => {
        if (
          res.status === false &&
          res.message === "Sub-accounts Already Installed!"
        ) {
          alert("Sub-accounts Already Installed!");
          console.warn("Already installed:", ids);
        } else {
          alert("Subaccounts imported successfully!");
          console.log("Subaccounts imported successfully:", ids);
        }
      })
      .catch((err) => {
        console.error("Import failed:", err);
        alert("Failed to import subaccounts!");
      });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-[820px] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">Import Sub-accounts</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
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
                className="p-2 border rounded hover:bg-gray-100"
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
                className="p-2 border rounded hover:bg-gray-100"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-5 py-2 rounded-md bg-gradient-to-r from-violet-500 to-pink-400 text-white"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportSubaccountsModal;
