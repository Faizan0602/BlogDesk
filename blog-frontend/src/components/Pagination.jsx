function getPages(page, totalPages) {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let index = start; index <= end; index += 1) {
    pages.push(index);
  }

  return pages;
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPages(page, totalPages);

  return (
    <nav className="pagination" aria-label="Blog pagination">
      <button
        className="button button-secondary"
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>

      <div className="page-numbers">
        {pages[0] > 1 && (
          <>
            <button className="page-button" type="button" onClick={() => onPageChange(1)}>
              1
            </button>
            <span>...</span>
          </>
        )}

        {pages.map((pageNumber) => (
          <button
            className={pageNumber === page ? "page-button active" : "page-button"}
            type="button"
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            aria-current={pageNumber === page ? "page" : undefined}
          >
            {pageNumber}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            <span>...</span>
            <button className="page-button" type="button" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        className="button button-secondary"
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
