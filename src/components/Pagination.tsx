interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

function Pagination({
  currentPage,
  setCurrentPage,
}: PaginationProps) {
  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <span style={{ margin: "0 15px" }}>
        Page {currentPage}
      </span>

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;