import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { status, userData } = useSelector((state) => state.auth);
  const location = useLocation();

  const token =
    localStorage.getItem("deckle_token") ||
    localStorage.getItem("deckle-token") ||
    localStorage.getItem("deckle_refresh_token");

  // If not logged in and no token present, redirect to login
  if (!status && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific role required (e.g. 'writer' or 'admin')
  if (requiredRole && userData?.role !== requiredRole && userData?.role !== "developer" && userData?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
