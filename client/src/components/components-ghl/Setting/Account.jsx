import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../../../store/slices/authSlice";
import Card from "../ui/Card";
import { Loader2 } from "lucide-react";

const AccountSettings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Local state for the form inputs
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // 1. Fetch user details on mount
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);

  // 2. Sync local form state when Redux user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "", // Assuming your API might return phone
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving changes:", formData);
    // You would dispatch an updateProfile action here
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen w-[800px]">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 w-[800px] min-h-screen font-sans">
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="No phone number set"
          />
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4"> Account Security </h2>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <p className="text-gray-600 text-base">
              {user?.email || "Loading email..."}
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 transition-colors">
            Change Email
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <p className="text-gray-600 text-base"> ************ </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 transition-colors">
            Reset Password
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AccountSettings;