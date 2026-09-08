export const ROLES = {
  ADMIN: "Admin",
  MANAGEMENT: "Management",
  PRODUCT_OWNER: "ProductOwner",
  DEVELOPER: "Developer",
  QA: "QA",
  IMPLEMENTATION: "Implementation",
  SUPPORT: "Support",
  VIEWER: "Viewer",
} as const;

export type Role =
  (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [
  ROLES.ADMIN,
  ROLES.MANAGEMENT,
  ROLES.PRODUCT_OWNER,
  ROLES.DEVELOPER,
  ROLES.QA,
  ROLES.IMPLEMENTATION,
  ROLES.SUPPORT,
  ROLES.VIEWER,
];