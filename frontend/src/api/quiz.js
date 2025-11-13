// Frontend API for Quiz
const BASE_URL = "http://localhost:3000/api/quizzes";

// POST - Generate quiz from upload
export async function generateQuiz(uploadId, subject, difficulty = "medium") {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ uploadId, subject, difficulty }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to generate quiz");
  }
  
  return res.json();
}

// GET - Get all quizzes
export async function getAllQuizzes(subject = null) {
  const url = subject ? `${BASE_URL}?subject=${encodeURIComponent(subject)}` : BASE_URL;
  
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch quizzes");
  }
  
  return res.json();
}

// GET - Get quiz by ID (with questions)
export async function getQuizById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch quiz");
  }
  
  return res.json();
}

// POST - Submit quiz answers
export async function submitQuiz(quizId, answers, totalTimeTaken) {
  const res = await fetch(`${BASE_URL}/${quizId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ answers, totalTimeTaken }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to submit quiz");
  }
  
  return res.json();
}

// GET - Get quiz results history
export async function getQuizResults(quizId) {
  const res = await fetch(`${BASE_URL}/${quizId}/results`, {
    method: "GET",
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch results");
  }
  
  return res.json();
}

// DELETE - Delete quiz
export async function deleteQuiz(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete quiz");
  }
  
  return res.json();
}