export const API_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:4400/api'
export const BASE_URL = API_URL.replace(/\/api$/, '')
