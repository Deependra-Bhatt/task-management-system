import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useDispatch, useSelector } from "react-redux";
import { addTask, getTasks, updateTask } from "../../features/tasks/tasksSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const TaskFormModal = ({ open, onClose, task = null }) => {
  const isEditing = !!task;
  const dispatch = useDispatch();
  const { status, filters } = useSelector((state) => state.tasks);
  const isLoading = status === "loading";

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "To Do",
    priority: task?.priority || "Low",
    due_date: task?.due_date || "",
    assigned_to: task?.assigned_to || "", // ID of the user assigned
  });
  const [files, setFiles] = useState([]); // New files to upload
  const [formError, setFormError] = useState("");

  // NOTE: For editing, a PUT request handles metadata only. File replacement/deletion
  // should be handled by separate, dedicated endpoints for a cleaner API design.
  // For this assignment, we only implement CREATE with files and PUT for metadata.

  useEffect(() => {
    // Fetch users list (optional but required for 'assigned_to' select field)
    // For now, we'll keep 'assigned_to' as a text field accepting a user ID string.
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      setFormError(`You can only attach a maximum of 3 documents (PDF) total.`);
      return;
    }
    // Simple filter to check if all are PDF (client-side validation)
    const invalidFiles = selectedFiles.filter(
      (file) => file.type !== "application/pdf"
    );
    if (invalidFiles.length > 0) {
      setFormError("Only PDF files are allowed.");
      return;
    }

    setFiles([...files, ...selectedFiles]);
    setFormError("");
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.due_date) {
      setFormError("Title and Due Date are required.");
      return;
    }

    // 1. Create FormData object (required for file uploads)
    const taskData = new FormData();
    Object.keys(formData).forEach((key) => {
      // Append all text fields
      taskData.append(key, formData[key]);
    });

    // 2. Append files under the 'documents' key (matching Flask backend)
    files.forEach((file) => {
      taskData.append("documents", file);
    });

    // Prepare metadata payload for PUT request (exclude files)
    const metadataPayload = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date,
      assigned_to: formData.assigned_to,
    };

    if (isEditing) {
      // Logic for UPDATE: Dispatch updateTask (only for metadata)
      // Assuming you have an updateTask thunk that takes (taskId, data)

      // NOTE: You will need to import the updateTask action from your tasksSlice
      // and ensure the updateTask thunk is defined to handle PUT/JSON requests.

      // FIX: Dispatch the update action
      dispatch(updateTask({ id: task._id, data: metadataPayload }))
        .unwrap()
        .then(() => {
          // After successful update, refresh the task list and close
          dispatch(getTasks(filters));
          onClose();
        })
        .catch((err) => {
          setFormError(err.msg || "Failed to update task.");
        });
    } else {
      // Logic for CREATE: Dispatch addTask
      dispatch(addTask(taskData))
        .unwrap()
        .then(() => {
          // Refresh task list after successful creation
          dispatch(getTasks(filters));
          onClose();
        })
        .catch((err) => {
          setFormError(err || "Failed to create task.");
        });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {isEditing ? "Edit Task" : "Create New Task"}
        </Typography>
        <IconButton
          sx={{ position: "absolute", right: 8, top: 8 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Title and Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          {/* Status, Priority, Due Date */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {["To Do", "In Progress", "Completed"].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                {["Low", "Medium", "High"].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              label="Due Date"
              name="due_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.due_date}
              onChange={handleChange}
            />
          </Grid>

          {/* Assigned To */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Assigned To User ID"
              name="assigned_to"
              placeholder="Leave blank to assign to yourself"
              value={formData.assigned_to}
              onChange={handleChange}
            />
          </Grid>

          {/* File Upload Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Attached Documents (Max 3, PDF Only)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={files.length >= 3 || isEditing}
              sx={{ mr: 1, mb: 1 }}
            >
              Upload File
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
                accept=".pdf"
              />
            </Button>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {files.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => handleRemoveFile(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {/* Display existing files if editing */}
              {isEditing &&
                task.attached_documents.map((doc) => (
                  <Chip
                    key={doc.stored_name}
                    label={doc.original_name}
                    color="default"
                    variant="filled"
                    // NOTE: Deletion of existing files requires a separate endpoint/logic
                  />
                ))}
            </Box>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isEditing
                ? "Save Changes"
                : "Create Task"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default TaskFormModal;
