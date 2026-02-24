import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ticketService from "../services/ticketService";
import TicketInfo from "../components/TicketInfo";
import TicketFlow from "../components/TicketFlow";

const TicketCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [flow, setFlow] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlow, setLoadingFlow] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchTicketData();
  }, [id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);

      const ticketData = await ticketService.getTicketById(id);
      setTicket(ticketData);
      setLoadingFlow(true);
      const flowData = await ticketService.getTicketFlow(id);
      setFlow(flowData || []);
      setLoadingFlow(false);

      const teamsData = await ticketService.listTeams();
      setTeams(teamsData || []);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <TicketInfo
          ticket={ticket}
          teams={teams}
          loading={loading}
          navigate={navigate}
          refresh={fetchTicketData}
        />

        <TicketFlow
          ticket={ticket}
          flow={flow}
          loadingFlow={loadingFlow}
        />
      </div>
    </div>
  );
};

export default TicketCard;