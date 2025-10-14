import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useDispatch } from "react-redux";
import { removeTask } from "../../features/tasks/tasksSlice";
import TaskFormModal from "./TaskFormModal"; // Component for Edit/Create
import TaskDetailModal from "./TaskDetailModal"; // Component for View

const TaskListTable = ({ tasks, isLoading }) => {
  const dispatch = useDispatch();
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleDelete = (taskId) => {
    if (
      window.confirm("Are you sure you want to delete this task and its files?")
    ) {
      dispatch(removeTask(taskId));
    }
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setOpenEdit(true);
  };

  const handleOpenView = (task) => {
    setSelectedTask(task);
    setOpenView(true);
  };

  if (isLoading) {
    // Already handled in TasksPage, but good to have a fallback
    return <Typography sx={{ p: 2 }}>Loading tasks...</Typography>;
  }

  if (tasks.length === 0 && !isLoading) {
    return (
      <Typography sx={{ p: 2 }}>
        No tasks found matching current filters.
      </Typography>
    );
  }

  const getPriorityColor = (priority) => {
    if (priority === "High") return "error";
    if (priority === "Medium") return "warning";
    return "default";
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Files</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id} hover>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{task.due_date}</TableCell>
                <TableCell>
                  <Chip label={task.attached_documents.length} size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenView(task)}
                    size="small"
                    color="primary"
                  >
                    <VisibilityIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenEdit(task)}
                    size="small"
                    color="secondary"
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(task._id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals for Edit and View */}
      {openEdit && (
        <TaskFormModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          task={selectedTask}
        />
      )}
      {openView && (
        <TaskDetailModal
          open={openView}
          onClose={() => setOpenView(false)}
          task={selectedTask}
        />
      )}
    </>
  );
};

export default TaskListTable;
