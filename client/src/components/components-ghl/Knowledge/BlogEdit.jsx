import React, { useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Search,
  ListOrdered, // FAQ icon
  FileText, // File icon
  Globe, // URL icon
  Type, // Text icon
  Trash2,
  MoreVertical,
  Home,
  Cloud,
  Copy,
  MoreHorizontal,
} from "lucide-react";

// --- Mock Data ---
const dataSources = [
  {
    id: 1,
    source: "New data source",
    dataPoints: "2 vectors",
    type: "faq",
    created: "Oct 21, 2025 4:21 pm",
    status: "Complete",
  },
  {
    id: 2,
    source: "New data source",
    dataPoints: "1 vectors",
    type: "file",
    created: "Oct 21, 2025 4:22 pm",
    status: "Complete",
  },
  {
    id: 3,
    source: "New data source",
    dataPoints: "1 vectors",
    type: "url",
    created: "Oct 21, 2025 4:23 pm",
    status: "Complete",
  },
  {
    id: 4,
    source: "New data source",
    dataPoints: "2 vectors",
    type: "text",
    created: "Oct 21, 2025 4:24 pm",
    status: "Complete",
  },
];
// --- End Mock Data ---

// Helper function to get icon based on type
const getSourceIcon = (type) => {
  switch (type) {
    case "faq":
      return <ListOrdered className="w-5 h-5 text-gray-500" />;
    case "file":
      return <FileText className="w-5 h-5 text-gray-500" />;
    case "url":
      return <Globe className="w-5 h-5 text-gray-500" />;
    case "text":
      return <Type className="w-5 h-5 text-gray-500" />;
    default:
      return <Cloud className="w-5 h-5 text-gray-500" />;
  }
};

// Component for the stat cards
const StatCard = ({ title, count, colorClass, isActive }) => (
  <div
    className={`p-6 rounded-lg shadow-md flex flex-col justify-center transition-all duration-300 ${
      isActive
        ? "border-2 border-blue-600 bg-white"
        : "border border-gray-200 bg-white"
    }`}
  >
    <div
      className={`text-xs font-semibold uppercase ${
        isActive ? "text-blue-600" : "text-gray-500"
      }`}
    >
      {title}
    </div>
    <div className={`text-2xl font-bold ${colorClass}`}>{count}</div>
  </div>
);

const KnowledgeDetailPage = () => {
  const totalSources = dataSources.length;
  const completeSources = dataSources.filter(
    (d) => d.status === "Complete"
  ).length;
  const errorSources = dataSources.filter((d) => d.status === "Error").length;

  const headers = ["SOURCE", "DATA POINTS", "TYPE", "CREATED", "STATUS"];

  // Mock function for navigation/action
  const handleBack = () => console.log("Navigating back to KnowledgePage...");
  const handleTest = () => console.log("Testing knowledge base...");
  const handleNewData = () => console.log("Adding new data...");
  const handleEditName = () => console.log("Editing knowledge base name...");

  return (
    <div className="flex-grow  bg-gray-50">
            {/* Knowledge Base Header */}
        <div className="flex p-2 bg-white border justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-1 border  rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-8 h-6" />
            </button>
            <div className="">
              <div className="text-xl flex items-center font-semibold text-gray-900">
                My Blogs
                <button
                  onClick={handleEditName}
                  className="ml-2"
                >
                  <Pencil className="w-6 h-6 p-1 rounded-md  hover:bg-gray-200" />
                </button>
              </div>
              <div className="flex  gap-3 items-center text-sm text-gray-500">
                1761...6300
                <Copy className="w-6 h-6 p-1 rounded-md  hover:bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 pr-3">
            <button
              onClick={handleTest}
              className="px-4 py-2 text-md  font-medium rounded-lg bg-[#410fcc] text-white border border-blue-600 hover:bg-blue-700 transition-colors"
            >
              Test Results
            </button>
            <button
              onClick={handleNewData}
              className="px-4 py-2 bg-black text-white text-md font-medium rounded-lg shadow-md hover:bg-gray-800 transition-colors flex items-center space-x-1"
            >
              + New Data
            </button>
          </div>
        </div>
      <div className="max-w-7xl px-6 mx-auto space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-6 pt-4">
          <StatCard
            title="All"
            count={totalSources}
            colorClass="text-gray-900"
            isActive={true}
          />
          <StatCard
            title="Complete"
            count={completeSources}
            colorClass="text-green-600"
            isActive={false}
          />
          <StatCard
            title="Error"
            count={errorSources}
            colorClass="text-red-600"
            isActive={false}
          />
        </div>

        {/* Home Link & Count */}
        <div className="flex justify-between items-center text-sm font-medium text-gray-600 pt-2 px-6">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </div>
          <span className="text-gray-500">{totalSources}</span>
        </div>

        {/* Data Sources Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                {/* Empty TH for Actions */}
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                ></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataSources.map((data) => (
                <tr
                  key={data.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* SOURCE */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-3">
                      {getSourceIcon(data.type)}
                      <span>{data.source}</span>
                    </div>
                  </td>

                  {/* DATA POINTS */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.dataPoints}
                  </td>

                  {/* TYPE */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.type}
                  </td>

                  {/* CREATED */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.created}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-gray-500 border  bg-gray-100 px-3 py-1 rounded-md text-xs font-medium">
                      {data.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      {/* Options Button */}
                      <button className="p-1 border bg-gray-100 rounded-md text-gray-400 hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button className="p-1 border bg-red-200 rounded-md text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDetailPage;
