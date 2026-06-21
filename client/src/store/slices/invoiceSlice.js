import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchAll",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/invoices/all?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch invoices");
    }
  }
);

export const generateInvoice = createAsyncThunk(
  "invoices/generate",
  async ({ periodStart, periodEnd }, { rejectWithValue }) => {
    try {
      console.log("🔄 generateInvoice →", { periodStart, periodEnd });
      const res = await apiClient.post("/invoices/generate", { periodStart, periodEnd });
      console.log("✅ generateInvoice →", res.data);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to generate invoice");
    }
  }
);

export const downloadInvoice = createAsyncThunk(
  "invoices/download",
  async (id, { rejectWithValue }) => {
    try {
      // Stream the PDF as a blob from our server, then make a local object URL
      const res = await apiClient.get(`/invoices/${id}/download`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to get invoice PDF");
    }
  }
);

export const sendInvoice = createAsyncThunk(
  "invoices/send",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/invoices/${id}/send`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return { id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send invoice");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const invoiceSlice = createSlice({
  name: "invoices",
  initialState: {
    items: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
    loading: false,
    generating: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.invoices;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(generateInvoice.pending, (state) => { state.generating = true; state.error = null; })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.generating = false;
        state.items.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      });

    builder.addCase(sendInvoice.fulfilled, (state, action) => {
      const inv = state.items.find((i) => i._id === action.payload.id);
      if (inv) inv.emailedAt = new Date().toISOString();
    });
  },
});

export default invoiceSlice.reducer;
