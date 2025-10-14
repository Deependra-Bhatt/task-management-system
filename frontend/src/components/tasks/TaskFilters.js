import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const statuses = ["To Do", "In Progress", "Completed", ""]; // '' for 'All'
const priorities = ["Low", "Medium", "High", ""];
const sortOptions = [
  { value: "-due_date", label: "Due Date (Descending)" },
  { value: "due_date", label: "Due Date (Ascending)" },
  { value: "-priority", label: "Priority (High to Low)" },
  { value: "status", label: "Status" },
];

const TaskFilters = ({ currentFilters, onFilterChange, onOpenCreate }) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  // Sync internal state with external Redux state changes
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);

    // Apply filter immediately (or debounce in a larger app)
    onFilterChange(newFilters);
  };

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <Grid container spacing={2} alignItems="center">
        {/* Status Filter */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              name="status"
              value={localFilters.status || ""}
              onChange={handleChange}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statuses
                .filter((s) => s)
                .map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Priority Filter */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              name="priority"
              value={localFilters.priority || ""}
              onChange={handleChange}
            >
              <MenuItem value="">All Priorities</MenuItem>
              {priorities
                .filter((p) => p)
                .map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sort By Control */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              label="Sort By"
              name="sort"
              value={localFilters.sort}
              onChange={handleChange}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Create Task Button */}
        <Grid
          item
          xs={12}
          sm={3}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onOpenCreate}
            fullWidth
          >
            Create Task
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskFilters;
