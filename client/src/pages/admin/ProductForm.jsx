import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import Loader from "../../components/Loader";

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/products/${id}`)
        .then((res) => {
          const p = res.data.data;
          reset({
            ...p,
            category: p.category?._id,
          });
        })
        .catch(() => toast.error("Product not found"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (formData) => {
    setSaving(true);
    const payload = {
      ...formData,
      mrp: Number(formData.mrp),
      sellingPrice: Number(formData.sellingPrice),
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold || 10),
      discountPercent: formData.mrp > 0 ? Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 100) : 0,
      featured: Boolean(formData.featured),
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 font-display text-2xl font-bold text-ink-900">{isEdit ? "Edit Product" : "Add Product"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl2 border border-primary-100 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">Product Name *</label>
            <input {...register("name", { required: "Name is required" })} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">SKU *</label>
            <input {...register("sku", { required: "SKU is required" })} disabled={isEdit} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm disabled:bg-primary-50/50" />
            {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Barcode</label>
            <input {...register("barcode")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Category *</label>
            <select {...register("category", { required: "Category is required" })} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Brand</label>
            <input {...register("brand")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">Image URL</label>
            <input {...register("image")} placeholder="https://..." className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">Description</label>
            <textarea {...register("description")} rows={3} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">MRP (₹) *</label>
            <input type="number" step="0.01" {...register("mrp", { required: "MRP is required", min: 0 })} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Selling Price (₹) *</label>
            <input type="number" step="0.01" {...register("sellingPrice", { required: "Selling price is required", min: 0 })} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Stock *</label>
            <input type="number" {...register("stock", { required: "Stock is required", min: 0 })} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Low Stock Threshold</label>
            <input type="number" {...register("lowStockThreshold")} defaultValue={10} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Unit</label>
            <select {...register("unit")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm">
              <option value="pc">pc</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="ltr">ltr</option>
              <option value="pack">pack</option>
              <option value="dozen">dozen</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Status</label>
            <select {...register("status")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" {...register("featured")} />
            Mark as featured product
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} className="rounded-lg border border-primary-100 px-5 py-2.5 text-sm font-semibold text-ink-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
