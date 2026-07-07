import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <h1 className="font-display text-5xl font-extrabold text-primary-700">404</h1>
    <p className="mt-3 text-lg text-ink-700">This page doesn't exist.</p>
    <Link to="/" className="mt-6 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white">
      Back to home
    </Link>
  </div>
);

export default NotFound;
