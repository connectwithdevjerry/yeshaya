// src/components/settings/BrandingTab.jsx
import React, { useState } from "react";
import { Button } from "../ui/Button";

export default function BrandingTab() {
  const [brandColor, setBrandColor] = useState("#1038e1");

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">White Label Settings</h2>
      <div className="bg-gray-50 p-6 rounded-xl space-y-6">
        {/* Company Logo */}
        <div>
          <label className="block text-sm font-medium mb-2">Company Logo</label>
          <div className="w-24 h-24 rounded-md border flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Company Logo"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input
            type="text"
            placeholder="YashaYah"
            className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-100"
          />
        </div>

        {/* Brand Color */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Brand Color Hex Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="border rounded-md px-3 py-2 w-full"
            />
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-12 h-10 border rounded-md"
            />
          </div>
        </div>

        {/* Documentation URL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Documentation URL
          </label>
          <input
            type="url"
            placeholder="https://docs.yashayah.ai"
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Button */}
        <Button className="mt-4">Update Branding</Button>
      </div>
    </div>
  );
}
