// src/components/WebhooksContent.jsx

import React from 'react';
import { CircleAlert } from 'lucide-react';
import Card from '../ui/Card';

const WebhookEventToggle = ({ name, description }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div className="flex items-center">
      <span className="text-base font-semibold text-gray-800 mr-2">{name}</span>
      <span className="text-gray-400 cursor-help" title={description}>
        <CircleAlert className="w-4 h-4" />
      </span>
    </div>
    {/* Tailwind Toggle Switch implementation */}
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" value="" className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);


const WebhooksContent = () => (
  <Card>
    <h2 className="text-lg font-semibold text-gray-700 mb-4">Webhook Events</h2>
    
    <div className="mb-6">
      <label htmlFor="endpoint-url" className="block text-sm font-medium text-gray-700 mb-1">
        Endpoint URL
      </label>
      <input
        type="url"
        id="endpoint-url"
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        placeholder=""
      />
    </div>

    <div className="space-y-4 ">
      <WebhookEventToggle name="Oauth Events" description="Description for Oauth Events" />
      <WebhookEventToggle name="Call Events" description="Description for Call Events" />
      <WebhookEventToggle name="Message Events" description="Description for Message Events" />
      <WebhookEventToggle name="Payment Events" description="Description for Payment Events" />
    </div>

    <div className="flex justify-end mt-8 pt-4 border-t">
      <button className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors">
        Save Changes
      </button>
    </div>
  </Card>
);

export default WebhooksContent;