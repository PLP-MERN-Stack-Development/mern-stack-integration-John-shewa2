// api.js - API service for making requests to the backend

import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ---------- POST API ----------
export const postService = {
  // Get all published posts
  getAllPosts: async (page = 1, limit = 10, category = null) => {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get a single post by slug
  getPost: async (slug) => {
    const response = await api.get(`/posts/${slug}`);
    return response.data;
  },

  // ✅ Create a new post (fixed multipart/form-data issue)
  createPost: async (postData) => {
  const token = localStorage.getItem("token");
  const response = await api.post("/posts", postData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
},

  // Update post
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete post
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Add comment
  addComment: async (slug, commentData) => {
    const response = await api.post(`/posts/${slug}/comment`, commentData);
    return response.data;
  },

  // Search posts
  searchPosts: async (query) => {
    const response = await api.get(`/posts/search?q=${query}`);
    return response.data;
  },
};

// ---------- CATEGORY API ----------
export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },
};

// ---------- AUTH API ----------
export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default api;