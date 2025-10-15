// src/components/MembersSettings.jsx

import React from 'react';
import Card from '../ui/Card';
import { Star, Trash2 } from 'lucide-react'; // For icons

const MemberRow = ({ name, email, isAdmin }) => (
  <div className="grid grid-cols-[1fr_2fr_auto] items-center gap-4 py-3 border-b text-sm last:border-b-0">
    <div className="flex items-center">
      {isAdmin && <Star className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" />}
      {name}
    </div>
    <div className="text-gray-600">{email}</div>
    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const MembersSettings = () => {
  const members = [
    { name: 'Super Admin', email: 'superadmin@centerfy.ai', isAdmin: true },
    { name: '-', email: 'kenny@mail.yashayah.ai', isAdmin: false },
    { name: '-', email: 'sylvesterzed@gmail.com', isAdmin: false },
    { name: '-', email: 'jp@centerfy.ai', isAdmin: false },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Members</h2>
        <span className="text-sm text-gray-500">{members.length} members</span>
      </div>
      
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_2fr_auto] gap-4 py-3 border-b text-sm font-medium text-gray-500 uppercase tracking-wider">
        <div>Name</div>
        <div>Email</div>
        <div className="w-8"></div> {/* Placeholder for delete button column */}
      </div>

      {/* Member Rows */}
      <div className="divide-y divide-gray-100">
        {members.map((member, index) => (
          <MemberRow key={index} {...member} />
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors">
          Invite Members
        </button>
      </div>
    </Card>
  );
};

export default MembersSettings;