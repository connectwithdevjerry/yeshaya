import React, { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Tag as TagIcon, 
  MoreHorizontal, 
  Trash2,
  MoveRight
} from 'lucide-react';
import CreateActiveTagModal from '../../components/components-ghl/ActiveTag/ActiveTag';

// Sample data from the image
const activeTags = [
  {
    id: 1,
    name: 'New Tag zO0xy0',
    updated: 'Oct 28, 2025 1:43 pm',
    tagValue: '1761655360642×166378648116133900',
    assistant: 'Obaloluwa'
  },
  {
    id: 2,
    name: 'New Tag k6PwBP',
    updated: 'Oct 28, 2025 4:44 pm',
    tagValue: '1761663053864×888663562962600000',
    assistant: 'Jerry'
  }
];

const TagsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const headers = ['NAME', 'UPDATED', 'TAG', 'LINKED ASSISTANT'];

  return (
    <div className="flex-grow bg-[#f9fafb]  p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-full mx-auto">
        
        {/* Top Action Bar */}
        <div className="flex justify-end items-center mb-8 gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#0f172a] text-white text-sm font-bold rounded-md shadow-sm hover:bg-slate-800 transition-all flex items-center"
          >
            <span className="mr-1">+</span> Create Active Tag
          </button>
        </div>

        {/* Breadcrumb / Counter */}
        <div className="text-sm font-bold text-gray-800 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-gray-600" />
            <span>Home</span>
          </div>
          <span className="text-gray-400 text-xs">2</span>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
          <table className="w-full text-left table-fixed border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[#64748b] border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-[25%]">NAME</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-[20%]">UPDATED</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-[30%]">TAG</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-[15%]">LINKED ASSISTANT</th>
                <th className="px-6 py-4 w-[10%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50/50 transition-colors group">
                  {/* Name Column */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <TagIcon className="w-4 h-4 text-gray-900 shrink-0" />
                      <span className="text-sm font-bold text-gray-900 truncate">{tag.name}</span>
                    </div>
                  </td>
                  
                  {/* Updated Column */}
                  <td className="px-6 py-5 text-sm text-gray-600 truncate">
                    {tag.updated}
                  </td>
                  
                  {/* Tag ID Column */}
                  <td className="px-6 py-5 text-sm text-gray-800 font-medium truncate">
                    {tag.tagValue}
                  </td>
                  
                  {/* Linked Assistant Column */}
                  <td className="px-6 py-5">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                      {tag.assistant}
                      <MoveRight size={14} className="text-gray-400" />
                    </button>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-400">
                        <MoreHorizontal size={14} />
                      </button>
                      <button className="p-1.5 border border-red-50 rounded hover:bg-red-50 text-red-200 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-500">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <select className="bg-white border border-gray-200 rounded px-2 py-1 outline-none">
              <option>10</option>
            </select>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <span>Showing 1 - 10</span>
              <span className="font-bold text-gray-800">2 Results</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span>Page 1 of 1</span>
            <div className="flex items-center gap-1">
              <button disabled className="p-1 text-gray-300 cursor-not-allowed">
                <ChevronLeft size={18} />
              </button>
              <button disabled className="p-1 text-gray-300 cursor-not-allowed">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreateActiveTagModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TagsPage;