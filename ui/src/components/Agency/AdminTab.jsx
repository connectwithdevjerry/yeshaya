// src/components/settings/AdminTab.jsx
import React from "react";
import { Button } from "../ui/Button";
import { CircleAlert } from "lucide-react";

export default function AdminTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Manage Admin Settings</h2>
      <div className="bg-gray-50 p-6 rounded-xl space-y-4 ">
        <div>
          <label className="block text-sm font-medium mb-1">
            Admin Lock Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <hr />
        <div className="flex justify-between items-center">
          <div className="">
            <label className="flex gap-4 items-center block text-md font-medium mb-1">
              Resend API <CircleAlert />
            </label>
            <p className="text-md text-gray-500 mb-2">Not Configured</p>
          </div>
          <button className="py-3 px-6 text-gray-500 font-bold rounded-md border bg-white hover:bg-gray-100">
            Configure Resend
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
