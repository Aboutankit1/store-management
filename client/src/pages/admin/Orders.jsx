import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

const STATUS_FILTERS = ["all", "pending", "accepted", "packing", "dispatched", "delivered", "rejected", "cancelled"];

const NEXT_ACTIONS = {
  pending: [
    { label: "Accept", value: "accepted", tone: "primary" },
    { label: "Reject", value: "rejected", tone: "danger" },
  ],
  accepted: [
    { label: "Start Packing", value: "packing", tone: "primary" },
    { label: "Cancel", value: "cancelled", tone: "danger" },
  ],
  packing: [
    { label: "Dispatch", value: "dispatched", tone: "primary" },
    { label: "Cancel", value: "cancelled", tone: "danger" },
  ],
  dispatched: [{ label: "Mark Delivered", value: "delivered", tone: "primary" }],
  delivered: [],
  rejected: [],
  cancelled: [],
};

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  packing: "bg-purple-100 text-purple-700",
  dispatched: "bg-indigo-100 text-indigo-700",
  delivered: "bg-primary-100 text-primary-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });
  const [expandedOrder, setExpandedOrder] = useState(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status !== "all") params.status = status;
      if (search) params.search = search;
      const { data } = await api.get("/orders", { params });
      setOrders(data.data);
      setPageInfo({ page: data.page, pages: data.pages, total: data.total });
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      load(pageInfo.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-bold text-ink-900">Orders</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order number..."
          className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                status === s ? "bg-primary-600 text-white" : "border border-primary-100 text-ink-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="rounded-xl2 border border-primary-100 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-ink-900">{order.orderNumber}</p>
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {expandedOrder === order._id ? "Hide Items ▲" : "View Items ▼"}
                    </button>
                  </div>
                  <p className="text-xs text-ink-500">
                    {order.customer?.name} • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink-900">₹{order.grandTotal}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items Section */}
              {expandedOrder === order._id && (
                <div className="mt-3 border-t border-primary-100 pt-3">
                  <h4 className="mb-2 text-sm font-semibold text-ink-800">Order Items</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-primary-50 p-2">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-ink-800">{item.product?.name || item.name}</p>
                            <p className="text-xs text-ink-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-ink-900">₹{item.price * item.quantity}</p>
                          {item.variant && (
                            <p className="text-xs text-ink-500">
                              {Object.entries(item.variant)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.items?.length === 0 && (
                    <p className="text-sm text-ink-500">No items in this order</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {NEXT_ACTIONS[order.status]?.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {NEXT_ACTIONS[order.status].map((action) => (
                    <button
                      key={action.value}
                      onClick={() => handleStatusChange(order._id, action.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                        action.tone === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-primary-600 hover:bg-primary-700"
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <p className="py-10 text-center text-sm text-ink-500">No orders found.</p>}
        </div>
      )}
      <Pagination page={pageInfo.page} pages={pageInfo.pages} onChange={load} />
    </div>
  );
};

export default Orders;