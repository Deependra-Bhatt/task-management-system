// frontend/src/components/ProtectedRoute.js (Simplified & Corrected)

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Alert, Container } from "@mui/material";

// Now accepts children (the page component) directly
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, role, status } = useSelector((state) => state.auth);

  if (status === "loading") {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  // 1. Check Authentication (Token)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Authorization (Role)
  if (adminOnly && role !== "admin") {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Alert severity="error">
          Access Denied. You must be an administrator to view this page.
        </Alert>
        {/* Redirect to the default dashboard */}
        <Navigate to="/tasks" replace />
      </Container>
    );
  }

  // Authorized: render the child component
  return children;
};

export default ProtectedRoute;
// import React from "react";
// import { useSelector } from "react-redux";
// import { Navigate, Outlet } from "react-router-dom";
// import { Alert, Container } from "@mui/material";

// // Use Outlet from react-router-dom v6 for nested protected routes
// const ProtectedRoute = ({ adminOnly = false }) => {
//   const { token, role, status } = useSelector((state) => state.auth);

//   if (status === "loading") {
//     return <div>Loading...</div>; // Or a proper spinner component
//   }

//   // 1. Check Authentication (Token)
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // 2. Check Authorization (Role)
//   if (adminOnly && role !== "admin") {
//     return (
//       <Container maxWidth="sm" sx={{ mt: 5 }}>
//         <Alert severity="error">
//           Access Denied. You must be an administrator to view this page.
//         </Alert>
//         <Navigate to="/" replace />
//       </Container>
//     );
//   }

//   // Authorized: render the child routes/component
//   return <Outlet />;
// };

// export default ProtectedRoute;
