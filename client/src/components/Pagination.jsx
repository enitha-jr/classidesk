import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange, scrollToTop = true }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleChange = (page, event) => {
    if (event) {
      event.preventDefault();
      event.currentTarget?.blur();
    }

    onPageChange(page);

    if (scrollToTop && typeof window !== "undefined") {
      // Defer scrolling until after the page state updates and the list re-renders.
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        type="button"
        onClick={(e) => handleChange(currentPage - 1, e)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
        style={{
          background: "#f8fbff",
          border: "1.5px solid #dce8fd",
          color: currentPage === 1 ? "#c3d9fc" : "#2d5fad",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        <ChevronLeft size={14} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={(e) => handleChange(p, e)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all"
          style={
            p === currentPage
              ? {
                  background: "linear-gradient(135deg, #2d5fad, #1a3f7a)",
                  color: "#fff",
                  border: "1.5px solid #2d5fad",
                  boxShadow: "0 2px 6px rgba(45,95,173,0.25)",
                }
              : {
                  background: "#f8fbff",
                  border: "1.5px solid #dce8fd",
                  color: "#2d5fad",
                }
          }
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={(e) => handleChange(currentPage + 1, e)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
        style={{
          background: "#f8fbff",
          border: "1.5px solid #dce8fd",
          color: currentPage === totalPages ? "#c3d9fc" : "#2d5fad",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default Pagination;