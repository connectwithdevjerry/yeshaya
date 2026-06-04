import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

export const fetchPools = createAsyncThunk(
  "pools/fetch",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/pools?subaccountId=${subaccountId}`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load pools");
    }
  }
);

export const createPool = createAsyncThunk(
  "pools/create",
  async ({ subaccountId, name }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/pools", { subaccountId, name });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create pool");
    }
  }
);

export const renamePool = createAsyncThunk(
  "pools/rename",
  async ({ subaccountId, poolId, name }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/pools/${poolId}`, { subaccountId, name });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return { poolId, name: res.data.data.name };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to rename pool");
    }
  }
);

export const deletePool = createAsyncThunk(
  "pools/delete",
  async ({ subaccountId, poolId }, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/pools/${poolId}?subaccountId=${subaccountId}`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return poolId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete pool");
    }
  }
);

export const setPoolNumbers = createAsyncThunk(
  "pools/setNumbers",
  async ({ subaccountId, poolId, numberSids }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/pools/${poolId}/numbers`, { subaccountId, numberSids });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return { poolId, numberSids: res.data.data.numberSids };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update pool numbers");
    }
  }
);

const poolSlice = createSlice({
  name: "pools",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPools.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPools.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchPools.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    builder.addCase(createPool.fulfilled, (state, action) => {
      state.items.unshift({ ...action.payload, numberCount: 0 });
    });
    builder.addCase(renamePool.fulfilled, (state, action) => {
      const p = state.items.find((x) => x.poolId === action.payload.poolId);
      if (p) p.name = action.payload.name;
    });
    builder.addCase(deletePool.fulfilled, (state, action) => {
      state.items = state.items.filter((p) => p.poolId !== action.payload);
    });
    builder.addCase(setPoolNumbers.fulfilled, (state, action) => {
      const p = state.items.find((x) => x.poolId === action.payload.poolId);
      if (p) { p.numberSids = action.payload.numberSids; p.numberCount = action.payload.numberSids.length; }
    });
  },
});

export default poolSlice.reducer;
