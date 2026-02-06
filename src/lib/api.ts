const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth`;

export async function registerUser(payload: { fullName: string; email: string; password: string; role?: string}) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function loginUser(payload: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch me");
  return res.json(); // returns { user }
}

export async function getSettings(token: string) {
  const res = await fetch(`${API_URL}/get-settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json(); // returns { profile, settings, role }
}

export async function updateSettings(token: string, payload: any) {
  const res = await fetch(`${API_URL}/update-settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return res.json();
}
