const Loader = ({ label = "Loading" }) => (
  <div className="flex items-center justify-center py-16" role="status" aria-label={label}>
    <div className="h-10 w-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
  </div>
);

export const CardSkeleton = () => (
  <div className="rounded-xl2 border border-primary-100 p-4 space-y-3">
    <div className="skeleton h-32 w-full" />
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-4 w-1/2" />
  </div>
);

export default Loader;
