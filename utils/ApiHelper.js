import axios from 'axios';
import qs from 'qs';

const axiosInstance = axios.create({
  baseURL: 'https://unicrew-be.onrender.com',
  // baseURL: 'http://localhost:10000',
  paramsSerializer: (params) =>
    qs.stringify(params, {
      arrayFormat: 'brackets', // formats arrays as key[]=a&key[]=b
      encode: false,           // optional: disables URL encoding
    }),
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("unicru-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Dynamically set Content-Type only if not FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

export default axiosInstance;
