// Frontend API for File Uploads
const BASE_URL = "/api/uploadNotes";

// POST upload files
export async function uploadFiles(files) {
  const formData = new FormData();

  // Append multiple files
  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(BASE_URL, {
    method: "POST",
    credentials: "include",
    body: formData, // Don't set Content-Type header - browser sets it automatically with boundary
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to upload files");
  }

  return res.json();
}

// GET all uploaded files
export async function getAllUploads() {
  const res = await fetch(BASE_URL, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch uploads");
  }

  return res.json();
}

// DELETE uploaded file
export async function deleteUpload(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete file");
  }

  return res.json();
}