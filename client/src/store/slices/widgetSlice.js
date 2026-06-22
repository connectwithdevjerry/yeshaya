// src/store/slices/widgetSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

export const fetchWidgets = createAsyncThunk(
  "widgets/fetchAll",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const qs = subaccountId ? `?subaccountId=${subaccountId}` : "";
      const res = await apiClient.get(`/widgets${qs}`);
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to load widgets");
      return res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error loading widgets");
    }
  },
);

export const createWidget = createAsyncThunk(
  "widgets/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/widgets", payload);
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to create widget");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error creating widget");
    }
  },
);

export const updateWidget = createAsyncThunk(
  "widgets/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/widgets/${id}`, payload);
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to update widget");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error updating widget");
    }
  },
);

export const toggleWidgetMeta = createAsyncThunk(
  "widgets/toggleMeta",
  async ({ id, favorite, archived }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/widgets/${id}/meta`, { favorite, archived });
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  },
);

export const deleteWidget = createAsyncThunk(
  "widgets/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/widgets/${id}`);
      if (!res.data.status) return rejectWithValue(res.data.message || "Failed to delete widget");
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error deleting widget");
    }
  },
);

const upsert = (list, doc) => {
  const i = list.findIndex((w) => w._id === doc._id);
  if (i === -1) return [doc, ...list];
  const next = list.slice();
  next[i] = doc;
  return next;
};

const widgetSlice = createSlice({
  name: "widgets",
  initialState: {
    data: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWidgets.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchWidgets.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchWidgets.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createWidget.pending, (s) => { s.saving = true; })
      .addCase(createWidget.fulfilled, (s, a) => { s.saving = false; s.data = upsert(s.data, a.payload); })
      .addCase(createWidget.rejected, (s, a) => { s.saving = false; s.error = a.payload; })

      .addCase(updateWidget.pending, (s) => { s.saving = true; })
      .addCase(updateWidget.fulfilled, (s, a) => { s.saving = false; s.data = upsert(s.data, a.payload); })
      .addCase(updateWidget.rejected, (s, a) => { s.saving = false; s.error = a.payload; })

      .addCase(toggleWidgetMeta.fulfilled, (s, a) => { s.data = upsert(s.data, a.payload); })

      .addCase(deleteWidget.fulfilled, (s, a) => { s.data = s.data.filter((w) => w._id !== a.payload); });
  },
});

export default widgetSlice.reducer;
