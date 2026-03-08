import React from "react";
import { Loader2, AlertCircle, Plus, ArrowRight, CheckCircle } from "lucide-react";

const TicketFlow = ({ flow, loadingFlow }) => {

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  const getColors = (action) => {
    switch (action?.toUpperCase()) {
      case "CREATED":
        return {
          dot: "bg-blue-500 border-blue-200 shadow-blue-200",
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          icon: "text-white",
          line: "from-blue-300",
        };
      case "FORWARDED":
        return {
          dot: "bg-orange-500 border-orange-200 shadow-orange-200",
          badge: "bg-orange-50 text-orange-700 border-orange-200",
          icon: "text-white",
          line: "from-orange-300",
        };
      case "RESOLVED":
        return {
          dot: "bg-green-500 border-green-200 shadow-green-200",
          badge: "bg-green-50 text-green-700 border-green-200",
          icon: "text-white",
          line: "from-green-300",
        };
      default:
        return {
          dot: "bg-gray-400 border-gray-200 shadow-gray-200",
          badge: "bg-gray-50 text-gray-600 border-gray-200",
          icon: "text-white",
          line: "from-gray-300",
        };
    }
  };

  const getIcon = (action) => {
    switch (action?.toUpperCase()) {
      case "CREATED":
        return <Plus className="w-3.5 h-3.5 text-white" />;
      case "FORWARDED":
        return <ArrowRight className="w-3.5 h-3.5 text-white" />;
      case "RESOLVED":
        return <CheckCircle className="w-3.5 h-3.5 text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Ticket Lifecycle</h3>

      {loadingFlow ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : flow.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <AlertCircle className="w-10 h-10 mx-auto mb-2" />
          <p>No flow history yet.</p>
        </div>
      ) : (
        <div className="relative ml-2">

          {flow.map((item, index) => {
            const colors = getColors(item.action);
            const isLast = index === flow.length - 1;

            return (
              <div key={item.flow_id || index} className="relative flex gap-5">

                {/* Left: dot + line column */}
                <div className="flex flex-col items-center" style={{ minWidth: 32 }}>

                  {/* Step number ring + colored dot */}
                  <div className="relative flex items-center justify-center">
                    {/* Outer ring */}
                    <div
                      className={`w-8 h-8 rounded-full border-4 ${colors.dot} flex items-center justify-center shadow-md z-10`}
                      style={{ boxShadow: `0 0 0 4px white, 0 0 0 6px rgba(0,0,0,0.06)` }}
                    >
                      {getIcon(item.action)}
                    </div>

                    {/* Step index badge (top-right of dot) */}
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center z-20"
                      style={{ fontSize: 9, fontWeight: 700, lineHeight: 1 }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 mt-1 mb-0 bg-gradient-to-b ${colors.line} to-gray-200`}
                      style={{ minHeight: 32 }}
                    />
                  )}
                </div>

                {/* Right: content card */}
                <div className={`pb-8 ${isLast ? "pb-2" : ""} flex-1`}>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow">

                    {/* Action badge + date row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${colors.badge}`}
                      >
                        {item.action}
                      </span>
                      
                      <span className="text-sm text-gray-600">
                        {formatDate(item.created_at || item.action_date)}
                      </span>
                    </div>

                    {item.action === "FORWARDED" && (
                        <p className="text-sm text-gray-800">
                          {item.from_team_name} ➜ {item.to_team_name}
                        </p>
                      )}

                    {/* Remarks */}
                    {item.remarks && (
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {item.remarks}
                      </p>
                    )}

                  </div>
                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

export default TicketFlow;