import axios from "axios";

// The Flask backend is running on port 5000
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  // IMPORTANT: When running with Docker Compose, use the service name 'backend'
  // if calling from service-to-service, but for the React client in a browser,
  // you must use the exposed port and localhost.
});

// Request Interceptor: Inject JWT token into headers for every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Note: The token is stored as "Bearer <token>" in local storage
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Example: If a 401 is received, redirect to login
    if (err.response && err.response.status === 401) {
      console.log(
        "Unauthorized - Token expired or invalid. Redirecting to login."
      );
      // NOTE: In a real app, dispatch a Redux action to clear state and redirect
    }
    return Promise.reject(err);
  }
);

// --- Task API Endpoints ---
export const fetchTasks = (params) => API.get("/tasks", { params }); // params handles FSP
export const createTask = (formData) =>
  API.post("/tasks", formData, {
    // Necessary for file uploads (multipart/form-data)
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const downloadDocument = (taskId, storedName) =>
  API.get(
    `/tasks/${taskId}/documents/${storedName}`,
    { responseType: "blob" } // Crucial for handling file downloads
  );

// --- User API Endpoints (Admin Only) ---
export const fetchUsers = () => API.get("/users");
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const logoutUser = () => API.post("/auth/logout");

export default API;
