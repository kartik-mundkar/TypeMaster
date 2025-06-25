// API Configuration
const getBaseUrl = () => {
  // Check if we're in development or production
  if (import.meta.env.DEV) {
    // Development environment - use environment variable or fallback to localhost
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003';
  } else {
    // Production environment - use environment variable or relative path
    return import.meta.env.VITE_API_BASE_URL || '';
  }
};

const BASE_URL = getBaseUrl();

export const API_CONFIG = {
  BASE_URL,
  API_BASE: `${BASE_URL}/api`,
  TEXT_API: `${BASE_URL}/api/text`,
  AUTH_API: `${BASE_URL}/api/auth`,
  RESULTS_API: `${BASE_URL}/api/results`,
  RACES_API: `${BASE_URL}/api/races`,
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || BASE_URL
}

export default API_CONFIG
