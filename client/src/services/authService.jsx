import apiInstance from "./apiService";
import { createDemoAuth, DEMO_PASSWORD, isDemoEmail } from "./demoData";

const login = async (loginData) => {
    try {
        if (isDemoEmail(loginData?.email)) {
            if (loginData?.password !== DEMO_PASSWORD) {
                return null;
            }

            return createDemoAuth(loginData.email);
        }

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