import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../features/auth/authSlice";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [validationError, setValidationError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Consume backend APIs efficiently and handle loading/error states [cite: 27]
  const { status, error, token } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  // Redirect on successful login
  useEffect(() => {
    if (token) {
      navigate("/tasks"); // Navigate to the main tasks page
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error on input change
    if (validationError) setValidationError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setValidationError("Email and password are required.");
      return false;
    }
    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(loginUser(formData));
    }
  };

  return (
    <AuthLayout title="Sign In">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Display Redux error or local validation error */}
          {(error || validationError) && (
            <Grid item xs={12}>
              <Alert severity="error">{error || validationError}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
          startIcon={
            isLoading && <CircularProgress size={20} color="inherit" />
          }
        >
          {isLoading ? "Signing In..." : "Login"}
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link to="/register" style={{ textDecoration: "none" }}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
