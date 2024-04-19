import axios from 'axios'
import config from 'app-config'

const kasaHttpClient = axios.create({
  baseURL:  config.kaxa.apiBaseUrl,
})

// Add a request interceptor
kasaHttpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kasa:token')
  if (config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
})

// kasaHttpClient.interceptors.response.use(
//   (response) => {
//       console.log('global success/error place');
//     if (response.status === 401) {
//       localStorage.clear()
//       window.location.reload()
//     }
//     return response;
//   },
//   (error) => {
//     console.log('BACKEND ERROR ====> ', error)
//       return error;
//   }
// )
export default kasaHttpClient
