import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ticketService from "../services/ticketService";
import toast from "react-hot-toast";

const CreateTicket = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth);
  const userId = userData?.user_id;

  const [ticketData, setTicketData] = useState({
    ticket_title: "",
    ticket_desc: "",
    team: "",
  });

  const [loading, setLoading] = useState(false);

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const data = await ticketService.listTeams();
      setTeams(data);
    };
    fetchTeams();
  }, []);

  const [attachment, setAttachment] = useState(null);
  const handleAttachmentChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicketData((prev) => ({ ...prev, [name]: value, }));
  };

  /* =========================
     handleSubmit
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if(!ticketData.ticket_title ) {
        toast.error("Title is required");
        return;
      }
      setLoading(true);
      // console.log("ticketData:", ticketData);
      const formData = new FormData();

      formData.append("ticket_title", ticketData.ticket_title);
      formData.append("ticket_desc", ticketData.ticket_desc);
      formData.append("team", ticketData.team);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      await ticketService.createTicket(formData);
      toast.success("Ticket created successfully");

      setTicketData({
        ticket_title: "",
        ticket_desc: "",
        team: "",
      });
      setAttachment(null);
      navigate("/classidesk/dashboard",{ replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center mt-8">

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">

        <h2 className="text-2xl font-bold mb-6 text-center text-[#2d1b35]">
          Create Ticket
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            name="ticket_title"
            value={ticketData.ticket_title}
            onChange={handleChange}
            required
            placeholder="Title"
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d59cdc]"
          />

          <textarea
            name="ticket_desc"
            value={ticketData.ticket_desc}
            onChange={handleChange}
            rows={4}
            placeholder="Description"
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d59cdc]"
          />

          <select
            name="team"
            value={ticketData.team}
            onChange={handleChange}
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d59cdc]"
          >
            <option value="">Raise To (optional)</option>
            {teams.map((team) => (
              <option key={team.team_id} value={team.team_name}>
                {team.team_name}
              </option>
            ))}
          </select>

          <input
            type="file"
            name="attachment"
            onChange={handleAttachmentChange}
            className="w-full border border-gray-200 p-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a9c6f8] text-[#1f2937] font-semibold py-3 rounded-lg hover:bg-[#93b6f5] transition"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default CreateTicket;
