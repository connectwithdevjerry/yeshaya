import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/notifications/all?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/notifications/unread-count");
      return res.data.count;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch count");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.put(`/notifications/read/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.put("/notifications/read-all");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark all as read");
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.delete("/notifications/clear-all");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    pagination: { page: 1, totalPages: 1, total: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    resetNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.pagination = { page: 1, totalPages: 1, total: 0 };
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Unread count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Mark one as read
    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const item = state.items.find((n) => n._id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark all as read
    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    });

    // Delete one
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const idx = state.items.findIndex((n) => n._id === action.payload);
      if (idx !== -1) {
        if (!state.items[idx].read) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.items.splice(idx, 1);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
    });

    // Clear all
    builder.addCase(clearAllNotifications.fulfilled, (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.pagination = { page: 1, totalPages: 1, total: 0 };
    });
  },
});

export const { resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
