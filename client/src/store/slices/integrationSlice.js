// src/store/slices/integrationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config"; // using interceptor instance
import axios from "axios";

// 🔹 GoHighLevel
export const connectGoHighLevel = createAsyncThunk(
  "integrations/connectGoHighLevel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/integrations/ghl/authorize");

      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
        return { status: "redirecting" };
      }

      console.log("✅ GHL Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ GHL Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 Stripe
export const connectStripe = createAsyncThunk(
  "integrations/connectStripe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/integrations/stripe/authorize");

      if (response.data?.authorizeUrl) {
        window.location.href = response.data.authorizeUrl;
        return { status: "redirecting" };
      }

      console.log("✅ Stripe Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Stripe Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 OpenAI
export const connectOpenAI = createAsyncThunk(
  "integrations/connectOpenAI",
  async (apiKey, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/integrations/connect/openai", {
        apiKey,
      });

      console.log("✅ OpenAI Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ OpenAI Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const testOpenAiKey = createAsyncThunk(
  "/integrations/test/openai-key",
  async (apiKey, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/integrations/test/openai-key");

      console.log("✅ OpenAI Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ OpenAI Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔹 Get Integration Status
export const getIntegrationStatus = createAsyncThunk(
  "integrations/getStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/integrations/status");
      console.log("🟢 Integration Status Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("🔴 Failed to fetch integration status:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Fetch all GoHighLevel Subaccounts
export const fetchSubAccounts = createAsyncThunk(
  "integrations/fetchSubAccounts",
  async ({ userType = "anon" } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/integrations/get-subaccounts?userType=${userType}`
      );

      // safe extraction: response.data.data.locations is where the array lives
      const locations = response.data?.data?.locations || [];
      // agencyId might live in response.data.data or response.data - be tolerant
      const agencyId =
        response.data?.data?.agencyId || response.data?.agencyId || null;

      console.log(
        "🟢 Fetched Subaccounts (locations length):",
        locations.length
      );
      return { locations, agencyId };
    } catch (error) {
      console.error(
        "🔴 Failed to fetch subaccounts:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//Fetch imported subaccounts
export const fetchImportedSubAccounts = createAsyncThunk(
  "integrations/fetchImportedSubAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/integrations/get-subaccounts");

      const locations = response.data?.data || [];
      const agencyId = response.data?.agencyId || null;
      console.log("🟢Subaccounts", response.data);
      return { locations, agencyId };
    } catch (error) {
      console.error(
        "🔴 Failed to fetch subaccounts:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const importSubAccounts = createAsyncThunk(
  "importSubAccounts/import",
  async (accountIds, { rejectWithValue }) => {
    try {

      const response = await apiClient.post(
        "/integrations/import-sub-accounts",
        { accountIds }
      );
      console.log("📥 RESPONSE DATA:", response.data);

      if (
        response.data?.status === false &&
        response.data?.message === "Sub-accounts Already Installed!"
      ) {
        console.log("ℹ️ Subaccounts already installed, adding flag");
        return {
          ...response.data,
          alreadyInstalled: true,
        };
      }

      console.log("✅ Import successful, returning data");
      return response.data;
    } catch (error) {
      console.error("Error response:", error.response?.data);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// 🔹 Slice
const integrationSlice = createSlice({
  name: "integrations",
  initialState: {
    goHighLevel: { connected: false, loading: false, error: null },
    stripe: { connected: false, loading: false, error: null },
    openAI: { connected: false, loading: false, error: null, message: "" },
    testOpenAi: { connected: false, loading: false, error: null, message: "" },
    subAccounts: [],
    agencyId: null,
    loading: false,
    error: null,
    warning: null,
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
        state.openAI.message =
          action.payload?.message || "Connected successfully";
        state.openAI.error = null;
      })
      .addCase(connectOpenAI.rejected, (state, action) => {
        state.openAI.loading = false;
        state.openAI.error =
          action.payload?.message || action.payload || "Connection failed";
      });

    builder
      .addCase(testOpenAiKey.pending, (state) => {
        state.openAI.loading = true;
        state.openAI.error = null;
      })
      .addCase(testOpenAiKey.fulfilled, (state, action) => {
        state.openAI.loading = false;
        state.openAI.connected = !!action.payload?.status;
        state.openAI.message =
          action.payload?.message || "Connected successfully";
        state.openAI.error = null;
      })
      .addCase(testOpenAiKey.rejected, (state, action) => {
        state.openAI.loading = false;
        state.openAI.error =
          action.payload?.message || action.payload || "Connection failed";
      });

    // GET INTEGRATION STATUS
    builder
      .addCase(getIntegrationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIntegrationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { openai, ghl, stripe } = action.payload;

        if (openai) {
          state.openAI.connected = !!openai.status;
          state.openAI.message = openai.message || null;
        }

        if (ghl) {
          state.goHighLevel.connected = !!ghl.status;
          state.goHighLevel.expiryDate = ghl.expiryDate || null;
        }

        if (stripe) {
          state.stripe.connected = !!stripe.status;
          state.stripe.presence = stripe.presence || false;
        }
      })
      .addCase(getIntegrationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch integration status";
      });

    builder
      .addCase(fetchSubAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.subAccounts = action.payload.locations || [];
        state.agencyId = action.payload.agencyId || null;
      })
      .addCase(fetchSubAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });

    // Fetch Imported SubAccounts
    builder
      .addCase(fetchImportedSubAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImportedSubAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.subAccounts = action.payload.locations || [];
        state.agencyId = action.payload.agencyId || null;
      })
      .addCase(fetchImportedSubAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });

    // Import SubAccounts
    builder
      .addCase(importSubAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importSubAccounts.fulfilled, (state, action) => {
        state.loading = false;

        // If already installed, just log and don't update state
        if (action.payload?.alreadyInstalled) {
          console.log(
            "✅ Subaccounts already installed, no state update needed"
          );
          return;
        }

        // Otherwise update state with new data
        state.subAccounts = action.payload?.locations || state.subAccounts;
        state.agencyId = action.payload?.agencyId || state.agencyId;
      })
      .addCase(importSubAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { setIntegrationStatus } = integrationSlice.actions;
export default integrationSlice.reducer;
