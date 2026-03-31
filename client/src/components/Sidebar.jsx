import { NavLink, useNavigate } from "react-router-dom";
import { VscGraph } from "react-icons/vsc";
import { GoPlusCircle } from "react-icons/go";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { RiRobot3Line } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { clearAuth } from "../store/authSlice";
import chatServices from "../services/chatServices";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth);

  const linkStyle =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium";

  async function handleLogout() {
    try {
      await chatServices.clearChatHistory();
    } catch (error) {
      console.warn("Failed to clear chat history during logout:", error);
    }

    dispatch(clearAuth());
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#c2d7fb] shadow-sm p-6 flex flex-col text-[#1f2937]">

      <h1 className="text-2xl font-bold mb-10 ml-10">
        ClassiDesk
      </h1>

      <nav className="space-y-3 flex-1">

        <NavLink
          to="create-ticket"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? "bg-white shadow-sm" : "hover:bg-white"
            }`
          }
        >
          <GoPlusCircle size={18} />
          Create Ticket
        </NavLink>

        <NavLink
          to={userData?.role === "admin" ? "admin" : "dashboard"}
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? "bg-white shadow-sm" : "hover:bg-white"}`
          }
        >
          <VscGraph size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="faqs"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? "bg-white shadow-sm" : "hover:bg-white"
            }`
          }
        >
          <HiOutlineQuestionMarkCircle size={18} />
          FAQs
        </NavLink>

        <NavLink
          to="chat"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? "bg-white shadow-sm" : "hover:bg-white"
            }`
          }
        >
          <RiRobot3Line size={18} />
          ChatBot
        </NavLink>

      </nav>

      {/* {userData && (
        <div className="text-xl mb-8 opacity-80 truncate text-center">
          👤 {userData.username}
        </div>
      )} */}
      <button
        onClick={handleLogout}
        className="mt-auto bg-[#8aa9e0] font-semibold py-2 rounded-lg hover:bg-[#93b6f5] transition"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
