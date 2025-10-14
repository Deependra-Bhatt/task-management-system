import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import tasksReducer from "../features/tasks/tasksSlice";
import usersReducer from "../features/users/usersSlice"; // Import users reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    users: usersReducer, // Add the users reducer
  },
});
