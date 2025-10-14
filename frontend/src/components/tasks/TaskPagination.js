import React from "react";
import { Pagination, Typography, Box } from "@mui/material";

const TaskPagination = ({ count, page, onChange, totalTasks }) => {
  if (count <= 1) return null; // Hide pagination if only one page

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Total Tasks: {totalTasks}
      </Typography>
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        color="primary"
        showFirstButton
        showLastButton
        size="small"
      />
    </Box>
  );
};

export default TaskPagination;
