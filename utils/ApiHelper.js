import axios from 'axios';
import qs from 'qs';

const axiosInstance = axios.create({
  baseURL: 'https://unikru-be.nusagitra.web.id/',
  // baseURL: 'https://unicrew-be.onrender.com',
  // baseURL: 'http://localhost:4001',
  paramsSerializer: (params) =>
    qs.stringify(params, {
      arrayFormat: 'brackets',
      encode: false,
    }),
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("unicru-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

export default axiosInstance;
