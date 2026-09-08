export interface AuthUser {
  userId: number | null;
  username: string;
  email: string;
  role: string;
  expiresAt: number | null;
}

interface JwtPayload {
  sub?: string;
  nameid?: string;
  unique_name?: string;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;

  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;

  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;

  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;

  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

function decodeToken(
  token: string
): JwtPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedPayload =
      payload +
      "=".repeat(
        (4 - (payload.length % 4)) % 4
      );

    const decoded = decodeURIComponent(
      atob(paddedPayload)
        .split("")
        .map(
          (character) =>
            "%" +
            (
              "00" +
              character
                .charCodeAt(0)
                .toString(16)
            ).slice(-2)
        )
        .join("")
    );

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getCurrentUser():
  | AuthUser
  | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  const payload = decodeToken(token);

  if (!payload) {
    return null;
  }

  const userIdValue =
    payload.nameid ??
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ??
    payload.sub;

  const username =
    payload.unique_name ??
    payload.name ??
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    ] ??
    "";

  const email =
    payload.email ??
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ] ??
    "";

  const role =
    payload.role ??
    payload[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] ??
    "";

  return {
    userId: userIdValue
      ? Number(userIdValue)
      : null,

    username,
    email,
    role,

    expiresAt:
      payload.exp ?? null,
  };
}

export function isAuthenticated(): boolean {
  const user = getCurrentUser();

  if (!user) {
    return false;
  }

  if (!user.expiresAt) {
    return true;
  }

  const currentTime =
    Math.floor(Date.now() / 1000);

  return user.expiresAt > currentTime;
}

export function getUserRole():
  | string
  | null {
  return getCurrentUser()?.role || null;
}

export function hasRole(
  ...roles: string[]
): boolean {
  const role = getUserRole();

  if (!role) {
    return false;
  }

  return roles.includes(role);
}

export function logout(): void {
  localStorage.removeItem("token");
}