import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
  hasPermission,
  type Permission,
} from "../services/permissions";

interface RoleProtectedRouteProps {
  children: ReactNode;
  permission: Permission;
  fallbackPath: string;
}

export default function RoleProtectedRoute({
  children,
  permission,
  fallbackPath,
}: RoleProtectedRouteProps) {
  if (!hasPermission(permission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
