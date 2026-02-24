import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Inbox, Calendar, Users, ChevronRight } from "lucide-react";

import adminService from "../services/adminService";
import DashboardHeader from "../components/DashHeader";
import DashboardStats from "../components/DashStats";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const adminId = auth?.user_id;
  const adminRole = auth?.role;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await adminService.getTeamTickets(adminId);
      setTickets(ticketsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  // Status and priority colors (same as user dashboard)
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "initiated":
        return "bg-blue-100 text-blue-700";
      case "forwarded":
        return "bg-orange-100 text-orange-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return ticket.status?.toLowerCase() !== "resolved";
    return ticket.status?.toLowerCase() === filter;
  });

  const getSuggestedTeam = (ticket) => {
    if (ticket.ai_team && ticket.ai_team !== ticket.team) return ticket.ai_team;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#eef4ff] py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <DashboardHeader
          title="Team Dashboard"
          subtitle={adminRole === "admin" ? "Admin View" : "Support View"}
          filter={filter}
          setFilter={setFilter}
          filters={["all", "initiated", "forwarded","resolved"]}
        />

        {/* Stats */}
        <DashboardStats
          stats={[
            { label: "Active Tickets", value: tickets.filter((t) => t.status?.toLowerCase() !== "resolved").length, bg: "bg-white", labelColor: "text-gray-500", valueColor: "text-gray-800" },
            { label: "Initiated", value: tickets.filter((t) => t.status?.toLowerCase() === "initiated").length, bg: "bg-blue-50", labelColor: "text-blue-600", valueColor: "text-blue-700" },
            { label: "Forwarded", value: tickets.filter((t) => t.status?.toLowerCase() === "forwarded").length, bg: "bg-orange-50", labelColor: "text-orange-600", valueColor: "text-orange-700" },
            { label: "Resolved Today", value: tickets.filter((t) => t.status?.toLowerCase() === "resolved" && new Date(t.updated_at).toDateString() === new Date().toDateString()).length, bg: "bg-green-50", labelColor: "text-green-600", valueColor: "text-green-700" },
          ]}
        />

        {/* Ticket List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mb-3" />
            <p className="text-sm font-medium">Loading tickets…</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
            <Inbox className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No tickets to display</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.ticket_id}
                onClick={() => navigate(`/classidesk/admin/ticket/${ticket.ticket_id}`)}
                className="group w-full text-left bg-white rounded-lg border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[0.95rem] font-semibold text-gray-800 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {ticket.ticket_title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                      {ticket.ticket_desc || "No description provided"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority?.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{ticket.team}</span>
                  </span>
                  {getSuggestedTeam(ticket) && (
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                      AI Suggested: {ticket.ai_team}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
