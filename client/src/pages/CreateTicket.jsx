import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ticketService from "../services/ticketService";
import toast from "react-hot-toast";
import { FileText, AlignLeft, Users, Paperclip, Send, X } from "lucide-react";

const CreateTicket = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [ticketData, setTicketData] = useState({
    ticket_title: "",
    ticket_desc: "",
    team_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await ticketService.listTeams();
        setTeams(data || []);
      } catch (err) {
        console.error("Failed to fetch teams", err);
        toast.error("Failed to load teams");
      }
    };
    fetchTeams();
  }, []);

  const handleAttachmentChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicketData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!ticketData.ticket_title) {
        toast.error("Title is required");
        return;
      }
      setLoading(true);
      const formData = new FormData();
      formData.append("ticket_title", ticketData.ticket_title);
      formData.append("ticket_desc", ticketData.ticket_desc);
      if (ticketData.team_id) formData.append("team_id", ticketData.team_id);
      if (attachment) formData.append("attachment", attachment);

      await ticketService.createTicket(formData);
      toast.success("Ticket created successfully");
      setTicketData({ ticket_title: "", ticket_desc: "", team_id: "" });
      setAttachment(null);
      navigate("/classidesk/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: "100%",
    background: "#f8fbff",
    border: "1.5px solid #dce8fd",
    borderRadius: "12px",
    padding: "11px 14px 11px 42px",
    fontSize: "0.875rem",
    color: "#1a3f7a",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#93b6f5";
    e.target.style.boxShadow = "0 0 0 3px rgba(147,182,245,0.15)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "#dce8fd";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="flex items-center justify-center py-6">
      <div
        className="w-full"
        style={{ maxWidth: "460px" }}
      >
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 8px 32px rgba(45,95,173,0.12)", border: "1px solid #dce8fd" }}
        >
          {/* Card Header */}
          <div
            className="px-7 py-5 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #2d5fad 0%, #1a3f7a 100%)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(147,182,245,0.2)", border: "1px solid rgba(147,182,245,0.3)" }}
            >
              <FileText size={18} style={{ color: "#93b6f5" }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Create Ticket</h2>

            </div>
          </div>

          {/* Form Body */}
          <div className="px-7 py-6" style={{ background: "#ffffff" }}>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Title */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#2d5fad" }}>
                  Title <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <div className="relative">
                  <FileText
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#93b6f5" }}
                  />
                  <input
                    name="ticket_title"
                    value={ticketData.ticket_title}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Brief title of your issue"
                    style={inputBase}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#2d5fad" }}>
                  Description
                </label>
                <div className="relative">
                  <AlignLeft
                    size={15}
                    className="absolute left-3 top-3.5 pointer-events-none"
                    style={{ color: "#93b6f5" }}
                  />
                  <textarea
                    name="ticket_desc"
                    value={ticketData.ticket_desc}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    style={{ ...inputBase, paddingTop: "11px", resize: "none" }}
                  />
                </div>
              </div>

              {/* Team Select */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#2d5fad" }}>
                  Raise To
                </label>
                <div className="relative">
                  <Users
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#93b6f5" }}
                  />
                  <select
                    name="team_id"
                    value={ticketData.team_id}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{
                      ...inputBase,
                      appearance: "none",
                      cursor: "pointer",
                      paddingRight: "36px",
                    }}
                  >
                    <option value="">Select a team (optional)</option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="#93b6f5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Attachment */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#2d5fad" }}>
                  Attachment
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all"
                  style={{
                    background: "#f8fbff",
                    borderColor: attachment ? "#2d5fad" : "#dce8fd",
                    borderStyle: "dashed",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={15} style={{ color: "#93b6f5", flexShrink: 0 }} />
                  <span className="text-sm flex-1 truncate" style={{ color: attachment ? "#1a3f7a" : "#9ca3af" }}>
                    {attachment ? attachment.name : "Click to attach a file (PDF, JPG, PNG · max 5MB)"}
                  </span>
                  {attachment && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAttachment(null); fileInputRef.current.value = ""; }}
                      className="shrink-0"
                    >
                      <X size={14} style={{ color: "#6b9ef0" }} />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="attachment"
                  onChange={handleAttachmentChange}
                  className="hidden"
                />
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "#eef4ff", marginTop: "4px" }} />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: loading
                    ? "#a0bef7"
                    : "linear-gradient(135deg, #2d5fad 0%, #1a3f7a 100%)",
                  color: "#ffffff",
                  boxShadow: loading ? "none" : "0 3px 12px rgba(45,95,173,0.3)",
                  cursor: loading ? "not-allowed" : "pointer",
                  border: "none",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Submit Ticket
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;