import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register:       data => api.post('/auth/register', data),
  login:          data => api.post('/auth/login', data),
  me:             ()   => api.get('/auth/me'),
  updateProfile:  data => api.put('/auth/me', data),
  changePassword: data => api.put('/auth/me/password', data),
};

export const expenseApi = {
  getAll:        params     => api.get('/expenses', { params }),
  getOne:        id         => api.get(`/expenses/${id}`),
  create:        data       => api.post('/expenses', data),
  update:        (id, data) => api.put(`/expenses/${id}`, data),
  remove:        id         => api.delete(`/expenses/${id}`),
  removeByMonth: month      => api.delete('/expenses', { params: { month } }),
  getSummary:    params     => api.get('/expenses/analytics/summary', { params }),
};

export const budgetApi = {
  getAll: month => api.get('/budgets', { params: { month } }),
  set:    data  => api.post('/budgets', data),
  remove: id    => api.delete(`/budgets/${id}`),
};

export default api;
