import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api";

const initialState = {
  tasks: [],
  pagination: {},
  filters: { status: "", priority: "", sort: "-due_date", page: 1, limit: 10 },
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- Async Thunks ---

// FETCH: Handles Listing Tasks with FSP
export const getTasks = createAsyncThunk(
  "tasks/getTasks",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.fetchTasks(filters);
      return response.data; // Contains { tasks, pagination }
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to fetch tasks."
      );
    }
  }
);

// CREATE: Handles Task Creation (including file upload)
export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.createTask(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to create task."
      );
    }
  }
);

// UPDATE: Handles Task Metadata Update
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Note: api.updateTask should send a PUT request with JSON data
      await api.updateTask(id, data);

      // Return the updated ID and the new data for optimistic state update
      return { id, data };
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to update task."
      );
    }
  }
);

// DELETE: Handles Task Deletion
export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (taskId, { rejectWithValue }) => {
    try {
      await api.deleteTask(taskId);
      return taskId; // Return ID to remove from state
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to delete task."
      );
    }
  }
);

// --- Task Slice ---

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      // Allows updating one or more FSP filters and resetting page to 1 for new filters
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET TASKS
      .addCase(getTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.tasks = [];
      })

      // UPDATE TASK METADATA (Optimistic Update)
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = "idle";
        const { id, data } = action.payload;

        // Find the index of the task to update
        const existingTaskIndex = state.tasks.findIndex(
          (task) => task._id === id
        );

        if (existingTaskIndex !== -1) {
          // Update the existing task with the new metadata
          state.tasks[existingTaskIndex] = {
            ...state.tasks[existingTaskIndex],
            ...data,
          };
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // NOTE: A failed update may require reverting the state if you had a pessimistic update
      })
      // DELETE TASK - Optimistic update (remove from list immediately)
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        // NOTE: A successful delete should ideally trigger a refresh to fix pagination
      })
      // ADD TASK (Optional: add to the list if it matches current filters)
      .addCase(addTask.fulfilled, (state, action) => {
        // If a new task is created, we usually force a refresh of the task list
        // to ensure it shows up in the correct sorted/filtered position.
        state.status = "idle";
      });
  },
});

export const { setFilters, setPage } = tasksSlice.actions;
export default tasksSlice.reducer;
