import { useNavigate } from "react-router-dom";

const DashHeader = ({
  title,
  subtitle,
  filter,
  setFilter,
  filters,
  showCreateButton = false,
  createPath = "",
}) => {

  const navigate = useNavigate();

  return (

    <div className="mb-8">

      {/* Title Row */}
      <div className="flex justify-between items-center mb-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {title}
          </h1>

          {subtitle && (
            <p className="text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {showCreateButton && (
          <button
            onClick={() => navigate(createPath)}
            className="bg-[#a9c6f8] text-[#1f2937] font-semibold px-6 py-2 rounded-lg hover:bg-[#93b6f5] transition"
          >
            + Create New Ticket
          </button>
        )}

      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-gray-300">

        {filters.map((status) => (

          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-medium capitalize transition ${
              filter === status
                ? "border-b-2 border-[#a9c6f8] text-[#1f2937]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {status === "active"
              ? "Active Tickets"
              : status === "all"
              ? "Active Tickets"
              : status}
          </button>

        ))}

      </div>

    </div>

  );

};

export default DashHeader;
