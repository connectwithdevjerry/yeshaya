import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseUrl = import.meta.env.VITE_API_BASE_URL;

// 🔹 Async thunk to connect GoHighLevel
export const connectGoHighLevel = createAsyncThunk(
  "integrations/connectGoHighLevel",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

      const response = await axios.get(`${BaseUrl}/auth/ghl/authorize`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("GoHighLevel connect response:", response.data);

      if (response.data?.authUrl) {
        window.location.href = response.data.auth_url;
        return { status: "redirecting" };
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const integrationSlice = createSlice({
  name: "integrations",
  initialState: {
    goHighLevel: { connected: false, loading: false, error: null },
    openAI: { connected: false, loading: false, error: null },
    stripe: { connected: false, loading: false, error: null },
  },
  reducers: {
    setIntegrationStatus: (state, action) => {
      const { name, connected } = action.payload;
      if (state[name]) state[name].connected = connected;
    },
  },
  extraReducers: (builder) => {
    builder
      // GoHighLevel connect
      .addCase(connectGoHighLevel.pending, (state) => {
        state.goHighLevel.loading = true;
        state.goHighLevel.error = null;
      })
      .addCase(connectGoHighLevel.fulfilled, (state, action) => {
        state.goHighLevel.loading = false;
        state.goHighLevel.connected =
          action.payload?.status === "connected" ||
          action.payload?.status === "redirecting";
      })
      .addCase(connectGoHighLevel.rejected, (state, action) => {
        state.goHighLevel.loading = false;
        state.goHighLevel.error = action.payload || "Connection failed";
      });
  },
});

export const { setIntegrationStatus } = integrationSlice.actions;
export default integrationSlice.reducer;
