import axios from 'axios';

const env = import.meta.env || {};
const API_BASE_URL = (env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

export default apiClient;
