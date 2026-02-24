import apiInstance from "./apiService";

const login = async (loginData) => {
    try {
        // console.log(loginData);
        const response = await apiInstance.post('/login', loginData);
        return response.data;
    }
    catch (error) {
        console.error('Login error:', error);
    }
}

const authServices = {
    login
}

export default authServices;