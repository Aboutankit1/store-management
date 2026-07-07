import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiTag,
  FiShoppingBag,
  FiUsers,
  FiArchive,
  FiSettings,
} from "react-icons/fi";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/categories", label: "Categories", icon: FiTag },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/admin/inventory", label: "Inventory", icon: FiArchive },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
  { to: "/admin/settings", label: "Settings", icon: FiSettings },
];

const Sidebar = () => (
  <aside className="hidden w-60 shrink-0 flex-col border-r border-primary-100 bg-white md:flex">
    <div className="flex items-center gap-2 px-5 py-5 font-display text-lg font-extrabold text-primary-700">
      <span className="rounded-lg bg-primary-600 px-2 py-0.5 text-white">🌿</span>
      Admin Panel
    </div>
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive ? "bg-primary-600 text-white" : "text-ink-700 hover:bg-primary-50"
            }`
          }
        >
          <Icon /> {label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
