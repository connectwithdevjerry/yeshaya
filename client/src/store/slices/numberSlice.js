import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";


// 🚀 Async thunk to fetch available numbers
export const fetchAvailableNumbers = createAsyncThunk(
  "numbers/fetchAvailableNumbers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/integrations/get-available-phone-numbers');
      if (response.data.status) {
        return response.data.data; 
      } else {
        return rejectWithValue(response.data.message || "Failed to load numbers");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);


const numberSlice = createSlice({
  name: "numbers",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNumbers: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableNumbers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableNumbers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAvailableNumbers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNumbers } = numberSlice.actions;
export default numberSlice.reducer;
