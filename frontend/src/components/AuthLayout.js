import React from "react";
import { Container, Box, Typography, Paper } from "@mui/material";

const AuthLayout = ({ title, children }) => {
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* You could add a logo or icon here */}
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            {title}
          </Typography>
          <Box sx={{ width: "100%" }}>{children}</Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthLayout;
