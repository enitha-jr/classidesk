import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Inbox, Calendar, Users, ChevronRight, Paperclip, Trash2 } from "lucide-react";

import ticketService from "../services/ticketService";

import DashboardHeader from "../components/DashHeader";

const Dashboard = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth);
  const userId = userData?.user_id;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    fetchTickets();
  }, [userData]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getUserTickets();
      setTickets(data);
    } catch (error) {
      // Don't show error for 401 - the interceptor handles redirect
      if (error.response?.status !== 401) {
        console.error(error);
        toast.error("Failed to fetch tickets");
      }
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

  // View attachment in new window
  const handleViewAttachment = async (e, ticketId) => {
    e.stopPropagation();

    try {
      const attachment = await ticketService.getAttachment(ticketId);
      const blob = new Blob([attachment.data], { type: attachment.mimeType });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error("Failed to load attachment");
      }
    }
  };

  // Delete ticket
  const handleDeleteTicket = async (e, ticketId) => {
    if(!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      
      await ticketService.deleteTicket(ticketId);
      toast.success("Ticket deleted successfully");
      fetchTickets();
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error("Failed to delete ticket");
      }
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const status = ticket.status?.toLowerCase();
    if (filter === "active") return status === "initiated" || status === "forwarded";
    return status === filter;
  });

  return (
    <div className="min-h-screen bg-[#eef4ff] py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <DashboardHeader
          title="MY TICKETS"
          filter={filter}
          setFilter={setFilter}
          filters={["active", "resolved"]}
          showCreateButton={true}
          createPath="/classidesk/create-ticket"
        />

        {/* Tickets List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mb-3" />
            <p className="text-sm font-medium">Loading tickets…</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
            <Inbox className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No tickets found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                role="button"
                tabIndex={0}
                className="group w-full text-left bg-white rounded-lg border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                {/* Title & Description with Metadata on Top Right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[0.95rem] font-semibold text-gray-800 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {ticket.ticket_title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                      {ticket.ticket_desc || "No description provided"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Metadata - Status, Team, Date */}
                    <div className="flex flex-col gap-1 text-sm text-gray-500 items-end">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap">
                        <span className="font-medium">{ticket?.team_name || "General"}</span>
                        <Users className="h-4 w-4" />
                      </span>
                      <span className="inline-flex items-center gap-2 whitespace-nowrap">
                        {ticket.status?.toLowerCase() === "resolved" && ticket.resolved_at ? (
                          <>
                            <span className="text-green-600 font-medium">Resolved: </span>
                            {new Date(ticket.resolved_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit"
                            })}
                          </>
                        ) : (
                          new Date(ticket.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })
                        )}
                        <Calendar className="h-4 w-4" />
                      </span>
                    </div>


                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between border-gray-100">
                  {ticket.attachment ? (
                    <button
                      onClick={(e) => handleViewAttachment(e, ticket.ticket_id)}
                      className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 rounded px-3 py-2 w-fit transition-colors duration-150 border border-gray-200 hover:border-blue-300 cursor-pointer"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate font-medium hover:text-blue-600">{ticket.attachment.split('/').pop()}</span>
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">No attachment</p>
                  )}
                  {/* Delete Button */}
                  {
                    ticket.status?.toLowerCase() === "initiated" && (
                      <button
                        onClick={(e) => handleDeleteTicket(e, ticket.ticket_id)}
                        className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded transition-colors duration-150 border border-gray-200 hover:border-red-300"
                        title="Delete ticket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )
                  }  
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
