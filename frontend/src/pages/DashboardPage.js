import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import { Container, Typography } from "@mui/material";

const DashboardPage = () => {

  return <Navigate to="/tasks" replace />;
};

export default DashboardPage;
