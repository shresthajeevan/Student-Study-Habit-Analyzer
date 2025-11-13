// Frontend API for Recommendations
const BASE_URL = "http://localhost:3000/api/recommendations";

// GET - Generate AI recommendations
export async function getRecommendations() {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "GET",
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to generate recommendations");
  }
  
  return res.json();
}

// GET - Get available subjects
export async function getAvailableSubjects() {
  const res = await fetch(`${BASE_URL}/subjects`, {
    method: "GET",
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch subjects");
  }
  
  return res.json();
}