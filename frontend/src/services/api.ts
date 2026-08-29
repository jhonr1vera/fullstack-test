import axios from 'axios';

// Instancia de Axios configurada para adjuntar cookies de sesión automáticamente
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
