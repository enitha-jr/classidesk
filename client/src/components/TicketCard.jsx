import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  X,
  Trash2,
  Loader2,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Send
} from "lucide-react";
import toast from "react-hot-toast";
import ticketService from "../services/ticketService";
import { useSelector } from "react-redux";

const TicketCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [ticket, setTicket] = useState(null);
  const [flow, setFlow] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Admin action states
  const [showAdminActions, setShowAdminActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [remarks, setRemarks] = useState("");

  // Check if user is admin (you'll need to implement this based on your auth)
  const isAdmin = true; // Replace with actual admin check

  useEffect(() => {
    if (!id) return;
    fetchTicketData();
  }, [id]);

  useEffect(() => {
    if (isAdmin) {
      fetchTeams();
    }
  }, [isAdmin]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTicketById(id);
      setTicket(data);

      if (data.status === "Forwarded" || data.status === "Resolved") {
        setLoadingFlow(true);
        const flowData = await ticketService.getTicketFlow(id);
        setFlow(flowData || []);
        setLoadingFlow(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const teamsData = await ticketService.listTeams();
      setTeams(teamsData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      setDeleting(true);
      await ticketService.deleteTicket(id);
      toast.success("Ticket deleted successfully");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete ticket");
    } finally {
      setDeleting(false);
    }
  };

  const handleAdminAction = async () => {
    if (!selectedAction) {
      toast.error("Please select an action");
      return;
    }

    if (selectedAction === "forward" && !selectedTeam) {
      toast.error("Please select a team to forward to");
      return;
    }

    if (!remarks.trim()) {
      toast.error("Please provide remarks");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        action: selectedAction,
        team: selectedTeam || null,
        remarks: remarks.trim()
      };

      await ticketService.updateTicketStatus(id, payload);
      toast.success(`Ticket ${selectedAction === "resolve" ? "resolved" : "forwarded"} successfully`);

      // Reset form
      setSelectedAction(null);
      setSelectedTeam("");
      setRemarks("");
      setShowAdminActions(false);

      // Refresh ticket data
      await fetchTicketData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "initiated":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "forwarded":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const priorityColor = (priority) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-xl text-gray-600">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket #{ticket.ticket_id}
            </h1>
            <div className="flex items-center gap-2">
              {ticket.status === "Initiated" && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete</span>
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            {ticket.ticket_title}
          </h2>
          <p className="text-gray-600 whitespace-pre-wrap">
            {ticket.ticket_desc || "No description provided"}
          </p>

          {ticket.attachment && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="w-4 h-4" />
                <a
                  href={ticket.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Attachment
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InfoBox
            icon={<AlertCircle className="w-5 h-5" />}
            label="Status"
            value={
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            }
          />
          <InfoBox
            icon={<AlertCircle className="w-5 h-5" />}
            label="Priority"
            value={
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            }
          />
          <InfoBox
            icon={<Users className="w-5 h-5" />}
            label="Assigned To"
            value={ticket.team || ticket.ai_team || "Unassigned"}
          />
          <InfoBox
            icon={<Calendar className="w-5 h-5" />}
            label="Created"
            value={formatDate(ticket.created_at)}
          />
        </div>

        {/* Admin Actions */}
        {isAdmin && ticket.status !== "Resolved" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>

            {user?.role === "admin" && ticket.status !== "Resolved" && (
              !showAdminActions ? (
                <button
                  onClick={() => setShowAdminActions(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Take Action
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Action Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Action
                    </label>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setSelectedAction("resolve");
                          setSelectedTeam("");
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${selectedAction === "resolve"
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Resolved
                      </button>

                      <button
                        onClick={() => setSelectedAction("forward")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${selectedAction === "forward"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                      >
                        <Send className="w-4 h-4" />
                        Forward To Team
                      </button>
                    </div>
                  </div>

                  {/* Team Selection */}
                  {selectedAction === "forward" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Team
                      </label>

                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Choose a team...</option>
                        {teams.map((team) => (
                          <option key={team.team_id} value={team.team_name}>
                            {team.team_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedAction && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks
                      </label>

                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows="3"
                        placeholder="Add your remarks here..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleAdminAction}
                      disabled={submitting || !selectedAction}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowAdminActions(false);
                        setSelectedAction(null);
                        setSelectedTeam("");
                        setRemarks("");
                      }}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Ticket Lifecycle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ticket Lifecycle</h3>

          {ticket.status === "Initiated" && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Ticket is in initial state. No flow history yet.</p>
            </div>
          )}

          {(ticket.status === "Forwarded" || ticket.status === "Resolved") && (
            <>
              {loadingFlow ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading timeline...</span>
                </div>
              ) : flow.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No flow records found.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[15px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

                  {/* Timeline Items */}
                  <div className="space-y-6">
                    {flow.map((item, index) => (
                      <TimelineItem
                        key={item.flow_id || index}
                        item={item}
                        isLast={index === flow.length - 1}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// InfoBox Component
const InfoBox = ({ icon, label, value }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center gap-2 text-gray-500 mb-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-gray-900 font-medium">
      {value}
    </div>
  </div>
);

// Timeline Item Component
const TimelineItem = ({ item, isLast, formatDate }) => {
  const getStatusColor = (action) => {
    switch (action?.toUpperCase()) {
      case "CREATED":
        return "bg-blue-500";
      case "FORWARDED":
        return "bg-orange-500";
      case "RESOLVED":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="relative pl-12">
      {/* Timeline Dot */}
      <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white shadow-md ${getStatusColor(item.action)}`}></div>

      {/* Content */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{item.action}</h4>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(item.created_at || item.action_date)}
            </p>
          </div>
          {item.to_team && (
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {item.to_team}
            </div>
          )}
        </div>

        {item.remarks && (
          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
            <p className="text-sm text-gray-700">{item.remarks}</p>
          </div>
        )}

        {item.from_team && item.to_team && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-200 rounded">{item.from_team}</span>
            <span>→</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{item.to_team}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;