import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import UserManagementPage from "./pages/UserManagementPage";
import ProtectedRoute from "./components/ProtectedRoute"; // Component we'll create next

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />

//         {/* Protected Routes */}
//         <Route element={<ProtectedRoute />}>
//           <Route path="/" element={<DashboardPage />} />
//           <Route path="/tasks" element={<TasksPage />} />
//           <Route path="/tasks/:id" element={<TasksPage />} />
//           {/* Admin-Only Route */}
//           <Route
//             path="/users"
//             element={
//               <ProtectedRoute adminOnly={true}>
//                 <UserManagementPage />
//               </ProtectedRoute>
//             }
//           />
//         </Route>

//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* STANDARD PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN-ONLY ROUTE: Pass the flag to ProtectedRoute */}
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
