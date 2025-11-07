import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  Home,
  Cloud,
  Volume2,
  Trash2,
  MessageCircle,
} from "lucide-react";
import NewKnowledgeBaseModal from "../../components/components-ghl/Knowledge/KnowledgeModal";
import TabButton from "../../components/components-ghl/TabButton";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { useDispatch, useSelector } from "react-redux";

const knowledgeBases = [
  {
    id: "kb-1",
    name: "My Blogs",
    updated: "Oct 21, 2025 4:24 pm",
    created: "Oct 21, 2025 4:20 pm",
    sourcesCount: 4,
    isVoiceEnabled: false,
  },
];

const KnowledgePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const navigate = useNavigate();
  const location = useLocation();
  const account = useCurrentAccount();

  const filteredBases = knowledgeBases.filter((base) => {
    if (activeTab === "all") return true;
    if (activeTab === "voice") return base.isVoiceEnabled;
    if (activeTab === "empty") return base.sourcesCount === 0;
    return false;
  });

  
  const headers = ["NAME", "UPDATED", "CREATED", "SOURCES"];

  const handleKnowledgeClick = (base) => {
    if (location.pathname === "/app" && account) {
      // Navigate with account context
      const params = new URLSearchParams({
        agencyid: account.agencyid,
        subaccount: account.subaccount,
        allow: account.allow,
        myname: account.myname,
        myemail: account.myemail,
        route: `/knowledge/${base.id}`,
      });
      navigate(`/app?${params.toString()}`);
    } else {
      // Regular navigation
      navigate(`/knowledge/${base.id}`);
    }
  };

  return (
    <div className="flex-grow bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors flex items-center"
          >
            + New Knowledge Base
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4 bg-white rounded-t-lg shadow-sm">
          <TabButton
            isActive={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            All {knowledgeBases.length}
          </TabButton>
          <TabButton
            isActive={activeTab === "voice"}
            onClick={() => setActiveTab("voice")}
          >
            Voice 0
          </TabButton>
          <TabButton
            isActive={activeTab === "empty"}
            onClick={() => setActiveTab("empty")}
          >
            Empty 0
          </TabButton>
        </div>

        <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </div>
          <span className="text-gray-500">{filteredBases.length}</span>
        </div>

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 w-10"></th>

                {headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-48"
                ></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBases.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length + 2}
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Ban className="w-8 h-8 text-gray-400 mb-2" />
                      No knowledge to display
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBases.map((base) => (
                  <tr
                    key={base.id}
                    className="hover:bg-gray-50 transition-colors"
                    onClick={() => handleKnowledgeClick(base)}
                  >
                    <td className="pl-6 text-gray-500 py-4 whitespace-nowrap">
                      <MessageCircle />
                    </td>
                    <td className="pl-3 py-4 whitespace-nowrap text-sm font-medium text-black cursor-pointer ">
                      {base.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {base.updated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-sm text-gray-500">
                      {base.created}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className=" border px-3 py-2 rounded-md font-medium cursor-pointer">
                        {base.sourcesCount} sources
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-300 transition-colors">
                          <Volume2 className="w-4 h-4 text-green-600" />
                          <span>ENABLE VOICE</span>
                        </button>
                        <button className="p-2 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex border justify-between items-center p-3">
            <div className="flex items-center space-x-4 text-sm text-gray-700">
              <div className="relative">
                <select className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option>10</option>
                </select>
              </div>
              <span>Showing 1 - 10</span>
              <span className="font-medium text-gray-500">1 Results</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="text-gray-500">Page 1 of 1</div>
              <button
                className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                disabled
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                disabled
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <NewKnowledgeBaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default KnowledgePage;
