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
        return response.data.data || response.data;
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
      console.log(
        "📤 Checking Vapi status for phoneNum:",
        phoneNum,
        subaccountId,
        assistantId,
        phoneSid,
        number
      );
      const response = await apiClient.post(
        `/integrations/vapi-number-import-status?phoneNum=${phoneNum}`,
        {
          subaccountId: subaccountId,
          assistantId: assistantId,
          phoneSid: phoneSid,
          twilioNumber: number,
        }
      );

      console.log("📡 Vapi Status Response:", response.data);

      if (response.data?.status) {
        return {
          phoneSid,
          vapiStatus: response.data.data,
        };
      } else {
        return rejectWithValue(
          response.data.message || "Failed to get Vapi status"
        );
      }
    } catch (error) {
      console.error("❌ Vapi Status Error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Network error"
      );
    }
  }
);

// 🔹 Async thunk: delete number from VAPI
export const deleteNumberFromVapi = createAsyncThunk(
  "assistants/deleteNumberFromVapi",
  async (phoneNum, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/assistants/delete-number-from-vapi`,
        {
          params: { phoneNum },
        }
      );
      console.log("✅ Delete Number Response:", response.data);
      return response.data;
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
    deletingNumber: false, // NEW: flag for deleting
    deleteSuccess: false, // NEW: success flag
    deleteError: null, // NEW: error for delete
    error: null,
    purchasedError: null,
    buyError: null,
    vapiError: null,
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
    // NEW: Store Vapi phone number ID mapping
    setVapiPhoneNumberId: (state, action) => {
      const { phoneSid, vapiPhoneNumId } = action.payload;
      if (!state.vapiStatuses[phoneSid]) {
        state.vapiStatuses[phoneSid] = {};
      }
      state.vapiStatuses[phoneSid].vapiPhoneNumId = vapiPhoneNumId;
    },
    // NEW: reset delete flags
    resetDeleteState: (state) => {
      state.deletingNumber = false;
      state.deleteSuccess = false;
      state.deleteError = null;
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
        // Store the vapiPhoneNumId if returned
        if (
          action.payload?.newPhoneNumberId &&
          action.payload?.incomingPhoneNumber?.sid
        ) {
          const phoneSid = action.payload.incomingPhoneNumber.sid;
          const vapiPhoneNumId = action.payload.newPhoneNumberId;

          if (!state.vapiStatuses[phoneSid]) {
            state.vapiStatuses[phoneSid] = {};
          }
          state.vapiStatuses[phoneSid].vapiPhoneNumId = vapiPhoneNumId;
          state.vapiStatuses[phoneSid].status = "active"; // assume active after success
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
        state.vapiStatuses[phoneSid] = vapiStatus;
      })
      .addCase(getVapiConnectionStatus.rejected, (state, action) => {
        state.checkingVapiStatus = false;
        console.error("Failed to check Vapi status:", action.payload);
      })

      // ---- NEW: deleteNumberFromVapi handlers ----
      .addCase(deleteNumberFromVapi.pending, (state) => {
        state.deletingNumber = true;
        state.deleteSuccess = false;
        state.deleteError = null;
      })
      .addCase(deleteNumberFromVapi.fulfilled, (state, action) => {
        state.deletingNumber = false;
        state.deleteSuccess = true;

        const phoneNum = action.payload?.phoneNum;

        // Remove matching purchasedNumbers (match by phone number string or shape)
        if (phoneNum && state.purchasedNumbers?.length) {
          state.purchasedNumbers = state.purchasedNumbers.filter((pn) => {
            // adapt to your data shape: check common fields
            if (!pn) return false;
            const possibleNumberStrings = [
              pn.phoneNumber, // common field
              pn.number,
              pn.phone,
              pn.incomingPhoneNumber?.phone,
            ].filter(Boolean);
            return !possibleNumberStrings.some((n) => n === phoneNum);
          });
        }

        // Remove any vapiStatuses entries referencing the deleted phoneNum
        // We try to clean by vapiPhoneNumId or incoming phone matching
        Object.keys(state.vapiStatuses || {}).forEach((phoneSid) => {
          const status = state.vapiStatuses[phoneSid];
          const matchesPhone =
            (status?.incomingPhoneNumber?.phone &&
              status.incomingPhoneNumber.phone === phoneNum) ||
            (status?.phone && status.phone === phoneNum);
          if (matchesPhone) {
            delete state.vapiStatuses[phoneSid];
          }
        });
      })
      .addCase(deleteNumberFromVapi.rejected, (state, action) => {
        state.deletingNumber = false;
        state.deleteSuccess = false;
        state.deleteError = action.payload || action.error?.message;
      });
  },
});

export const {
  clearNumbers,
  clearPurchasedNumbers,
  clearBuyError,
  clearVapiError,
  setVapiPhoneNumberId,
  resetDeleteState,
} = numberSlice.actions;

export default numberSlice.reducer;
