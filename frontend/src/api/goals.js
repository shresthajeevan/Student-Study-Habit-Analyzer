// Frontend API for Study Goals
const BASE_URL = "/api/goals";

// GET all goals
export async function getAllGoals() {
  const res = await fetch(BASE_URL, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch goals");
  }

  return res.json();
}

// POST create new goal
export async function createGoal(goalData) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(goalData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create goal");
  }

  return res.json();
}

// PUT update goal
export async function updateGoal(id, goalData) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(goalData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update goal");
  }

  return res.json();
}

// DELETE goal
export async function deleteGoal(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete goal");
  }

  return res.json();
}