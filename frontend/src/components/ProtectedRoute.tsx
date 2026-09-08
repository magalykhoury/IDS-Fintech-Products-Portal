import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  isAuthenticated,
  logout,
} from "../services/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    logout();

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}