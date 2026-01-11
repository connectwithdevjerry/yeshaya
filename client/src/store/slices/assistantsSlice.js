// src/store/slices/assistantsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

// ✅ Fetch assistants
export const fetchAssistants = createAsyncThunk(
  "assistants/fetchAll",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/assistants/get-all?subaccountId=${subaccountId}`
      );

      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Failed to fetch");
      }

      const cleanedData = (response.data.data || []).filter(Boolean);
      return cleanedData;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Error fetching assistants"
      );
    }
  }
);

// ✅ Get single assistant
export const getAssistantById = createAsyncThunk(
  "assistants/getAssistantById",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/assistants/get?subaccountId=${subaccountId}&assistantId=${assistantId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assistant"
      );
    }
  }
);

// ✅ Create assistant
export const createAssistant = createAsyncThunk(
  "assistants/create",
  async ({ name, description, subaccountId }, { rejectWithValue }) => {
    try {
      const payload = { name, description, subaccountId };
      const response = await apiClient.post("/assistants/create", payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Update assistant - FIXED VERSION
export const updateAssistant = createAsyncThunk(
  "assistants/update",
  async ({ subaccountId, assistantId, updateData }, { rejectWithValue }) => {
    try {
      // Validate required fields
      if (!subaccountId || !assistantId) {
        return rejectWithValue("Missing required fields: subaccountId or assistantId");
      }

      // Prepare payload
      const payload = { 
        subaccountId, 
        assistantId, 
        updateData 
      };

      console.log("🔄 Updating assistant:", payload);

      // ✅ FIXED: Use apiClient instead of raw axios
      const response = await apiClient.put("/assistants/update", payload);

      // Check response status
      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Update failed");
      }

      console.log("✅ Assistant updated successfully:", response.data.data);

      // Return the updated assistant data
      return response.data.data;
    } catch (error) {
      console.error("❌ Update assistant error:", error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error
        return rejectWithValue(
          error.response.data?.message || 
          error.response.data?.error || 
          "Failed to update assistant"
        );
      } else if (error.request) {
        // Request was made but no response
        return rejectWithValue("No response from server");
      } else {
        // Something else happened
        return rejectWithValue(error.message || "Failed to update assistant");
      }
    }
  }
);

// ✅ Delete assistant
export const deleteAssistant = createAsyncThunk(
  "assistants/delete",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(
        `/assistants/delete?subaccountId=${subaccountId}&assistantId=${assistantId}`
      );
      
      if (!response.data.status) {
        return rejectWithValue(response.data.message || "Delete failed");
      }
      
      return assistantId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete assistant"
      );
    }
  }
);

const assistantsSlice = createSlice({
  name: "assistants",
  initialState: {
    data: [],
    selectedAssistant: null,
    loading: false,
    error: null,
    updating: false, // Track update status separately
    updateError: null,
  },
  reducers: {
    clearSelectedAssistant: (state) => {
      state.selectedAssistant = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    // Optimistic update for better UX
    optimisticUpdate: (state, action) => {
      const { assistantId, updateData } = action.payload;
      
      // Update in list
      const index = state.data.findIndex(
        (a) => a.id === assistantId || a.assistantId === assistantId
      );
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updateData };
      }
      
      // Update selected assistant
      if (state.selectedAssistant?.assistantId === assistantId || 
          state.selectedAssistant?.id === assistantId) {
        state.selectedAssistant = { ...state.selectedAssistant, ...updateData };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Fetch
      .addCase(fetchAssistants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssistants.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
      })
      .addCase(fetchAssistants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Create
      .addCase(createAssistant.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAssistant.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(createAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Get single
      .addCase(getAssistantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssistantById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAssistant = action.payload;
      })
      .addCase(getAssistantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Update
      .addCase(updateAssistant.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateAssistant.fulfilled, (state, action) => {
        state.updating = false;

        // ✅ Update the assistant inside the list
        const index = state.data.findIndex(
          (a) =>
            a.id === action.payload.id ||
            a.assistantId === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
        }

        // ✅ Update the selected assistant too
        if (
          state.selectedAssistant?.assistantId === action.payload.id ||
          state.selectedAssistant?.id === action.payload.id
        ) {
          state.selectedAssistant = {
            ...state.selectedAssistant,
            ...action.payload,
          };
        }
      })
      .addCase(updateAssistant.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      })

      // 🔹 Delete
      .addCase(deleteAssistant.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAssistant.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(
          (a) => a.id !== action.payload && a.assistantId !== action.payload
        );
        if (state.selectedAssistant?.id === action.payload || 
            state.selectedAssistant?.assistantId === action.payload) {
          state.selectedAssistant = null;
        }
      })
      .addCase(deleteAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedAssistant, clearUpdateError, optimisticUpdate } = assistantsSlice.actions;
export default assistantsSlice.reducer;