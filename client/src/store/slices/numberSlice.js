import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

// 🚀 Async thunk to fetch available numbers
export const fetchAvailableNumbers = createAsyncThunk(
  "numbers/fetchAvailableNumbers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        "/integrations/get-available-phone-numbers"
      );
      if (response.data.status) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to load numbers"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

// 🚀 Async thunk to fetch purchased numbers
export const fetchPurchasedNumbers = createAsyncThunk(
  "numbers/fetchPurchasedNumbers",
  async ({ subaccountId, assistantId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/integrations/purchased-numbers?subaccountId=${subaccountId}&assistantId=${assistantId}`
      );

      console.log("✅ Purchased Numbers Response:", response.data);

      if (response.data.status) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to load purchased numbers"
        );
      }
    } catch (error) {
      console.error("❌ Fetch Purchased Numbers Error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

// 🚀 Async thunk to buy a number
export const buyNumber = createAsyncThunk(
  "numbers/buyNumber",
  async ({ subaccountId, assistantId, number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/integrations/buy-number", {
        subaccount: subaccountId,
        assistant: assistantId,
        numberToBuy: number,
      });

      console.log("✅ Buy Number Response:", response.data);

      if (response.data.status) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || "Failed to buy number");
      }
    } catch (error) {
      console.error("❌ Buy Number Error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

// 🚀 Async thunk to connect to Vapi
export const vapiConnect = createAsyncThunk(
  "numbers/vapiConnect",
  async (
    { subaccountId, assistantId, number, phoneSid },
    { rejectWithValue }
  ) => {
    try {
      console.log("📤 Sending vapiConnect request with:", {
        subaccount: subaccountId,
        assistant: assistantId,
        numberSid: phoneSid,
        twilioNumber: number,
      });

      const response = await apiClient.post(
        "/integrations/import-number-to-vapi",
        {
          subaccountId: subaccountId,
          assistantId: assistantId,
          phoneSid: phoneSid,
          twilioNumber: number,
        }
      );

      console.log("✅ vapiConnection full response:", response);
      console.log("✅ vapiConnection response.data:", response.data);

      if (response.data && response.data.status) {
        return {
          ...(response.data.data || response.data),
          phoneSid, // Include phoneSid for state update
        };
      } else {
        const errorMsg = response.data?.message || "Failed to Connect to vapi";
        console.error("❌ API returned error:", errorMsg);
        return rejectWithValue(errorMsg);
      }
    } catch (error) {
      console.error("❌ vapi Connection error:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error data:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network error";

      return rejectWithValue(errorMessage);
    }
  }
);

// 🚀 NEW: Async thunk to check Vapi connection status
export const getVapiConnectionStatus = createAsyncThunk(
  "numbers/getVapiConnectionStatus",
  async (
    { phoneNum, subaccountId, assistantId, phoneSid, number },
    { rejectWithValue }
  ) => {
    try {
      console.log("📤 Checking Vapi status for:", {
        phoneNum,
        subaccountId,
        assistantId,
        phoneSid,
        twilioNumber: number,
      });

      // ✅ GET request with query parameters
      const response = await apiClient.get(
        `/integrations/vapi-number-import-status`,
        {
          params: {
            phoneNum: number, // Use the Twilio phone number
            subaccountId: subaccountId,
            assistantId: assistantId,
            phoneSid: phoneSid,
            twilioNumber: number,
          },
        }
      );

      console.log("📡 Vapi Status Response:", response.data);
      console.log("📡 Outer status (isConnected):", response.data?.status);
      console.log(
        "📡 Inner data.status (Vapi number status):",
        response.data?.data?.status
      );

      // ✅ Use the OUTER status to determine if connected to Vapi
      // status: true = number IS connected to Vapi
      // status: false = number is NOT connected to Vapi
      if (response.data?.status === true) {
        console.log("✅ Number IS connected to Vapi");
        // Number IS connected to Vapi
        return {
          phoneSid,
          vapiStatus: {
            ...response.data.data,
            isConnected: true, // Flag based on outer status
          },
        };
      } else {
        // Number is NOT connected to Vapi
        console.log("❌ Number is NOT connected to Vapi (outer status: false)");
        return {
          phoneSid,
          vapiStatus: null,
        };
      }
    } catch (error) {
      console.error("❌ Vapi Status Error:", error);

      // Don't reject on 404 or "not found" errors - just return null status
      if (
        error.response?.status === 404 ||
        error.response?.data?.message?.includes("not found")
      ) {
        console.log("ℹ️ Number not connected to Vapi (404 - not found)");
        return {
          phoneSid,
          vapiStatus: null,
        };
      }

      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

// 🔹 Async thunk: delete number from VAPI (disconnect)
export const deleteNumberFromVapi = createAsyncThunk(
  "numbers/deleteNumberFromVapi",
  async ({ phoneNum, phoneSid }, { rejectWithValue }) => {
    try {
      console.log("📤 Sending deleteNumberFromVapi request with:", {
        phoneNum,
        phoneSid,
      });
      const response = await apiClient.delete(
        `/assistants/delete-number-from-vapi`,
        {
          params: { phoneNum },
        }
      );
      console.log("✅ Delete Number Response:", response.data);
      return {
        ...response.data,
        phoneNum,
        phoneSid,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete number");
    }
  }
);

const numberSlice = createSlice({
  name: "numbers",
  initialState: {
    data: [],
    purchasedNumbers: [],
    vapiStatuses: {}, // Store Vapi connection statuses by phoneSid
    loading: false,
    loadingPurchased: false,
    buyingNumber: false,
    connectingVapi: false,
    checkingVapiStatus: false,
    disconnectingVapi: false,
    error: null,
    purchasedError: null,
    buyError: null,
    vapiError: null,
    disconnectError: null,
  },
  reducers: {
    clearNumbers: (state) => {
      state.data = [];
      state.error = null;
    },
    clearPurchasedNumbers: (state) => {
      state.purchasedNumbers = [];
      state.purchasedError = null;
    },
    clearBuyError: (state) => {
      state.buyError = null;
    },
    clearVapiError: (state) => {
      state.vapiError = null;
    },
    clearDisconnectError: (state) => {
      state.disconnectError = null;
    },
    // Store Vapi phone number ID mapping
    setVapiPhoneNumberId: (state, action) => {
      const { phoneSid, vapiPhoneNumId } = action.payload;
      if (!state.vapiStatuses[phoneSid]) {
        state.vapiStatuses[phoneSid] = {};
      }
      state.vapiStatuses[phoneSid].vapiPhoneNumId = vapiPhoneNumId;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Available Numbers
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
      })

      // Fetch Purchased Numbers
      .addCase(fetchPurchasedNumbers.pending, (state) => {
        state.loadingPurchased = true;
        state.purchasedError = null;
      })
      .addCase(fetchPurchasedNumbers.fulfilled, (state, action) => {
        state.loadingPurchased = false;
        state.purchasedNumbers = action.payload;
      })
      .addCase(fetchPurchasedNumbers.rejected, (state, action) => {
        state.loadingPurchased = false;
        state.purchasedError = action.payload;
      })

      // Buy Number
      .addCase(buyNumber.pending, (state) => {
        state.buyingNumber = true;
        state.buyError = null;
      })
      .addCase(buyNumber.fulfilled, (state, action) => {
        state.buyingNumber = false;
        state.purchasedNumbers.push(action.payload);
      })
      .addCase(buyNumber.rejected, (state, action) => {
        state.buyingNumber = false;
        state.buyError = action.payload;
      })

      // Connect to Vapi
      .addCase(vapiConnect.pending, (state) => {
        state.connectingVapi = true;
        state.vapiError = null;
      })
      .addCase(vapiConnect.fulfilled, (state, action) => {
        state.connectingVapi = false;

        const phoneSid = action.payload?.phoneSid;
        const vapiPhoneNumId =
          action.payload?.newPhoneNumberId || action.payload?.id;

        console.log("✅ vapiConnect fulfilled - phoneSid:", phoneSid);
        console.log(
          "✅ vapiConnect fulfilled - vapiPhoneNumId:",
          vapiPhoneNumId
        );

        if (phoneSid && vapiPhoneNumId) {
          if (!state.vapiStatuses[phoneSid]) {
            state.vapiStatuses[phoneSid] = {};
          }
          // Immediately set as active after successful connection
          state.vapiStatuses[phoneSid] = {
            vapiPhoneNumId: vapiPhoneNumId,
            status: "active", // ✅ Set as active immediately
            id: vapiPhoneNumId,
            isConnected: true,
            ...action.payload,
          };
          console.log(
            "✅ Updated vapiStatuses for phoneSid:",
            phoneSid,
            state.vapiStatuses[phoneSid]
          );
        }
      })
      .addCase(vapiConnect.rejected, (state, action) => {
        state.connectingVapi = false;
        state.vapiError = action.payload;
      })

      // Check Vapi Connection Status
      .addCase(getVapiConnectionStatus.pending, (state) => {
        state.checkingVapiStatus = true;
      })
      .addCase(getVapiConnectionStatus.fulfilled, (state, action) => {
        state.checkingVapiStatus = false;
        const { phoneSid, vapiStatus } = action.payload;

        // If vapiStatus is null, number is not connected to Vapi
        if (vapiStatus === null) {
          if (state.vapiStatuses[phoneSid]) {
            delete state.vapiStatuses[phoneSid];
          }
        } else {
          // Normalize and force isConnected boolean
          const normalized = {
            ...vapiStatus,
            vapiPhoneNumId: vapiStatus.id || vapiStatus.vapiPhoneNumId || null,
            isConnected: vapiStatus.isConnected === true, // explicit boolean
            status: vapiStatus.isConnected === true ? "active" : "inactive",
          };

          if (!state.vapiStatuses[phoneSid]) state.vapiStatuses[phoneSid] = {};
          state.vapiStatuses[phoneSid] = {
            ...state.vapiStatuses[phoneSid],
            ...normalized,
            checking: false,
            lastUpdatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(getVapiConnectionStatus.rejected, (state, action) => {
        state.checkingVapiStatus = false;
        console.error("Failed to check Vapi status:", action.payload);
      })

      // Disconnect from Vapi (deleteNumberFromVapi)
      .addCase(deleteNumberFromVapi.pending, (state) => {
        state.disconnectingVapi = true;
        state.disconnectError = null;
      })
      .addCase(deleteNumberFromVapi.fulfilled, (state, action) => {
        state.disconnectingVapi = false;
        const { phoneSid } = action.payload;

        // Reset the Vapi status for this number
        if (phoneSid && state.vapiStatuses[phoneSid]) {
          delete state.vapiStatuses[phoneSid];
        }
      })
      .addCase(deleteNumberFromVapi.rejected, (state, action) => {
        state.disconnectingVapi = false;
        state.disconnectError = action.payload || action.error?.message;
      });
  },
});

export const {
  clearNumbers,
  clearPurchasedNumbers,
  clearBuyError,
  clearVapiError,
  clearDisconnectError,
  setVapiPhoneNumberId,
} = numberSlice.actions;

export default numberSlice.reducer;
