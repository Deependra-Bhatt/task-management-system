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
import { registerUser } from "../features/auth/authSlice";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error, token } = useSelector((state) => state.auth);
  const isLoading = status === "loading";

  // Redirect on successful registration (and automatic login)
  useEffect(() => {
    if (token) {
      navigate("/tasks");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError) setValidationError("");
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;
    if (!email || !password || !confirmPassword) {
      setValidationError("All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Only send email and password to the API
      const { email, password } = formData;
      dispatch(registerUser({ email, password }));
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
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
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
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
          {isLoading ? "Registering..." : "Register"}
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link to="/login" style={{ textDecoration: "none" }}>
              {"Already have an account? Sign In"}
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
