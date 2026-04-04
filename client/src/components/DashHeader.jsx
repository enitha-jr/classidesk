import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

const DashHeader = ({
  title,
  subtitle,
  filter,
  setFilter,
  filters,
  filterLabels = {},
  showCreateButton = false,
  createPath = "",
  search = "",
  setSearch = () => { },
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-5">

      {/* Title Row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
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
      
      {/* Tab Filters */}
      <div className="flex gap-2 border-b border-gray-300">
        {filters.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-medium capitalize transition ${filter === status
                ? "border-b-2 border-[#a9c6f8] text-[#1f2937]"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {filterLabels[status] ||
              (status === "active" ? "Active Tickets" : status === "all" ? "Active Tickets" : status)}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mt-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#93b6f5" }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full text-sm rounded-xl pl-9 pr-9 py-2.5 outline-none transition-all"
          style={{
            background: "#f8fbff",
            border: "1.5px solid #dce8fd",
            color: "#1a3f7a",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#93b6f5";
            e.target.style.boxShadow = "0 0 0 3px rgba(147,182,245,0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#dce8fd";
            e.target.style.boxShadow = "none";
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={13} style={{ color: "#93b6f5" }} />
          </button>
        )}
      </div>

    </div>
  );
};

export default DashHeader;