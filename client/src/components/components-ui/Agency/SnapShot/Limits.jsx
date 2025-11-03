import React, { useState } from "react";

export default function LimitsTab() {
  const [limits, setLimits] = useState({
    assistants: false,
    messages: false,
    calling: false,
    phones: false,
  });

  const toggle = (key) => setLimits({ ...limits, [key]: !limits[key] });

  const fields = [
    {
      key: "assistants",
      title: "Maximum number of assistants",
      label: "Unlimited assistants",
    },
    {
      key: "messages",
      title: "Maximum number of messages",
      label: "Unlimited messages",
    },
    {
      key: "calling",
      title: "Maximum minutes of calling",
      label: "Unlimited call (pay-as-you-go)",
    },
    {
      key: "phones",
      title: "Maximum amount of phone numbers",
      label: "Unlimited phone numbers",
    },
  ];

  return (
    <div className="">
      <h2 className="text-3xl font-semibold mb-4">Limits</h2>
      <hr className="my-6"/>

      <div className="space-y-6">
        {fields.map((f) => (
          <div
            key={f.key}
            className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4"
          >
            <div className="flex flex-col item-center gap-4">
              <p className="font-medium text-gray-400">{f.label}</p>
              <p className="font-medium text-xl">{f.title}</p>
            </div>
            <div className="flex flex-col gap-5 items-center space-x-3 mt-2 md:mt-0">
              <button
                onClick={() => toggle(f.key)}
                className={`relative inline-flex h-6 w-11 rounded-full transition ${
                  limits[f.key] ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-4 w-4 bg-white rounded-full transform transition ${
                    limits[f.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <input
                type="number"
                placeholder="0"
                disabled={!limits[f.key]}
                className="border w-[200px] rounded-md px-3 py-2 text-sm w-28 text-center disabled:bg-gray-100"
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
