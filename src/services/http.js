// Ready for the Express backend. Not used yet: pages call src/services/api.js,
// which currently runs against browser-stored demo data.
import axios from 'axios'

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' })
http.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('civicloop_token') // Supabase access token later
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
export default http
