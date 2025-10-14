import React from "react";
import {
  Modal,
  Box,
  Typography,
  Grid,
  IconButton,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppIcon from "@mui/icons-material/GetApp";
import { downloadDocument } from "../../features/api";
import { useSelector } from "react-redux";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const TaskDetailModal = ({ open, onClose, task }) => {
  const token = useSelector((state) => state.auth.token);

  if (!task) return null;

  // Handler to download the file
  const handleDownload = async (doc) => {
    try {
      // The downloadDocument API call is configured to return a blob (file data)
      const response = await downloadDocument(task._id, doc.stored_name);

      // Create a temporary URL and link to trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.original_name); // Use original name for download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("Failed to download document. Check console for details.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h4" gutterBottom>
          {task.title}
        </Typography>
        <IconButton
          sx={{ position: "absolute", right: 8, top: 8 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip label={task.status} color="primary" />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Priority
            </Typography>
            <Chip
              label={task.priority}
              color={task.priority === "High" ? "error" : "default"}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Due Date
            </Typography>
            <Typography>{task.due_date}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Assigned To
            </Typography>
            {/* Display user email/name here if we fetch it, otherwise display ID */}
            <Typography>{task.assigned_to}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography>{task.description}</Typography>
          </Grid>
        </Grid>

        {/* Document Viewing Section  */}
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Attached Documents
        </Typography>
        {task.attached_documents.length === 0 ? (
          <Typography color="text.secondary">No documents attached.</Typography>
        ) : (
          <Grid container spacing={1}>
            {task.attached_documents.map((doc, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MuiLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownload(doc);
                    }}
                  >
                    {doc.original_name}
                  </MuiLink>
                  <IconButton onClick={() => handleDownload(doc)} size="small">
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                  <Chip label="PDF" size="small" variant="outlined" />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Modal>
  );
};

export default TaskDetailModal;
