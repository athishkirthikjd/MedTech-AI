/**
 * API Configuration for MedTech AI
 * 
 * Handles API base URL for both development and production:
 * - Development: Uses VITE_API_URL (http://localhost:8000)
 * - Production: Uses same origin (empty string)
 */

// Base URL for API calls
// In production (Render), frontend and backend are served from the same origin
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// API version prefix
export const API_PREFIX = '/api/v1';

// Full API URL
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

/**
 * Create full API endpoint URL
 */
export const apiEndpoint = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

/**
 * API endpoints grouped by feature
 */
export const endpoints = {
  // Auth
  auth: {
    verify: apiEndpoint('/auth/verify'),
    me: apiEndpoint('/auth/me'),
    register: apiEndpoint('/auth/register'),
  },
  
  // AI Services
  ai: {
    symptomCheck: apiEndpoint('/ai/symptom-check'),
    voiceChat: apiEndpoint('/ai/voice-chat'),
    chat: apiEndpoint('/ai/chat'),
  },
  
  // Appointments
  appointments: {
    list: apiEndpoint('/appointments'),
    create: apiEndpoint('/appointments'),
    get: (id: string) => apiEndpoint(`/appointments/${id}`),
    cancel: (id: string) => apiEndpoint(`/appointments/${id}/cancel`),
  },
  
  // Vitals
  vitals: {
    record: apiEndpoint('/vitals'),
    history: apiEndpoint('/vitals/history'),
    latest: apiEndpoint('/vitals/latest'),
  },
  
  // Emergency
  emergency: {
    trigger: apiEndpoint('/emergency/trigger'),
    status: (id: string) => apiEndpoint(`/emergency/${id}`),
    resolve: (id: string) => apiEndpoint(`/emergency/${id}/resolve`),
  },
  
  // Doctors
  doctors: {
    list: apiEndpoint('/doctors'),
    get: (id: string) => apiEndpoint(`/doctors/${id}`),
    availability: (id: string) => apiEndpoint(`/doctors/${id}/availability`),
  },
} as const;

/**
 * Default fetch options with auth token
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};

export default {
  API_BASE_URL,
  API_URL,
  apiEndpoint,
  endpoints,
  fetchWithAuth,
};
