import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

const TicketFlow = ({ ticket, flow, loadingFlow }) => {

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  const getColor = (action) => {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-6">
        Ticket Lifecycle
      </h3>

      {loadingFlow ? (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : flow.length === 0 ? (
        <div className="text-center text-gray-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-2" />
          <p>No flow history yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {flow.map((item, index) => (
            <div key={item.flow_id || index} className="flex gap-4">
              <div className={`w-4 h-4 rounded-full mt-2 ${getColor(item.action)}`} />
              <div>
                <p className="font-semibold">{item.action}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(item.created_at || item.action_date)}
                </p>
                {item.remarks && (
                  <p className="mt-2 text-gray-700">{item.remarks}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketFlow;