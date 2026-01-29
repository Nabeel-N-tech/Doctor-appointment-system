import apiClient from "../api/apiClient";

export async function loginRequest(data) {
  // apiClient handles the base URL (VITE_API_URL) automatically.
  // We just pass the relative path endpoint.
  // apiClient returns { data, status }
  const { data: responseData } = await apiClient.post("/login/", data);
  return responseData;
}

export async function registerRequest(data) {
  const { data: result } = await apiClient.post("/register/", data);
  return result;
}
