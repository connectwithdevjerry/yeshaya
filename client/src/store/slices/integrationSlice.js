import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseUrl = import.meta.env.VITE_API_BASE_URL;

// 🔹 GoHighLevel
export const connectGoHighLevel = createAsyncThunk(
  "integrations/connectGoHighLevel",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken");
      const response = await axios.get(
        `${BaseUrl}/integrations/ghl/authorize`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
        return { status: "redirecting" };
      }

      console.log("GHL Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 Stripe
export const connectStripe = createAsyncThunk(
  "integrations/connectStripe",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken");
      const response = await axios.get(
        `${BaseUrl}/integrations/stripe/authorize`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.authorizeUrl) {
        window.location.href = response.data.authorizeUrl;
        return { status: "redirecting" };
      }
      console.log("Stripe Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 OpenAI
export const connectOpenAI = createAsyncThunk(
  "integrations/connectOpenAI",
  async (apiKey, { rejectWithValue }) => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        `${BaseUrl}/integrations/connect/openai`,
        { apiKey },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ OpenAI Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ OpenAI Connection Failed:", {
        message: error.message,
        response: error.response?.data,
      });

      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const integrationSlice = createSlice({
  name: "integrations",
  initialState: {
    goHighLevel: { connected: false, loading: false, error: null },
    stripe: { connected: false, loading: false, error: null },
    openAI: { connected: false, loading: false, error: null },
  },
  reducers: {
    setIntegrationStatus: (state, action) => {
      const { name, connected } = action.payload;
      if (state[name]) state[name].connected = connected;
    },
  },
  extraReducers: (builder) => {
    // GoHighLevel
    builder
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

    // Stripe
    builder
      .addCase(connectStripe.pending, (state) => {
        state.stripe.loading = true;
        state.stripe.error = null;
      })
      .addCase(connectStripe.fulfilled, (state, action) => {
        state.stripe.loading = false;
        state.stripe.connected =
          action.payload?.status === "connected" ||
          action.payload?.status === "redirecting";
      })
      .addCase(connectStripe.rejected, (state, action) => {
        state.stripe.loading = false;
        state.stripe.error = action.payload || "Connection failed";
      });

    // OpenAI
    builder
      .addCase(connectOpenAI.pending, (state) => {
        state.openAI.loading = true;
        state.openAI.error = null;
      })
      .addCase(connectOpenAI.fulfilled, (state, action) => {
        state.openAI.loading = false;
        state.openAI.connected = !!action.payload?.status; 
        state.openAI.message = action.payload?.message || "Connected successfully";
        state.openAI.error = null;
      })
      .addCase(connectOpenAI.rejected, (state, action) => {
        state.openAI.loading = false;
        state.openAI.error =
          action.payload?.message || action.payload || "Connection failed";
      });
  },
});

export const { setIntegrationStatus } = integrationSlice.actions;
export default integrationSlice.reducer;
