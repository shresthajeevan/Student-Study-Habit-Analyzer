// Frontend API for authentication - with credentials for session cookies
const BASE_URL = "http://localhost:3000/api/auth";

export async function signup(data) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important: Send cookies with request
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Signup failed");
  }
  
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important: Send cookies with request
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }
  
  return res.json();
}

export async function logout() {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Logout failed");
  }
  
  return res.json();
}

export async function checkSession() {
  const res = await fetch(`${BASE_URL}/check-session`, {
    method: "GET",
    credentials: "include",
  });
  
  if (!res.ok) {
    throw new Error("Failed to check session");
  }
  
  return res.json();
}