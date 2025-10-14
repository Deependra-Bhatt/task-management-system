import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";

const MainHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <AssignmentIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/tasks"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          Task Manager
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Tasks Link (Default for all users) */}
          <Button
            color="inherit"
            component={RouterLink}
            to="/tasks"
            startIcon={<AssignmentIcon />}
          >
            Tasks
          </Button>

          {/* Admin-Only Link */}
          {role === "admin" && (
            <Button
              color="inherit"
              component={RouterLink}
              to="/users"
              startIcon={<GroupIcon />}
            >
              Users
            </Button>
          )}

          {/* Logout Button */}
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            variant="outlined"
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MainHeader;
