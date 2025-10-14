import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api";

// Helper function to set the default Authorization header on the API instance
const setAuthToken = (token) => {
  if (token) {
    // Sets the default header for ALL subsequent Axios calls
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// Initial state checks local storage for persistent login
const tokenFromStorage = localStorage.getItem("token");
// Initial state checks local storage for persistent login
const initialState = {
  user: localStorage.getItem("user_id") || null,
  role: localStorage.getItem("role") || null,
  token: tokenFromStorage || null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// CRITICAL: If a token exists on app load, set the header immediately
if (tokenFromStorage) {
  setAuthToken(tokenFromStorage);
}

// Async Thunks for API Calls
// --- 1. Login ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post("/auth/login", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.msg || "Login failed");
    }
  }
);

// --- 2. Register ---
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post("/auth/register", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.msg || "Registration failed");
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // 1. Call the backend to blacklist the token
      await API.logoutUser();

      // 2. Dispatch the synchronous action to clear local state/storage
      dispatch(logout());

      return "Logout successful";
    } catch (error) {
      // If the backend call fails (e.g., token already expired), still log out locally.
      console.warn(
        "Backend logout failed, proceeding with local logout.",
        error
      );
      dispatch(logout());
      return rejectWithValue("Backend logout failed.");
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Synchronous Logout action
    logout: (state) => {
      localStorage.clear();
      state.user = null;
      // CRITICAL: Clear the default header on logout
      setAuthToken(null);
      state.role = null;
      state.token = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
        state.user = action.payload.user_id;
        state.role = action.payload.role;
        // Persist data
        localStorage.setItem("token", action.payload.access_token);
        localStorage.setItem("user_id", action.payload.user_id);
        localStorage.setItem("role", action.payload.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Handle Registration (similar logic to login)
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
        // In Flask backend, register returns access_token, which we'll use to log in automatically
        // We'd need to adjust register payload to include user_id and role for proper persistence here
        // For now, assume a successful login flow after registration.
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
