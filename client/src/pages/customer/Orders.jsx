import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/Loader";

const STATUS_STEPS = ["pending", "accepted", "packing", "dispatched", "delivered"];
const STATUS_LABELS = {
  pending: "Order Placed",
  accepted: "Accepted",
  packing: "Packing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const StatusTracker = ({ status }) => {
  if (["rejected", "cancelled"].includes(status)) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        Order {STATUS_LABELS[status]}
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((step, idx) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                idx <= currentIdx ? "bg-primary-600 text-white" : "bg-primary-100 text-ink-500"
              }`}
            >
              {idx + 1}
            </div>
            <span className="mt-1 w-16 text-center text-[11px] text-ink-500">{STATUS_LABELS[step]}</span>
          </div>
          {idx < STATUS_STEPS.length - 1 && (
            <div className={`mx-1 h-1 flex-1 rounded ${idx < currentIdx ? "bg-primary-600" : "bg-primary-100"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const OrderCard = ({ order }) => (
  <div className="rounded-xl2 border border-primary-100 bg-white p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="font-semibold text-ink-900">{order.orderNumber}</p>
        <p className="text-xs text-ink-500">{new Date(order.createdAt).toLocaleString()}</p>
      </div>
      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
        {STATUS_LABELS[order.status]}
      </span>
    </div>
    <StatusTracker status={order.status} />
    <div className="mt-4 space-y-1 text-sm text-ink-700">
      {order.items.map((item, i) => (
        <div key={i} className="flex justify-between">
          <span>
            {item.name} × {item.quantity}
          </span>
          <span>₹{item.price * item.quantity}</span>
        </div>
      ))}
    </div>
    <div className="mt-3 flex justify-between border-t border-primary-100 pt-3 font-semibold text-ink-900">
      <span>Total</span>
      <span>₹{order.grandTotal}</span>
    </div>
  </div>
);

const Orders = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [singleOrder, setSingleOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (id) {
      api
        .get(`/orders/${id}`)
        .then((res) => setSingleOrder(res.data.data))
        .finally(() => setLoading(false));
    } else {
      api
        .get("/orders/my")
        .then((res) => setOrders(res.data.data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Loader label="Loading orders" />;

  if (id) {
    if (!singleOrder) return <p className="py-16 text-center text-ink-500">Order not found.</p>;
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/orders" className="mb-4 inline-block text-sm text-primary-700 hover:underline">
          ← Back to all orders
        </Link>
        <OrderCard order={singleOrder} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-primary-200 py-20 text-center">
        <p className="mb-4 text-lg font-medium text-ink-700">You haven't placed any orders yet.</p>
        <Link to="/products" className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900">Your Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`}>
            <OrderCard order={order} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
