import React, { useState } from 'react';
import { X, Info, PlusCircle, Trash2 } from 'lucide-react';

const FaqInputView = ({ onClose, onBack, onNext }) => {
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index) => {
    if (faqs.length > 1) {
      setFaqs(faqs.filter((_, i) => i !== index));
    }
  };

  const updateFaq = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const isFormValid = faqs.every(f => f.question.trim() && f.answer.trim());

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Upload</h2>
          <Info size={18} className="text-gray-400 cursor-help" />
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="flex items-start gap-3 group">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, 'question', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm shadow-sm"
                />
              </div>
              
              <div className="flex items-center pt-2">
                {index === faqs.length - 1 ? (
                  <button 
                    onClick={addFaq}
                    className="text-[#10b981] hover:text-[#059669] transition-colors"
                  >
                    <PlusCircle size={24} />
                  </button>
                ) : (
                  <button 
                    onClick={() => removeFaq(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button 
          onClick={onBack} 
          className="px-5 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onNext(faqs)}
          disabled={!isFormValid}
          className={`px-8 py-2 rounded-lg font-semibold text-white transition-all shadow-sm ${
            isFormValid 
              ? 'bg-[#a389f4] hover:bg-[#9175e6] active:scale-95' 
              : 'bg-purple-300 cursor-not-allowed'
          }`}
        >
          Upload
        </button>
      </div>
    </>
  );
};

export default FaqInputView;