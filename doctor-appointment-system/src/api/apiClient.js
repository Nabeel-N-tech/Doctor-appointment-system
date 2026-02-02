const isDev = import.meta.env.DEV;
let BASE_URL = "";

if (isDev) {
  // In development, use relative path to trigger Vite proxy
  BASE_URL = "/api/accounts";
} else {
  // In production, use the environment variable or fallback to the live server
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    BASE_URL = `${envUrl}/api/accounts`;
  } else {
    // Hardcoded fallback for production to ensure it never hits Vercel relative path
    BASE_URL = "https://doctor-appointment-system-yzsw.onrender.com/api/accounts";
  }
}

console.log("Environment:", isDev ? "Development" : "Production");
console.log("API BASE URL:", BASE_URL);

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("access");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, { ...options, headers });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    throw new Error("Unauthorized");
  }

  // Handle potential empty responses (e.g. 204 No Content)
  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  }

  if (!res.ok) {
    const error = new Error(data?.error || data?.detail || "Request failed");
    error.response = { data, status: res.status };
    throw error;
  }

  return { data, status: res.status };
}

const apiClient = {
  get: (url, options) => apiFetch(url, { ...options, method: "GET" }),
  post: (url, body, options) => apiFetch(url, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (url, body, options) => apiFetch(url, { ...options, method: "PUT", body: JSON.stringify(body) }),
  patch: (url, body, options) => apiFetch(url, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: (url, options) => apiFetch(url, { ...options, method: "DELETE" }),
};

export default apiClient;
