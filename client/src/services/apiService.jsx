import axios from "axios";
import {store} from "../store/store";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
});

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

export default apiInstance;