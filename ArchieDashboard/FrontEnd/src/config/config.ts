const apiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !apiUrl) {
  throw new Error('VITE_API_URL must be set for production builds');
}

export default {
  apiUrl: apiUrl || 'http://localhost:4100/api/v1'
};
