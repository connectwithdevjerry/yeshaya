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
        return rejectWithValue(response.data.message || "Failed to load purchased numbers");
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
      const response = await apiClient.post('/integrations/buy-number', {
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
  async ({ subaccountId, assistantId, number, phoneSid }, { rejectWithValue }) => {
    try {
      console.log("📤 Sending vapiConnect request with:", {
        subaccount: subaccountId,
        assistant: assistantId,
        numberSid: phoneSid,
        twilioNumber: number
      });

      const response = await apiClient.post('/integrations/import-number-to-vapi', {
        subaccountId: subaccountId,
        assistantId: assistantId,
        phoneSid: phoneSid,
        twilioNumber: number
      });

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
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || "Network error";
      
      return rejectWithValue(errorMessage);
    }
  }
);


const numberSlice = createSlice({
  name: "numbers",
  initialState: {
    data: [],
    purchasedNumbers: [],
    loading: false,
    loadingPurchased: false,
    buyingNumber: false,
    connectingVapi: false,
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
        // Optionally update the number's status in purchasedNumbers
        console.log("✅ Vapi connection successful:", action.payload);
      })
      .addCase(vapiConnect.rejected, (state, action) => {
        state.connectingVapi = false;
        state.vapiError = action.payload;
      });
  },
});

export const { clearNumbers, clearPurchasedNumbers, clearBuyError, clearVapiError } = numberSlice.actions;
export default numberSlice.reducer;