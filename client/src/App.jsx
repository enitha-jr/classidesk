import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

function App() {
  const userData = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData?.token) {
      navigate("/");
    }
  }, [userData, navigate]);

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <Outlet />
    </div>
  );
}

export default App;
