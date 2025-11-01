// src/components/AccountDetailSidebar.jsx
import React, { useState, useEffect } from "react";
import { X, ExternalLink, Lock, Users, UserPlus, Copy, Trash2 } from "lucide-react"; 

const QuickActionButton = ({ icon: Icon, text, linkText, hasLockIcon = false }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-3 text-gray-700">
      <Icon className="w-5 h-5 text-gray-500" />
      <span>{text}</span>
    </div>
    <button className="text-blue-600 text-sm hover:underline flex items-center">
      {linkText}
      {hasLockIcon && <Lock className="w-3 h-3 ml-1 text-blue-600" />}
      {linkText === "Invite Members" && <UserPlus className="w-4 h-4 ml-1 text-blue-600" />} 
    </button>
  </div>
);

export const AccountDetailSidebar = ({ isOpen, onClose, account }) => {
  
  const initialClientInfo = {
    fullName: "James Alteus",
    email: "upscaleboston617@gmail.com",
    phoneNumber: "+1401429948",
  };

  const initialAccessMembers = [
    { name: "-", email: "upscaleboston617@gmail.com", id: 'acc1' },
    { name: "-", email: "silverbrawny@gmail.com", id: 'acc2' },
  ];

  const [formData, setFormData] = useState({
    name: account?.name || '',
    firstName: initialClientInfo.fullName.split(' ')[0] || '', 
    email: initialClientInfo.email,
    phoneNumber: initialClientInfo.phoneNumber,
  });

  const [accessMembers, setAccessMembers] = useState(initialAccessMembers);

 
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        firstName: initialClientInfo.fullName.split(' ')[0] || '',
        lastName: initialClientInfo.fullName.split(' ')[1] || '',
        email: initialClientInfo.email,
        phoneNumber: initialClientInfo.phoneNumber,
      });
      
      setAccessMembers(initialAccessMembers); 
    }
  }, [account]); 

  if (!isOpen || !account) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    console.log("Saving changes for account:", account.name, formData, accessMembers);
    
    onClose();
  };

  const handleRemoveMember = (memberId) => {
    setAccessMembers(prev => prev.filter(member => member.id !== memberId));
    console.log("Removing member:", memberId);
  };

  return (
    <div className={`fixed inset-0 z-40 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-25' : 'opacity-0'}`} 
        onClick={onClose}
      ></div>

      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out z-50 
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            {account.name} 
            <span className="text-sm text-gray-500 font-normal ml-3 flex items-center">
                ID: {account.locationId}
                <button className="ml-2 text-gray-400 hover:text-gray-600" title="Copy ID">
                    <Copy className="w-4 h-4" />
                </button>
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </header>

        <div className="p-6 pb-20"> 
          <section className="mb-8 border border-gray-200 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Quick Actions</h3>
            <QuickActionButton icon={ExternalLink} text="Preview" linkText="Open In A New Tab" />
            <QuickActionButton icon={Lock} text="Lock" linkText="Lock Sub-account" hasLockIcon={true} />
            <QuickActionButton icon={Users} text="Users" linkText="Invite Members" />
          </section>

          {/* Account Info */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Account Info</h3>
            <div className="space-y-4">
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Name</span>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" 
                    />
                </label>
            </div>
          </section>

          {/* Client Info */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Client Info</h3>
            <div className="space-y-4">
                <div className="flex gap-4"> 
                    <label className="block flex-1">
                        <span className="text-sm font-medium text-gray-700">First Name</span>
                        <input 
                            type="text" 
                            name="firstName" 
                            value={formData.firstName}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </label>
                    <label className="block flex-1">
                        <span className="text-sm font-medium text-gray-700">Last Name</span>
                        <input 
                            type="text" 
                            name="lastName" 
                            value={formData.lastName}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </label>
                </div>
                {/* Email */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" 
                    />
                </label>
                {/* Phone Number */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Phone Number</span>
                    <input 
                        type="tel" 
                        name="phoneNumber" 
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500" 
                    />
                </label>
            </div>
          </section>

          {/* Access Management Table */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Access Management</h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                        <tr>
                            <th className="p-3 text-left font-medium w-1/3">Name</th>
                            <th className="p-3 text-left font-medium w-1/3">Email</th>
                            <th className="p-3 text-right font-medium w-1/6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {accessMembers.map((member) => (
                            <tr key={member.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                <td className="p-3 align-middle">{member.name}</td>
                                <td className="p-3 align-middle">{member.email}</td>
                                <td className="p-3 text-right align-middle">
                                    <button 
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-red-400 hover:text-red-600"
                                        title="Remove Member"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {accessMembers.length === 0 && (
                            <tr>
                                <td colSpan="3" className="p-3 text-center text-gray-400">No members to display.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </section>

        </div>
        <div className=" w-full sm:w-[500px] lg:w-[600px] bg-white border-t p-4 shadow-lg flex justify-end">
            <button 
                onClick={handleSaveChanges} 
                className="px-6 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
            >
                Save Changes
            </button>
        </div>

    

      </div>
    </div>
  );
};