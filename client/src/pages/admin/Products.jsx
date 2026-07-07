import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import api from "../../services/api";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await api.get("/products", { params });
      setProducts(data.data);
      setPageInfo({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      loadProducts(pageInfo.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, SKU..."
            className="w-full rounded-lg border border-primary-100 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-primary-100 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-primary-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary-100 bg-primary-50/50 text-ink-700">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-primary-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-900">{p.name}</td>
                  <td className="px-4 py-3 text-ink-500">{p.sku}</td>
                  <td className="px-4 py-3 text-ink-500">{p.category?.name}</td>
                  <td className="px-4 py-3">₹{p.sellingPrice}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.stockStatus === "out_of_stock"
                          ? "text-red-600 font-semibold"
                          : p.stockStatus === "low_stock"
                          ? "text-accent-600 font-semibold"
                          : "text-ink-700"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.status === "active" ? "bg-primary-100 text-primary-700" : "bg-ink-900/10 text-ink-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/products/${p._id}/edit`} className="text-primary-600 hover:text-primary-800">
                        <FiEdit2 />
                      </Link>
                      <button onClick={() => handleDelete(p._id, p.name)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ink-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={pageInfo.page} pages={pageInfo.pages} onChange={loadProducts} />
    </div>
  );
};

export default Products;
