import axios from 'axios'

// Axios client pre-configured for the Spring Boot backend.
// All requests go to http://localhost:8080/api (see backend/application.yml).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT token to every request if the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('newsfeed_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ---------- Auth ---------- */

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
}

/* ---------- Articles ---------- */

export const articleApi = {
  getAll: (params) => api.get('/articles', { params }),
  getById: (id) => api.get(`/articles/${id}`),
  getTrending: () => api.get('/articles/trending'),
  getCategories: () => api.get('/categories'),
}

/* ---------- Saved articles (requires login) ---------- */

export const savedApi = {
  getSaved: () => api.get('/saved'),
  saveArticle: (articleId) => api.post(`/saved/${articleId}`),
  unsaveArticle: (articleId) => api.delete(`/saved/${articleId}`),
}

export default api
