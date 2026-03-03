import axios from "axios";
import axiosRetry from "axios-retry";
const api = axios.create({
  baseURL: "http://localhost:9999",
  headers: {
    "Content-Type": "application/json",
  },
});
axiosRetry(api,
  {
    retries: 5,
    retryDelay: (retryCount, err) => {
      return retryCount * 1000;
    },
    retryCondition: (error) => { 
      return error.response && error.response.status >= 500; 
    },
  })
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Phiên đăng nhập hết hạn.");
      try{
        const res = await api.post("/auth/refresh", {}, {
          withCredentials: true
        });
        if(!res.data.status){
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login"; 
          return Promise.reject(error);

        } 
        const newToken = res.data.token; 
        localStorage.setItem("token", newToken); 
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        return api(originalRequest);
      }catch(err){
        localStorage.removeItem("token"); 
        localStorage.removeItem("user"); 
        window.location.href = "/login"; 
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
