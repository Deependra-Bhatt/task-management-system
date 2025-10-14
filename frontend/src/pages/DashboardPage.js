import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { Container, Typography } from "@mui/material";

const DashboardPage = () => {
  // Since the core task list is on /tasks, we can redirect or show a welcome message.
  // For simplicity and efficiency, let's make it a redirect to the main task view.

  // NOTE: If you wanted a true dashboard, you'd fetch stats here (e.g., tasks due this week).

  return <Navigate to="/tasks" replace />;

  /* // Alternative: If you want a placeholder page:
    return (
        <>
            <MainHeader />
            <Container maxWidth="md" sx={{ mt: 5 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome to the Task Manager!
                </Typography>
                <Typography variant="body1">
                    Please navigate to the Tasks section to view and manage your assignments.
                </Typography>
            </Container>
        </>
    );
    */
};

export default DashboardPage;
