import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// 👇 INTERCEPTOR: Runs before every request is sent
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// --- User Service Functions ---
export const registerUser = (userData) => api.post('/users/register', userData);
export const loginUser = (userData) => api.post('/users/login', userData);

// --- Project Service Functions ---
export const getProjects = () => api.get('/projects');
export const createProject = (projectData) => api.post('/projects', projectData);

export const getProjectDetails = (projectId) => api.get(`/projects/${projectId}`);
export const deleteProject = (projectId) => api.delete(`/projects/${projectId}`);

export const getLogs = (projectId) => api.get(`/logs/${projectId}`);

export const downloadMonitorScript = (projectId) => {
  return api.get(`/projects/${projectId}/script`, {
    // We expect the raw text of the script back
    responseType: 'text', 
  });
};

export default api;