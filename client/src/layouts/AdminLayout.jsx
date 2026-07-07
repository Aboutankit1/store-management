import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiLogOut, FiExternalLink } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import { logout } from "../redux/slices/authSlice";

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-primary-100 bg-white px-6 py-4">
          <h1 className="font-display text-lg font-bold text-ink-900">Store Management</h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline">
              <FiExternalLink /> View storefront
            </Link>
            <span className="text-sm text-ink-500">Hi, {user?.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium text-red-600">
              <FiLogOut /> Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
