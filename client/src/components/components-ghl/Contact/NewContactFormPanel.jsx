import React, { useEffect } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createContact, updateContact, fetchContacts , clearContactStatus} from '../../../store/slices/assistantsSlice';
import { toast } from 'react-hot-toast';

export function NewContactFormPanel({ onClose, subaccountId, initialData }) {
  const dispatch = useDispatch();
  
  // Robust check for editing mode
  const isEditing = !!(initialData?._id || initialData?.id);
  
  const { contactActionLoading } = useSelector((state) => state.assistants);

  useEffect(() => {
    dispatch(clearContactStatus());
  }, [dispatch]);

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    company: '',
    title: '',
  });

  // Populate form when initialData is provided (Edit Mode)
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        linkedin: initialData.linkedin || '',
        company: initialData.company || '',
        title: initialData.title || '',
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => {
    const { id, value, name } = e.target;
    const fieldName = id || name;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email) {
      toast.error("First name and Email are required");
      return;
    }

    try {
      if (isEditing) {
        // UPDATE LOGIC
        await dispatch(updateContact({ 
          subaccountId, 
          contactId: initialData._id || initialData.id, 
          contactData: formData 
        })).unwrap();
        toast.success("Contact updated successfully");
      } else {
        // CREATE LOGIC
        await dispatch(createContact({ 
          subaccountId, 
          contactData: formData 
        })).unwrap();
        toast.success("Contact created successfully");
      }
      
      // Refresh the list and close
      dispatch(fetchContacts({ subaccountId }));
      onClose();
    } catch (error) {
      toast.error(error || `Failed to ${isEditing ? 'update' : 'create'} contact`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-hidden">
      <div className="fixed top-0 right-0 h-full bg-white shadow-2xl w-full max-w-lg transform translate-x-0 transition-transform duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-start">
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 mr-4 p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" /> 
          </button>
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Contact' : 'New Contact'}
          </h3>
        </div>

        <form id="contact-form" onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Name Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">linkedin.com/in/</span>
                </div>
                <input
                    type="text"
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm pl-32 focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
          </div>
          
          <div className="h-20"></div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
          <button
            type="submit"
            form="contact-form"
            disabled={contactActionLoading}
            className="px-6 py-2 bg-black text-white font-medium rounded-md shadow-md flex items-center disabled:bg-gray-400"
          >
            {contactActionLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Contact'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}