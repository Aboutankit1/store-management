import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const CustomerLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-primary-100 bg-white py-6 text-center text-sm text-ink-500">
        © {new Date().getFullYear()} FreshMart General Store. Fresh groceries, delivered fast.
      </footer>
    </div>
  );
};

export default CustomerLayout;
