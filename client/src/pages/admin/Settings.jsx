import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useState } from "react";

const Settings = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then((res) => reset(res.data.data))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await api.put("/settings", {
        ...formData,
        deliveryCharge: Number(formData.deliveryCharge),
        freeDeliveryThreshold: Number(formData.freeDeliveryThreshold),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
      });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 font-display text-2xl font-bold text-ink-900">Store Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl2 border border-primary-100 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Store Name</label>
          <input {...register("storeName")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Logo URL</label>
          <input {...register("logo")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">GST Number</label>
          <input {...register("gstNumber")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Store Address</label>
          <textarea {...register("address")} rows={2} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Delivery Charge (₹)</label>
            <input type="number" {...register("deliveryCharge")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Free Delivery Above (₹)</label>
            <input type="number" {...register("freeDeliveryThreshold")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Minimum Order (₹)</label>
            <input type="number" {...register("minimumOrderAmount")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Business Hours</label>
            <input {...register("businessHours")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
};

export default Settings;
