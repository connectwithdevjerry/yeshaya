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

// ✅ Update assistant
export const updateAssistant = createAsyncThunk(
  "assistants/update",
  async ({ subaccountId, assistantId, updateData }, { rejectWithValue }) => {
    try {
      const payload = { subaccountId, assistantId, updateData };
      const response = await apiClient.put("/assistants/update", payload);

      // Return the updated assistant data
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update assistant"
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
  },
  reducers: {
    clearSelectedAssistant: (state) => {
      state.selectedAssistant = null;
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
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssistant.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ Update the assistant inside the list
        const index = state.data.findIndex(
          (a) =>
            a.id === action.payload.id ||
            a.assistantId === action.payload.assistantId
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
        }

        // ✅ Update the selected assistant too
        if (
          state.selectedAssistant?.assistantId === action.payload.assistantId
        ) {
          state.selectedAssistant = {
            ...state.selectedAssistant,
            ...action.payload,
          };
        }
      })
      .addCase(updateAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedAssistant } = assistantsSlice.actions;
export default assistantsSlice.reducer;
