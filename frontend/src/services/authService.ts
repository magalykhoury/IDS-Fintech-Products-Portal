export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: number;
  username: string;
  email: string;
  role: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid username or password.");
    }

    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message ?? "The sign-in service is currently unavailable."
    );
  }

  return await response.json();
}
import { API_BASE_URL } from "./api";
