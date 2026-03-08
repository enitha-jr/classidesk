import React, { useState } from "react";
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
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import ticketService from "../services/ticketService";
import adminService from "../services/adminService";

const TicketInfo = ({ ticket, teams, loading, navigate, refresh, fromFilter = "active", adminTeamId = null }) => {
  const auth = useSelector((state) => state.auth);

  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [remarks, setRemarks] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleViewAttachment = async (e) => {
    e.preventDefault();

    try {
      const attachment = await ticketService.getAttachment(ticket.ticket_id);
      const blob = new Blob([attachment.data], { type: attachment.mimeType });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error("Failed to load attachment");
      }
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      setDeleting(true);
      await ticketService.deleteTicket(ticket.ticket_id);
      toast.success("Ticket deleted successfully");
      const dashboardPath = auth?.role === "admin" 
        ? `/classidesk/admin?filter=${fromFilter}` 
        : `/classidesk/dashboard`;
      navigate(dashboardPath);
    } catch (err) {
      toast.error("Failed to delete ticket");
    } finally {
      setDeleting(false);
    }
  };

  const handleAdminAction = async () => {
    if (!selectedAction) return toast.error("Please select an action");
    if (selectedAction === "forward" && !selectedTeam)
      return toast.error("Please select a team to forward to");
    if (!remarks.trim()) return toast.error("Please provide remarks");

    try {
      setSubmitting(true);

      if (selectedAction === "resolve") {
        await adminService.resolveTicket(ticket.ticket_id, {
          remarks: remarks.trim()
        });
      } else if (selectedAction === "forward") {
        await adminService.forwardTicket(ticket.ticket_id, {
          to_team_id: selectedTeam,
          remarks: remarks.trim()
        });
      }

      toast.success(
        `Ticket ${selectedAction === "resolve" ? "resolved" : "forwarded"
        } successfully`
      );

      setSelectedAction(null);
      setSelectedTeam("");
      setRemarks("");
      
      const dashboardPath = auth?.role === "admin" 
        ? `/classidesk/admin?filter=${selectedAction === "resolve" ? "resolved" : "forwarded"}` 
        : `/classidesk/dashboard`;
      setTimeout(() => navigate(dashboardPath), 500);

    } catch (err) {
      toast.error("Failed to update ticket");
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

  console.log("ticket", ticket);
  console.log("adminTeamId", adminTeamId);

  return (
    <>
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-2xl font-bold text-gray-800">
            {ticket.ticket_title}
          </h4>

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
              onClick={() => {
                const dashboardPath = auth?.role === "admin" 
                  ? `/classidesk/admin?filter=${fromFilter}` 
                  : `/classidesk/dashboard`;
                navigate(dashboardPath);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        <p className="text-gray-600 whitespace-pre-wrap">
          {ticket.ticket_desc || "No description provided"}
        </p>

        {ticket.attachment && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FileText className="w-4 h-4" />
              <button
                onClick={handleViewAttachment}
                className="text-blue-600 hover:underline font-medium"
              >
                View Attachment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <InfoBox
          icon={<AlertCircle className="w-5 h-5" />}
          label="Status"
          value={
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor(
                ticket.status
              )}`}
            >
              {ticket.status}
            </span>
          }
        />
        <InfoBox
          icon={<Users className="w-5 h-5" />}
          label="Created By"
          value={ticket.user_name || "Unknown"}
        />
        <InfoBox
          icon={<Calendar className="w-5 h-5" />}
          label="Created"
          value={formatDate(ticket.created_at)}
        />
      </div>

      {/* Admin Actions */}
      {auth?.role === "admin" && ticket.status !== "Resolved" && ticket.team_id === adminTeamId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Admin Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAction("resolve")}
                className={`inline-flex items-center gap-2 px-4 py-1 rounded-md border-2 transition-colors ${
                  selectedAction === "resolve"
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Resolve
              </button>
              <button
                onClick={() => setSelectedAction("forward")}
                className={`inline-flex items-center gap-2 px-4 py-1 rounded-md border-2 transition-colors ${
                  selectedAction === "forward"
                    ? "bg-orange-100 text-orange-700 border-orange-300"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Send className="w-4 h-4" />
                Forward
              </button>
            </div>
          </div>

          {selectedAction && (
            <div className="space-y-4 pt-4">
              {/* Team Selection */}
              {selectedAction === "forward" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Team
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full md:w-72 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a team</option>
                    {teams?.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Enter action remarks..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdminAction}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#688ed4] hover:bg-[#7fa8f2] text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit
                </button>

                <button
                  onClick={() => {
                    setSelectedAction(null);
                    setSelectedTeam("");
                    setRemarks("");
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const InfoBox = ({ icon, label, value }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center gap-2 text-gray-500 mb-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-gray-900 font-medium">{value}</div>
  </div>
);

export default TicketInfo;