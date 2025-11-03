import React, { useState } from "react";

export default function ReBillingTab() {
  const [charges, setCharges] = useState({
    voice: false,
    chat: false,
    kb: false,
    phone: false,
  });

  const toggle = (key) => {
    setCharges({ ...charges, [key]: !charges[key] });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Re-billing</h2>

      <div className="space-y-6">
        {[
          {
            key: "voice",
            label: "Charge For AI Voice Minutes",
            note: "Price per minute",
          },
          {
            key: "chat",
            label: "Charge For AI Chat Messages",
            note: "Price per message",
          },
          {
            key: "kb",
            label: "Charge For Voice Knowledge Bases",
            note: "Price per knowledge base",
          },
          {
            key: "phone",
            label: "Charge For Phone Numbers",
            note: "Price per phone number",
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4"
          >
            <div className="flex flex-col gap-4">
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-gray-500">{item.note}</p>
            </div>
            <div className="flex flex-col gap-3 items-center space-x-3 mt-2 md:mt-0">
              <button
                onClick={() => toggle(item.key)}
                className={`relative inline-flex h-6 w-11 rounded-full transition ${
                  charges[item.key] ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-4 w-4 bg-white rounded-full transform transition ${
                    charges[item.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <input
                type="text"
                placeholder="-"
                disabled={!charges[item.key]}
                className="border rounded-md px-3 py-2 text-sm w-28 text-center disabled:bg-gray-100"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center md:justify-end mt-6">
        <button className="bg-black text-white text-sm font-medium py-2 px-5 rounded-md hover:bg-gray-900">
          Save Changes
        </button>
      </div>
    </div>
  );
}
