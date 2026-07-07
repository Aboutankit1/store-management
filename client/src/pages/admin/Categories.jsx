import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import api from "../../services/api";
import Loader from "../../components/Loader";

const emptyForm = { name: "", image: "", isActive: true };

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async (search) => {
    setLoading(true);
    try {
      const { data } = await api.get("/categories", { params: search ? { search } : {} });
      setCategories(data.data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, image: cat.image, isActive: cat.isActive });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success("Category updated");
      } else {
        await api.post("/categories", form);
        toast.success("Category created");
      }
      setShowForm(false);
      load(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      load(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink-900">Categories</h1>
        <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="w-full rounded-lg border border-primary-100 py-2 pl-9 pr-3 text-sm" />
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mb-5 grid gap-3 rounded-xl2 border border-primary-100 bg-white p-5 sm:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Category name *"
            className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
          />
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="Image URL"
            className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-2 sm:col-span-3">
            <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              {editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex items-center gap-1 rounded-lg border border-primary-100 px-4 py-2 text-sm font-semibold text-ink-700">
              <FiX /> Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between rounded-xl2 border border-primary-100 bg-white p-4">
              <div>
                <p className="font-medium text-ink-900">{cat.name}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cat.isActive ? "bg-primary-100 text-primary-700" : "bg-ink-900/10 text-ink-500"}`}>
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openEdit(cat)} className="text-primary-600 hover:text-primary-800">
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDelete(cat._id, cat.name)} className="text-red-500 hover:text-red-700">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-ink-500">No categories found.</p>}
        </div>
      )}
    </div>
  );
};

export default Categories;
