import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

export const fetchTemplates = createAsyncThunk(
  "templates/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/templates");
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load templates");
    }
  }
);

export const createTemplate = createAsyncThunk(
  "templates/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/templates", payload);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create template");
    }
  }
);

export const updateTemplate = createAsyncThunk(
  "templates/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/templates/${id}`, payload);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update template");
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  "templates/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/templates/${id}`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete template");
    }
  }
);

export const applyTemplate = createAsyncThunk(
  "templates/apply",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/templates/${id}/apply`, { values });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data.prompt;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to apply template");
    }
  }
);

export const saveFromPrompt = createAsyncThunk(
  "templates/fromPrompt",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/templates/from-prompt", payload);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to save template");
    }
  }
);

export const restoreTemplateVersion = createAsyncThunk(
  "templates/restoreVersion",
  async ({ id, versionId }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/templates/${id}/restore/${versionId}`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to restore version");
    }
  }
);

const upsert = (list, tpl) => {
  const i = list.findIndex((t) => t._id === tpl._id);
  if (i >= 0) list[i] = { ...list[i], ...tpl };
  else list.unshift(tpl);
};

const templateSlice = createSlice({
  name: "templates",
  initialState: { items: [], loading: false, saving: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTemplates.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchTemplates.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

    builder
      .addCase(createTemplate.fulfilled, (s, a) => { upsert(s.items, a.payload); })
      .addCase(updateTemplate.fulfilled, (s, a) => { upsert(s.items, a.payload); })
      .addCase(saveFromPrompt.fulfilled, (s, a) => { upsert(s.items, a.payload); })
      .addCase(restoreTemplateVersion.fulfilled, (s, a) => { upsert(s.items, a.payload); })
      .addCase(deleteTemplate.fulfilled, (s, a) => {
        s.items = s.items.filter((t) => t._id !== a.payload);
      });
  },
});

export default templateSlice.reducer;
