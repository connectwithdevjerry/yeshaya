// src/store/slices/integrationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config"; // using interceptor instance

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
  },
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
  },
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
  },
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
  },
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
  },
);

// ✅ Fetch all GoHighLevel Subaccounts
export const fetchSubAccounts = createAsyncThunk(
  "integrations/fetchSubAccounts",
  async ({ userType = "anon" } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/integrations/get-subaccounts?userType=${userType}`,
      );

      // safe extraction: response.data.data.locations is where the array lives
      const locations = response.data?.data?.locations || [];
      // agencyId might live in response.data.data or response.data - be tolerant
      const agencyId =
        response.data?.data?.agencyId || response.data?.agencyId || null;

      console.log(
        "🟢 Fetched Subaccounts (locations length):",
        locations.length,
      );
      return { locations, agencyId };
    } catch (error) {
      console.error(
        "🔴 Failed to fetch subaccounts:",
        error.response?.data || error.message,
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  },
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
        error.response?.data || error.message,
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const importSubAccounts = createAsyncThunk(
  "importSubAccounts/import",
  async (accountIds, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.post(
        "/integrations/import-sub-accounts",
        { accountIds },
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

      // Re-fetch the enriched imported list so the UI updates everywhere,
      // regardless of which screen triggered the import. The server import
      // response doesn't carry the {locations} shape the table needs.
      console.log("✅ Import successful, refreshing imported sub-accounts");
      const refreshed = await dispatch(fetchImportedSubAccounts()).unwrap();
      return { ...response.data, locations: refreshed.locations, agencyId: refreshed.agencyId };
    } catch (error) {
      console.error("Error response:", error.response?.data);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const chargeConnectedAccount = createAsyncThunk(
  "integrations/chargeConnectedAccount",
  async (amount, { rejectWithValue }) => {
    try {
      // Construction of the POST request with 'amount' in the body
      const response = await apiClient.post(
        "/integrations/charge-connected-account",
        { amount },
      );

      if (response.data?.status === false) {
        return rejectWithValue(response.data.message || "Charge failed");
      }

      console.log("💰 Charge successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Charge Error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Error processing charge",
      );
    }
  },
);

// 🔹 GoHighLevel Authorization
export const authorizeGoHighLevel = createAsyncThunk(
  "integrations/authorizeGoHighLevel",
  async (
    {
      accountId,
      accountType = "Company",
      installationType = "directInstallation",
    },
    { rejectWithValue },
  ) => {
    try {
      // Execute GET request with all data in the query string
      const response = await apiClient.get("/integrations/sub/ghl/authorize", {
        params: {
          accountId,
          accountType,
          installationType,
        },
      });

      // Handle the redirect URL if provided
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
  },
);

// Fetch Charging Details
// 🔹 Toggle Favorite
export const toggleSubAccountFavorite = createAsyncThunk(
  "integrations/toggleFavorite",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/integrations/subaccount/${subaccountId}/favorite`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return { id: subaccountId, isFavorite: res.data.isFavorite };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle favorite");
    }
  }
);

// 🔹 Toggle Archive
export const toggleSubAccountArchive = createAsyncThunk(
  "integrations/toggleArchive",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/integrations/subaccount/${subaccountId}/archive`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return { id: subaccountId, isArchived: res.data.isArchived };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle archive");
    }
  }
);

// 🔹 Update Sub-account metadata
export const updateSubAccountMeta = createAsyncThunk(
  "integrations/updateSubAccountMeta",
  async ({ id, customName, notes }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/integrations/subaccount/${id}/meta`, { customName, notes });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return { id, customName, notes };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update sub-account");
    }
  }
);

// 🔹 Fetch live GHL client info for a sub-account
export const fetchSubAccountGhlDetails = createAsyncThunk(
  "integrations/fetchSubAccountGhlDetails",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/assistants/subaccount-ghl-details?subaccountId=${subaccountId}`);
      return res.data; // { status, data?, reconnectRequired? }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch client info");
    }
  }
);

// 🔹 Fetch single sub-account details
export const fetchSubAccountDetails = createAsyncThunk(
  "integrations/fetchSubAccountDetails",
  async (subaccountId, { rejectWithValue }) => {
    try {
      console.log("🔄 fetchSubAccountDetails →", subaccountId);
      const res = await apiClient.get(`/integrations/subaccount/${subaccountId}/details`);
      console.log("✅ fetchSubAccountDetails →", res.data);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      console.error("❌ fetchSubAccountDetails →", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Failed to fetch sub-account details");
    }
  }
);

// 🔹 Disconnect GoHighLevel
export const disconnectGoHighLevel = createAsyncThunk(
  "integrations/disconnectGoHighLevel",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 disconnectGoHighLevel → sending request");
      const response = await apiClient.delete("/integrations/disconnect/ghl");
      console.log("✅ disconnectGoHighLevel → response:", response.data);
      if (response.data?.status === false) return rejectWithValue(response.data.message);
      return true;
    } catch (err) {
      console.error("❌ disconnectGoHighLevel error:", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Failed to disconnect GoHighLevel");
    }
  }
);

// 🔹 Disconnect OpenAI
export const disconnectOpenAI = createAsyncThunk(
  "integrations/disconnectOpenAI",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 disconnectOpenAI → sending request");
      const response = await apiClient.delete("/integrations/disconnect/openai");
      console.log("✅ disconnectOpenAI → response:", response.data);
      if (response.data?.status === false) return rejectWithValue(response.data.message);
      return true;
    } catch (err) {
      console.error("❌ disconnectOpenAI error:", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Failed to disconnect OpenAI");
    }
  }
);

// 🔹 Disconnect Stripe
export const disconnectStripe = createAsyncThunk(
  "integrations/disconnectStripe",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 disconnectStripe → sending request");
      const response = await apiClient.delete("/integrations/disconnect/stripe");
      console.log("✅ disconnectStripe → response:", response.data);
      if (response.data?.status === false) return rejectWithValue(response.data.message);
      return true;
    } catch (err) {
      console.error("❌ disconnectStripe error:", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Failed to disconnect Stripe");
    }
  }
);

// 🔹 Rebilling breakdown (per sub-account billable amounts)
export const fetchRebillingBreakdown = createAsyncThunk(
  "integrations/fetchRebillingBreakdown",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/rebilling/breakdown");
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data; // { prices, data: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch rebilling breakdown");
    }
  }
);

// 🔹 Generate a rebilling invoice for one sub-account
export const generateRebillingInvoice = createAsyncThunk(
  "integrations/generateRebillingInvoice",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/rebilling/invoice", { subaccountId });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to generate invoice");
    }
  }
);

export const deleteSubAccount = createAsyncThunk(
  "integrations/deleteSubAccount",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/integrations/delete-subaccount/${subaccountId}`);
      if (response.data?.status === false) {
        return rejectWithValue(response.data.message || "Failed to delete sub-account");
      }
      return subaccountId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete sub-account");
    }
  }
);

export const getChargingDetails = createAsyncThunk(
  "integrations/getChargingDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/integrations/get-charging-details",
      );
      const data = response.data;

      if (data.status === false) {
        return rejectWithValue(
          data.message || "Failed to fetch charging details",
        );
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error");
    }
  },
);

// Update Charging Details (x-www-form-urlencoded)
export const updateChargingDetails = createAsyncThunk(
  "integrations/updateChargingDetails",
  async ({ status, least, refillAmount }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("status", status);
      params.append("least", least);
      params.append("refillAmount", refillAmount);

      const response = await apiClient.put(
        "/integrations/update-charging-details",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const data = response.data;
      if (data.status === false) {
        return rejectWithValue(data.message || "Update failed");
      }

      return data.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Update failed";
      return rejectWithValue(msg);
    }
  },
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
    isCharging: false,
    chargeError: null,
    lastChargeResult: null,
    chargingDetails: null,
    chargingLoading: false,
    chargingError: null,
    updateLoading: false,
    subAccountDetails: null,
    fetchingSubAccountDetails: false,
    subAccountDetailsError: null,
    rebillingBreakdown: [],
    rebillingPrices: null,
    fetchingRebilling: false,
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
            "✅ Subaccounts already installed, no state update needed",
          );
          return;
        }

        // Update with the freshly re-fetched enriched list (carried by the thunk)
        if (Array.isArray(action.payload?.locations)) {
          state.subAccounts = action.payload.locations;
        }
        state.agencyId = action.payload?.agencyId || state.agencyId;
      })
      .addCase(importSubAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })

      // Delete SubAccount
      .addCase(deleteSubAccount.fulfilled, (state, action) => {
        const deletedId = action.payload;
        if (state.subAccounts) {
          state.subAccounts = state.subAccounts.filter(acc => acc.id !== deletedId);
        }
        // The detail panel is a separate slot from the list, so deleting the
        // sub-account being viewed left its settings on screen.
        if (state.subAccountDetails?.accountId === deletedId) {
          state.subAccountDetails = null;
        }
      })

      // Toggle Favorite
      .addCase(toggleSubAccountFavorite.fulfilled, (state, action) => {
        const { id, isFavorite } = action.payload;
        const sub = (state.subAccounts || []).find(a => a.id === id);
        if (sub) sub.isFavorite = isFavorite;
      })

      // Toggle Archive
      .addCase(toggleSubAccountArchive.fulfilled, (state, action) => {
        const { id, isArchived } = action.payload;
        const sub = (state.subAccounts || []).find(a => a.id === id);
        if (sub) sub.isArchived = isArchived;
      })

      // Update Meta
      .addCase(updateSubAccountMeta.fulfilled, (state, action) => {
        const { id, customName, notes } = action.payload;
        const sub = (state.subAccounts || []).find(a => a.id === id);
        if (sub) {
          if (customName !== undefined) sub.customName = customName;
          if (notes      !== undefined) sub.notes      = notes;
        }
        // Also keep the open details object in sync
        if (state.subAccountDetails && state.subAccountDetails.accountId === id) {
          if (customName !== undefined) state.subAccountDetails.customName = customName;
          if (notes      !== undefined) state.subAccountDetails.notes      = notes;
        }
      })

      // Rebilling breakdown
      .addCase(fetchRebillingBreakdown.pending, (state) => {
        state.fetchingRebilling = true;
      })
      .addCase(fetchRebillingBreakdown.fulfilled, (state, action) => {
        state.fetchingRebilling = false;
        state.rebillingBreakdown = action.payload.data || [];
        state.rebillingPrices = action.payload.prices || null;
      })
      .addCase(fetchRebillingBreakdown.rejected, (state) => {
        state.fetchingRebilling = false;
      })

      // Fetch single sub-account details
      .addCase(fetchSubAccountDetails.pending, (state, action) => {
        state.fetchingSubAccountDetails = true;
        state.subAccountDetailsError = null;
        // One shared slot for whichever sub-account is open, and both the
        // Integration and Sub-account tabs render as soon as it is non-null.
        // Holding the last one while a different location loads shows its
        // CRM connection status, custom name and notes under this one.
        if (state.subAccountDetails && state.subAccountDetails.accountId !== action.meta.arg) {
          state.subAccountDetails = null;
        }
      })
      .addCase(fetchSubAccountDetails.fulfilled, (state, action) => {
        state.fetchingSubAccountDetails = false;
        state.subAccountDetails = action.payload;
      })
      .addCase(fetchSubAccountDetails.rejected, (state, action) => {
        state.fetchingSubAccountDetails = false;
        state.subAccountDetailsError = action.payload;
      })

      // Disconnect GoHighLevel
      .addCase(disconnectGoHighLevel.pending,   (state) => { state.goHighLevel.loading = true; })
      .addCase(disconnectGoHighLevel.fulfilled, (state) => {
        state.goHighLevel = { connected: false, loading: false, error: null, expiryDate: null };
      })
      .addCase(disconnectGoHighLevel.rejected,  (state, action) => {
        state.goHighLevel.loading = false;
        state.goHighLevel.error   = action.payload;
      })

      // Disconnect OpenAI
      .addCase(disconnectOpenAI.pending,   (state) => { state.openAI.loading = true; })
      .addCase(disconnectOpenAI.fulfilled, (state) => {
        state.openAI = { connected: false, loading: false, error: null, message: "" };
      })
      .addCase(disconnectOpenAI.rejected,  (state, action) => {
        state.openAI.loading = false;
        state.openAI.error   = action.payload;
      })

      // Disconnect Stripe
      .addCase(disconnectStripe.pending,   (state) => { state.stripe.loading = true; })
      .addCase(disconnectStripe.fulfilled, (state) => {
        state.stripe = { connected: false, loading: false, error: null, presence: null };
      })
      .addCase(disconnectStripe.rejected,  (state, action) => {
        state.stripe.loading = false;
        state.stripe.error   = action.payload;
      })

      // Authorize GoHighLevel for Subaccount
      .addCase(authorizeGoHighLevel.pending, (state) => {
        state.goHighLevel.loading = true;
        state.goHighLevel.error = null;
      })
      .addCase(authorizeGoHighLevel.fulfilled, (state, action) => {
        state.goHighLevel.loading = false;
        state.goHighLevel.connected =
          action.payload?.status === "connected" ||
          action.payload?.status === "redirecting";
      })
      .addCase(authorizeGoHighLevel.rejected, (state, action) => {
        state.goHighLevel.loading = false;
        state.goHighLevel.error = action.payload || "Connection failed";
      })

      // Charge Connected Account Cases
      .addCase(chargeConnectedAccount.pending, (state) => {
        state.isCharging = true;
        state.chargeError = null;
      })
      .addCase(chargeConnectedAccount.fulfilled, (state, action) => {
        state.isCharging = false;
        state.lastChargeResult = action.payload;
        state.chargeError = null;
      })
      .addCase(chargeConnectedAccount.rejected, (state, action) => {
        state.isCharging = false;
        state.chargeError = action.payload;
      })

      .addCase(getChargingDetails.pending, (state) => {
        state.chargingLoading = true;
        state.chargingError = null;
      })
      .addCase(getChargingDetails.fulfilled, (state, action) => {
        state.chargingLoading = false;
        state.chargingDetails = action.payload;
      })
      .addCase(getChargingDetails.rejected, (state, action) => {
        state.chargingLoading = false;
        state.chargingError = action.payload;
      })

      /* --- UPDATE CHARGING DETAILS --- */
      .addCase(updateChargingDetails.pending, (state) => {
        state.updateLoading = true;
        state.chargingError = null;
      })
      .addCase(updateChargingDetails.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.chargingDetails = action.payload; // Update state with confirmed values
      })
      .addCase(updateChargingDetails.rejected, (state, action) => {
        state.updateLoading = false;
        state.chargingError = action.payload;
      });
  },
});

export const { setIntegrationStatus } = integrationSlice.actions;
export default integrationSlice.reducer;
