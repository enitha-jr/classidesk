import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { clearAuth } from "../store/authSlice";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Check token expiration on mount and route change
  useEffect(() => {
    if (auth?.token && auth?.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      
      if (auth.exp < currentTime) {
        console.warn("Token expired - Clearing auth state");
        dispatch(clearAuth());
      }
    }
  }, [auth?.token, auth?.exp, dispatch]);

  // Check if user is authenticated
  if (!auth || !auth.token) {
    return <Navigate to="/" replace />;
  }

  // Check token expiration
  if (auth.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (auth.exp < currentTime) {
      return <Navigate to="/" replace />;
    }
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
