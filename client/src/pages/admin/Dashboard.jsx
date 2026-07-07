import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FiBox, FiShoppingBag, FiUsers, FiDollarSign, FiAlertTriangle, FiXCircle } from "react-icons/fi";
import api from "../../services/api";
import Loader from "../../components/Loader";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TONE_CLASSES = {
  primary: "bg-primary-50 text-primary-600",
  accent: "bg-accent-400/20 text-accent-600",
};

const StatCard = ({ icon: Icon, label, value, tone = "primary" }) => (
  <div className="rounded-xl2 border border-primary-100 bg-white p-5">
    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
      <Icon size={18} />
    </div>
    <p className="text-2xl font-bold text-ink-900">{value}</p>
    <p className="text-sm text-ink-500">{label}</p>
  </div>
);

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  packing: "bg-purple-100 text-purple-700",
  dispatched: "bg-indigo-100 text-indigo-700",
  delivered: "bg-primary-100 text-primary-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard" />;
  if (!stats) return null;

  const chartData = {
    labels: stats.monthlySales.map((m) => `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`),
    datasets: [
      {
        label: "Revenue (₹)",
        data: stats.monthlySales.map((m) => m.total),
        borderColor: "#1F6E3D",
        backgroundColor: "rgba(31,110,61,0.15)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={FiBox} label="Total Products" value={stats.totalProducts} />
        <StatCard icon={FiShoppingBag} label="Total Orders" value={stats.totalOrders} />
        <StatCard icon={FiUsers} label="Total Customers" value={stats.totalCustomers} />
        <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
        <StatCard icon={FiShoppingBag} label="Pending Orders" value={stats.pendingOrders} tone="accent" />
        <StatCard icon={FiShoppingBag} label="Delivered Orders" value={stats.deliveredOrders} />
        <StatCard icon={FiAlertTriangle} label="Low Stock Products" value={stats.lowStockProducts} tone="accent" />
        <StatCard icon={FiXCircle} label="Out of Stock" value={stats.outOfStockProducts} tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl2 border border-primary-100 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Monthly Sales</h2>
          {stats.monthlySales.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-500">No delivered orders yet.</p>
          ) : (
            <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          )}
        </div>

        <div className="rounded-xl2 border border-primary-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-primary-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-ink-900">{order.orderNumber}</p>
                  <p className="text-xs text-ink-500">{order.customer?.name}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>
            ))}
            {stats.recentOrders.length === 0 && <p className="text-sm text-ink-500">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
