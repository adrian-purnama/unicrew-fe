import axios from "axios";
import qs from "qs";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  //baseURL: 'https://unikru-be.nusagitra.web.id/',
  // baseURL: 'https://unnicrew-be.onrender.com',
  //  baseURL: "http://localhost:4000",
   baseURL: "https://be-unikru.amfphub.com",
  paramsSerializer: (params) =>
    qs.stringify(params, {
      arrayFormat: "brackets",
      encode: false,
    }),
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("unicru-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response, // if response is successful, just return it
  (error) => {
    if (error.response && error.response.status === 429) {
      // If 429 status code is returned (rate limit exceeded)
      toast.error(
        "Whoa slow down there, too many request",
        {
          duration: 5000, // Adjust the duration as needed
          style: {
            background: "#80cbc4", // Soft teal background for a calming effect
            color: "#ffffff", // White text for better contrast
            borderRadius: "8px", // Soft corners for a smooth feel
            padding: "12px", // Adequate padding to make it visually comfortable
            fontSize: "16px", // Slightly larger text for readability
            fontWeight: "500", // Medium weight for readability
          },
          icon: "💆‍♂️", // A soothing icon (optional, use an emoji for relaxation)
        }
      );
    }

    return Promise.reject(error); // Reject the promise for other errors
  }
);

export default axiosInstance;
