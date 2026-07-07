import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch } from "react-icons/fi";
import api from "../../services/api";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get("/admin/customers", { params });
      setCustomers(data.data);
      setPageInfo({ page: page, pages: Math.ceil(data.total / 10), total: data.total });
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/customers/${id}/status`);
      toast.success("Customer status updated");
      load(pageInfo.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-bold text-ink-900">Customers</h1>

      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full rounded-lg border border-primary-100 py-2 pl-9 pr-3 text-sm" />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-primary-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-primary-100 bg-primary-50/50 text-ink-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-primary-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-900">{c.name}</td>
                  <td className="px-4 py-3 text-ink-500">{c.email}</td>
                  <td className="px-4 py-3 text-ink-500">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.isActive ? "bg-primary-100 text-primary-700" : "bg-red-100 text-red-700"}`}>
                      {c.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggleStatus(c._id)} className="text-xs font-semibold text-primary-700 hover:underline">
                      {c.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={pageInfo.page} pages={pageInfo.pages} onChange={load} />
    </div>
  );
};

export default Customers;
