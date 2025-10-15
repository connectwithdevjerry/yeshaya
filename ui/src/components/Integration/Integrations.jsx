// src/components/IntegrationsContent.jsx

import React from 'react';
import { ChevronRight, Plug, Settings, CreditCard } from 'lucide-react';
import Card from '../ui/Card'; 
const IntegrationItem = ({ icon: Icon, name, description, isConnected, image_url }) => (
  <div className="flex justify-between items-center py-4 border-b last:border-b-0">
    <div className="flex items-center">
      <div className="mr-4 text-2xl text-indigo-600">
        <img src={image_url} className='w-[40px]' alt="" />
      </div>
      <div>
        <div className="text-xl font-semibold text-gray-800">{name}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </div>
    <div className="flex items-center">
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {isConnected ? 'Connected' : 'Connect'}
      </span>
      <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
    </div>
  </div>
);

const IntegrationsContent = () => (
  <Card>
    <IntegrationItem
      icon={Plug}
      name="GoHighLevel"
      image_url="https://canny-assets.io/icons/5b918f2630865c174eaa9483fdedac22.png"
      description="Connect GoHighLevel to import your sub-accounts, manage connections & more"
      isConnected={true}
    />
    <IntegrationItem
      icon={Settings}
      name="OpenAI"
      image_url="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1749527355219"
      description="Connect OpenAI to use our assistant / agent framework using your own keys"
      isConnected={true}
    />
    <IntegrationItem
      icon={CreditCard}
      name="Stripe"
      image_url="https://freelogopng.com/images/all_img/1685814539stripe-icon-png.png"
      description="Connect Stripe to re-bill or resell AI voice minutes using your own Stripe"
      isConnected={true}
    />
  </Card>
);

export default IntegrationsContent;