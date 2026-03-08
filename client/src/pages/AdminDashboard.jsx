import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Inbox, Calendar, Users, ChevronRight } from "lucide-react";

import adminService from "../services/adminService";
import DashboardHeader from "../components/DashHeader";
import DashboardStats from "../components/DashStats";

const emptyTicketGroups = {
  active: [],
  forwarded: [],
  resolved: []
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = useSelector((state) => state.auth);
  const adminId = auth?.user_id;
  const adminRole = auth?.role;

  const [ticketGroups, setTicketGroups] = useState(emptyTicketGroups);
  const [loading, setLoading] = useState(true);
  
  const urlFilter = searchParams.get("filter");
  const initialFilter = ["active", "forwarded", "resolved"].includes(urlFilter) ? urlFilter : "active";
  const [filter, setFilter] = useState(initialFilter);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    setSearchParams({ filter }, { replace: true });
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await adminService.getTeamTickets();
      setTicketGroups({
        active: ticketsData?.active || [],
        forwarded: ticketsData?.forwarded || [],
        resolved: ticketsData?.resolved || []
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  // Status color
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

  const filteredTickets = ticketGroups[filter] || [];

  return (
    <div className="min-h-screen bg-[#eef4ff] py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <DashboardHeader
          title="Team Dashboard"
          subtitle={adminRole === "admin" ? "Admin View" : "Support View"}
          filter={filter}
          setFilter={setFilter}
          filters={["active", "forwarded", "resolved"]}
        />

        {/* Stats */}
        <DashboardStats
          stats={[
            { label: "Active Tickets", value: ticketGroups.active.length, bg: "bg-white", labelColor: "text-gray-500", valueColor: "text-gray-800" },
            { label: "Forwarded", value: ticketGroups.forwarded.length, bg: "bg-orange-50", labelColor: "text-orange-600", valueColor: "text-orange-700" },
            { label: "Resolved", value: ticketGroups.resolved.length, bg: "bg-green-50", labelColor: "text-green-600", valueColor: "text-green-700" },
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
            {filteredTickets.map((ticket) => {

              const formattedDate = new Date(ticket.created_at).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              );

              const isForwarded = ticket.status?.toLowerCase() === "forwarded";

              return (
                <button
                  key={ticket.ticket_id}
                  onClick={() => navigate(`/classidesk/ticket/${ticket.ticket_id}`, { state: { fromFilter: filter } })}
                  className="group w-full text-left bg-white rounded-lg border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >

                  {/* Row 1 : Title + Status */}
                  <div className="flex items-center justify-between gap-3">
                  
                    <h3 className="text-[0.95rem] font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors flex-1 min-w-0">
                      #{ticket.ticket_id} - {ticket.ticket_title}
                    </h3>

                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium shrink-0 ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>

                  {/* Row 2 : Description + Date */}
                  <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-gray-500">
                    <p className="line-clamp-1 flex-1 min-w-0 text-gray-500">
                      {ticket.ticket_desc || "No description provided"}
                    </p>

                    <span className="inline-flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {new Date(ticket.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  {/* Row 3 : User + AI */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">

                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">{ticket.user_name || "Unknown"}</span>
                    </span>

                    {ticket.ai_team_id && ticket.status==="initiated" && (
                      <span className="inline-flex items-center bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                        AI Suggested
                      </span>
                    )}

                    {ticket.status?.toLowerCase() === "forwarded" && (
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">
                        ➜ Forwarded to {ticket.team_name}
                      </span>
                    )}


                  </div>

                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
