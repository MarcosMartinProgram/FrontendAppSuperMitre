import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
};

export const productosAPI = {
  getAll: () => api.get('/api/productos'),
  getByCodigo: (codigo) => api.get(`/api/productos/${codigo}`),
  getByRubro: (idRubro) => api.get(`/api/productos/por-rubro/${idRubro}`),
  create: (producto) => api.post('/api/productos', producto),
  update: (codigo, producto) => api.put(`/api/productos/${codigo}`, producto),
  delete: (codigo) => api.delete(`/api/productos/${codigo}`),
};

export const rubrosAPI = {
  getAll: () => api.get('/api/rubros'),
  create: (rubro) => api.post('/api/rubros', rubro),
};

export const ticketsAPI = {
  getAll: () => api.get('/api/tickets'),
  create: (ticket) => api.post('/api/tickets', ticket),
  getDisponibles: (params) => api.get('/api/clientes/tickets-disponibles', { params }),
};

export const clientesAPI = {
  getAll: () => api.get('/api/clientes'),
  getById: (id) => api.get(`/api/clientes/${id}`),
  getResumen: (id) => api.get(`/api/clientes/${id}/resumen`),
  getTicketsPendientes: (id) => api.get(`/api/clientes/${id}/tickets-pendientes`),
  registrarPago: (id, data) => api.post(`/api/clientes/${id}/pago`, data),
  asociarTicket: (id, data) => api.post(`/api/clientes/${id}/asociar-ticket`, data),
  saldar: (id, data) => api.post(`/api/clientes/${id}/saldar`, data),
  create: (cliente) => api.post('/api/clientes/registrar', cliente),
  update: (id, cliente) => api.put(`/api/clientes/${id}`, cliente),
};

export const reportesAPI = {
  get: (tipo) => api.get(`/api/reportes/${tipo}`),
};

export const mpAPI = {
  crearPreferencia: (carrito) => api.post('/api/mercadopago/crear-preferencia', { carrito }),
};

export const pedidosOnlineAPI = {
  getAll: (estado) => api.get('/api/pedidos-online', { params: estado ? { estado } : {} }),
  getById: (id) => api.get(`/api/pedidos-online/${id}`),
  updateEstado: (id, estado) => api.put(`/api/pedidos-online/${id}/estado`, { estado }),
  reenviarWhatsApp: (id) => api.post(`/api/pedidos-online/${id}/reenviar-whatsapp`),
  registrar: (data) => api.post('/api/pedidos-online/registrar', data),
};

export default api;
