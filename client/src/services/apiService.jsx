import axios from "axios";
import {store} from "../store/store";
import { clearAuth } from "../store/authSlice";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
});

// Request interceptor - Add token to headers
apiInstance.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        console.log('Token from store:', token);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors
apiInstance.interceptors.response.use(
    (response) => {
        // Return successful response as-is
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            console.error("401 Unauthorized - Token expired or invalid");
            
            // Clear auth state
            store.dispatch(clearAuth());
            
            // Show error message
            toast.error("Session expired. Please login again.");
            
            // Redirect to login page
            window.location.href = "/";
        }
        
        return Promise.reject(error);
    }
);

export default apiInstance;