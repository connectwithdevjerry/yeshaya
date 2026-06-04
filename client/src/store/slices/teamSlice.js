import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";
import axios from "axios";
import { API_BASE_URL } from "../api/config";

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchTeam = createAsyncThunk(
  "team/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/team/members");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load team");
    }
  }
);

export const inviteMember = createAsyncThunk(
  "team/invite",
  async ({ email, role }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/team/invite", { email, role });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send invite");
    }
  }
);

export const changeMemberRole = createAsyncThunk(
  "team/changeRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/team/members/${id}/role`, { role });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return { id, role };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to change role");
    }
  }
);

export const removeMember = createAsyncThunk(
  "team/remove",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/team/members/${id}`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove member");
    }
  }
);

export const cancelInvite = createAsyncThunk(
  "team/cancelInvite",
  async (inviteId, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/team/invites/${inviteId}`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return inviteId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to cancel invite");
    }
  }
);

// Public — no auth needed
export const acceptInvite = createAsyncThunk(
  "team/acceptInvite",
  async ({ token, firstName, lastName, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/team/accept-invite`, {
        token, firstName, lastName, password,
      });
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to accept invite");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const teamSlice = createSlice({
  name: "team",
  initialState: {
    members: [],
    pendingInvites: [],
    loading: false,
    inviting: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.members || [];
        state.pendingInvites = action.payload.pendingInvites || [];
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(inviteMember.pending, (state) => { state.inviting = true; })
      .addCase(inviteMember.fulfilled, (state) => { state.inviting = false; })
      .addCase(inviteMember.rejected, (state) => { state.inviting = false; });

    builder.addCase(changeMemberRole.fulfilled, (state, action) => {
      const m = state.members.find((x) => x._id === action.payload.id);
      if (m) m.role = action.payload.role;
    });

    builder.addCase(removeMember.fulfilled, (state, action) => {
      state.members = state.members.filter((m) => m._id !== action.payload);
    });

    builder.addCase(cancelInvite.fulfilled, (state, action) => {
      state.pendingInvites = state.pendingInvites.filter((i) => i._id !== action.payload);
    });
  },
});

export default teamSlice.reducer;
