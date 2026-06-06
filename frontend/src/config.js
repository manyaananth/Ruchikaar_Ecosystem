// Central API base URL configuration
// In production (Capacitor/Android), this must be set to the deployed backend URL.
// The VITE_API_BASE_URL environment variable overrides this at build time.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

export default API_BASE_URL
