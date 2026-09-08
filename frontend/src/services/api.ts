export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5242/api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token
          ? `Bearer ${token}`
          : "",
        ...options.headers,
      },
    }
  );

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/login";

    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message ?? body?.title ?? `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
