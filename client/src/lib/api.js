import { API_BASE_URL } from "./options";

export class ApiError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function submitApplication(formData) {
  const response = await fetch(`${API_BASE_URL}/apply`, {
    method: "POST",
    body: formData
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(payload?.message || "Unable to submit the application.", payload?.errors || []);
  }

  return payload;
}
