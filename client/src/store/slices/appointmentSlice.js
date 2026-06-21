import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/config";

export const fetchAppointments = createAsyncThunk(
  "appointments/fetch",
  async (subaccountId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/appointments?subaccountId=${subaccountId}`);
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data; // { appointments, metrics, reconnectRequired? }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load appointments");
    }
  }
);

export const fetchCalendarSlots = createAsyncThunk(
  "appointments/slots",
  async ({ subaccountId, calendarId, date }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/appointments/slots?subaccountId=${subaccountId}&calendarId=${calendarId}&date=${date}`);
      if (res.data?.reconnectRequired) return rejectWithValue("Reconnect GoHighLevel to load availability.");
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return { slots: res.data.slots || [], unavailable: !!res.data.unavailable, message: res.data.message || "" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load slots");
    }
  }
);

export const bookManualAppointment = createAsyncThunk(
  "appointments/book",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/appointments/book", payload);
      if (res.data?.reconnectRequired) return rejectWithValue("Reconnect GoHighLevel to book.");
      if (res.data?.status === false) return rejectWithValue(res.data.message);
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to book appointment");
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointments",
  initialState: {
    appointments: [],
    metrics: null,
    reconnectRequired: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments || [];
        state.metrics = action.payload.metrics || null;
        state.reconnectRequired = !!action.payload.reconnectRequired;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default appointmentSlice.reducer;
