import { hasRole } from "./auth";
import { ROLES } from "./roles";

export type Permission =
  | "USER_MANAGE"
  | "PORTAL_WRITE"
  | "PRODUCT_MANAGE"
  | "DEPLOYMENT_MANAGE";

const permissions = {
  USER_MANAGE: [ROLES.ADMIN],
  PORTAL_WRITE: [ROLES.ADMIN, ROLES.MANAGEMENT],
  PRODUCT_MANAGE: [
    ROLES.ADMIN,
    ROLES.MANAGEMENT,
    ROLES.PRODUCT_OWNER,
    ROLES.DEVELOPER,
  ],
  DEPLOYMENT_MANAGE: [
    ROLES.ADMIN,
    ROLES.MANAGEMENT,
    ROLES.PRODUCT_OWNER,
    ROLES.DEVELOPER,
    ROLES.IMPLEMENTATION,
  ],
} as const;

export function hasPermission(permission: Permission): boolean {
  return hasRole(...permissions[permission]);
}

export const canManageUsers = () => hasPermission("USER_MANAGE");
export const canWritePortalData = () => hasPermission("PORTAL_WRITE");
export const canManageProducts = () => hasPermission("PRODUCT_MANAGE");
export const canManageDeployments = () =>
  hasPermission("DEPLOYMENT_MANAGE");
