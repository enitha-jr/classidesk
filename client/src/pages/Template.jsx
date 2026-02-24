import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Template = () => {
  return (
    <div className="flex h-screen bg-[#eef4ff] text-[#1f2937] overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Template;
