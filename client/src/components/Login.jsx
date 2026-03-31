import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import authServices from "../services/authService";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    dispatch(setAuth({}));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await authServices.login(loginData);

    if (!response) {
      toast.error("Login failed. Please check your credentials.");
      return;
    }

    dispatch(setAuth(response));

    if (response.role === "user") {
      navigate("/classidesk/dashboard");
    } else if (response.role === "admin") {
      navigate("/classidesk/admin");
    }
    
  };


  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#2d1b35]">
        ClassiDesk
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#d8b3e0]"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#d8b3e0]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#a9c6f8] text-[#1f2937] font-semibold py-2 rounded hover:bg-[#93b6f5] transition"
        >
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;
