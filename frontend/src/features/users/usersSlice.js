import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api";

const initialState = {
  users: [],
  status: "idle",
  error: null,
};

// --- Async Thunks ---

export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.fetchUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to fetch users."
      );
    }
  }
);

// NEW THUNK: UPDATE USER
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Assumes api.updateUser sends a PUT request to /api/users/{id}
      await api.updateUser(id, data);

      // Return the ID and the data that was updated for state synchronization
      return { id, data };
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to update user."
      );
    }
  }
);

export const removeUser = createAsyncThunk(
  "users/removeUser",
  async (userId, { rejectWithValue }) => {
    try {
      await api.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to delete user."
      );
    }
  }
);

// --- User Slice ---

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET USERS
      .addCase(getUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
        state.error = null;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.users = [];
      })

      // NEW: UPDATE USER
      .addCase(updateUser.fulfilled, (state, action) => {
        const { id, data } = action.payload;

        // Find the user and update the fields (optimistic update)
        const userIndex = state.users.findIndex((user) => user._id === id);

        if (userIndex !== -1) {
          state.users[userIndex] = {
            ...state.users[userIndex],
            ...data,
            // Ensure password isn't accidentally stored/displayed if updated
            password: state.users[userIndex].password,
          };
        }
        state.status = "succeeded"; // Mark operation as successful
      })

      // DELETE USER
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
