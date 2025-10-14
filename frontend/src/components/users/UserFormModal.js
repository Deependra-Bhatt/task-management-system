import React, { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { updatePassword, updateUser } from "../../features/users/usersSlice"; // Assuming updateUser and updatePassword exist

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const UserFormModal = ({ open, onClose, user, onUpdate }) => {
  // state to manage the form inputs
  const [formData, setFormData] = useState({
    role: user?.role || "user",
    newPassword: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isPasswordSection, setIsPasswordSection] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    // 1. Password Validation (only if password section is active)
    if (isPasswordSection) {
      if (formData.newPassword.length < 6) {
        setFormError("Password must be at least 6 characters long.");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setFormError("New passwords do not match.");
        return;
      }

      // Dispatch Password Update (Assuming a separate thunk/endpoint for security)
      // NOTE: This assumes your backend update route handles the password hash correctly
      dispatch(
        updateUser({
          id: user._id,
          data: { password: formData.newPassword },
        })
      )
        .unwrap()
        .then(() => {
          setFormSuccess("Password updated successfully.");
          // Clear password fields after success
          setFormData({ ...formData, newPassword: "", confirmPassword: "" });
        })
        .catch((err) => {
          setFormError(err || "Failed to update password.");
        });
      return;
    }

    // 2. Role/Metadata Update
    const dataToUpdate = {};
    if (formData.role !== user.role) {
      dataToUpdate.role = formData.role;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      setFormError("No changes detected.");
      return;
    }

    // Call the parent handler (which dispatches updateUser thunk)
    onUpdate(user._id, dataToUpdate); // Calls handleUpdate in UserManagementPage
    onClose(); // Close modal on metadata update
  };

  // Tab switch logic
  const handleTabSwitch = (isPassword) => {
    setIsPasswordSection(isPassword);
    setFormError("");
    setFormSuccess("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h5" gutterBottom>
          Edit User: {user?.email}
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
        {formSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {formSuccess}
          </Alert>
        )}

        {/* Tab Buttons */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Button
            onClick={() => handleTabSwitch(false)}
            disabled={!isPasswordSection}
          >
            Metadata
          </Button>
          <Button
            onClick={() => handleTabSwitch(true)}
            disabled={isPasswordSection}
          >
            Reset Password
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Email (View Only) */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ""}
              disabled
              sx={{ mb: 1 }}
            />
          </Grid>

          {/* --- METADATA SECTION --- */}
          {!isPasswordSection && (
            <>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Update Role
                </Button>
              </Grid>
            </>
          )}

          {/* --- PASSWORD SECTION --- */}
          {isPasswordSection && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  sx={{ mb: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="error"
                  sx={{ mt: 2 }}
                >
                  Reset Password
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Modal>
  );
};

export default UserFormModal;
