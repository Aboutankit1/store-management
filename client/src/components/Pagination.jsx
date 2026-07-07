const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border border-primary-100 px-3 py-1.5 text-sm font-medium text-ink-700 disabled:opacity-40"
      >
        Prev
      </button>
      {pageNumbers.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`h-8 w-8 rounded-lg text-sm font-medium ${
            n === page ? "bg-primary-600 text-white" : "border border-primary-100 text-ink-700"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border border-primary-100 px-3 py-1.5 text-sm font-medium text-ink-700 disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
