import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const storedAuth = localStorage.getItem("auth");
const initialUser = storedAuth ? JSON.parse(storedAuth) : null;

export const loginUser = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Session expired");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("auth");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        localStorage.setItem("auth", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        localStorage.setItem("auth", JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        // Refresh stored profile fields without touching the token
        const merged = { ...state.user, ...action.payload };
        state.user = merged;
        localStorage.setItem("auth", JSON.stringify(merged));
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        localStorage.removeItem("auth");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
