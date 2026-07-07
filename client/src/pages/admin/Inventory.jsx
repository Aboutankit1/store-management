import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowUp, FiArrowDown, FiAlertTriangle } from "react-icons/fi";
import api from "../../services/api";
import Loader from "../../components/Loader";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState({}); // productId -> quantity input

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 100, sort: "stock" } });
      setProducts(data.data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdjust = async (productId, type) => {
    const quantity = Number(adjusting[productId] || 0);
    if (!quantity || quantity <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    try {
      await api.patch(`/products/${productId}/stock`, { type, quantity });
      toast.success(`Stock ${type === "in" ? "added" : "removed"} successfully`);
      setAdjusting((prev) => ({ ...prev, [productId]: "" }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Stock update failed");
    }
  };

  const lowStock = products.filter((p) => p.stockStatus === "low_stock" || p.stockStatus === "out_of_stock");

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Inventory</h1>

      {lowStock.length > 0 && (
        <div className="rounded-xl2 border border-accent-400/40 bg-accent-400/10 p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold text-accent-700">
            <FiAlertTriangle /> {lowStock.length} product(s) need restocking
          </p>
          <p className="text-sm text-ink-700">
            {lowStock.map((p) => p.name).join(", ")}
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl2 border border-primary-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-primary-100 bg-primary-50/50 text-ink-700">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Current Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Adjust Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-primary-50 last:border-0">
                <td className="px-4 py-3 font-medium text-ink-900">{p.name}</td>
                <td className="px-4 py-3">
                  {p.stock} {p.unit}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.stockStatus === "out_of_stock"
                        ? "bg-red-100 text-red-700"
                        : p.stockStatus === "low_stock"
                        ? "bg-accent-400/20 text-accent-700"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {p.stockStatus.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={adjusting[p._id] || ""}
                      onChange={(e) => setAdjusting((prev) => ({ ...prev, [p._id]: e.target.value }))}
                      placeholder="Qty"
                      className="w-20 rounded-lg border border-primary-100 px-2 py-1.5 text-sm"
                    />
                    <button onClick={() => handleAdjust(p._id, "in")} className="flex items-center gap-1 rounded-lg bg-primary-600 px-2 py-1.5 text-xs font-semibold text-white">
                      <FiArrowUp /> In
                    </button>
                    <button onClick={() => handleAdjust(p._id, "out")} className="flex items-center gap-1 rounded-lg bg-red-500 px-2 py-1.5 text-xs font-semibold text-white">
                      <FiArrowDown /> Out
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
