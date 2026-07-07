import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { logout } from "../redux/slices/authSlice";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-primary-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-primary-700">
          <span className="rounded-lg bg-primary-600 px-2 py-0.5 text-white">🌿</span>
          FreshMart
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for atta, milk, chips..."
              className="w-full rounded-full border border-primary-100 bg-primary-50/50 py-2 pl-9 pr-4 text-sm focus:border-primary-400 focus:outline-none"
            />
          </div>
        </form>

        <div className="ml-auto hidden items-center gap-5 md:flex">
          <Link to="/products" className="text-sm font-medium text-ink-700 hover:text-primary-700">
            Shop
          </Link>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin/dashboard" className="text-sm font-medium text-ink-700 hover:text-primary-700">
                  Admin Panel
                </Link>
              )}
              <Link to="/orders" className="text-sm font-medium text-ink-700 hover:text-primary-700">
                Orders
              </Link>
              <Link to="/profile" className="flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-primary-700">
                <FiUser /> {user.name?.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-red-600">
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-full bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700">
              Login
            </Link>
          )}
          <Link to="/cart" className="relative rounded-full bg-primary-50 p-2 text-primary-700 hover:bg-primary-100">
            <FiShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <button className="ml-auto md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-primary-100 bg-white px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-primary-100 px-3 py-2 text-sm"
            />
          </form>
          <div className="flex flex-col gap-3 text-sm font-medium text-ink-700">
            <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
            {user ? (
              <>
                {user.role === "admin" && <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="text-left text-red-600">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
