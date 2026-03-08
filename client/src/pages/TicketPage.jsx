import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import ticketService from "../services/ticketService";
import adminService from "../services/adminService";

import TicketInfo from "../components/TicketInfo";
import TicketFlow from "../components/TicketFlow";

const TicketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((state) => state.auth);
  const adminTeamId = userData?.team_id || null;

  const fromFilter = location.state?.fromFilter || "active";

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

      const ticketData = await adminService.getTicketById(id);
      setTicket(ticketData);  

      const teamsData = await ticketService.listTeams();
      setTeams(teamsData || []);

      setLoadingFlow(true);
      const flowData = await adminService.getTicketFlow(id);
      setFlow(flowData || []);
      setLoadingFlow(false);


    } catch (err) {
      console.error(err);
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <TicketInfo
          ticket={ticket}
          teams={teams}
          loading={loading}
          navigate={navigate}
          refresh={fetchTicketData}
          fromFilter={fromFilter}
          adminTeamId={adminTeamId}
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

export default TicketPage;