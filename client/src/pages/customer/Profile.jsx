import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus } from "react-icons/fi";
import api from "../../services/api";
import { fetchMe } from "../../redux/slices/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset } = useForm();
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false });

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) reset({ name: user.name, phone: user.phone });
  }, [user, reset]);

  const onSaveProfile = async (formData) => {
    try {
      await api.put("/auth/profile", formData);
      dispatch(fetchMe());
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await api.post("/auth/addresses", newAddress);
      dispatch(fetchMe());
      setAddingAddress(false);
      setNewAddress({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false });
      toast.success("Address added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await api.delete(`/auth/addresses/${addressId}`);
      dispatch(fetchMe());
      toast.success("Address removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove address");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl2 border border-primary-100 bg-white p-6">
        <h1 className="mb-4 font-display text-xl font-bold text-ink-900">My Profile</h1>
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Name</label>
            <input {...register("name")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Phone</label>
            <input {...register("phone")} className="w-full rounded-lg border border-primary-100 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
            <input value={user?.email || ""} disabled className="w-full rounded-lg border border-primary-100 bg-primary-50/50 px-3 py-2 text-sm text-ink-500" />
          </div>
          <button type="submit" className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
            Save changes
          </button>
        </form>
      </div>

      <div className="rounded-xl2 border border-primary-100 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Saved Addresses</h2>
          <button
            onClick={() => setAddingAddress(!addingAddress)}
            className="flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
          >
            <FiPlus /> Add address
          </button>
        </div>

        <div className="space-y-2">
          {user?.addresses?.map((addr) => (
            <div key={addr._id} className="flex items-start justify-between gap-3 rounded-lg border border-primary-100 p-3 text-sm">
              <span>
                <strong>{addr.label}</strong> {addr.isDefault && <em className="text-primary-600">(default)</em>}
                <br />
                {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ""}
                {addr.city}, {addr.state} {addr.pincode}
              </span>
              <button onClick={() => handleDeleteAddress(addr._id)} className="text-ink-500 hover:text-red-600">
                <FiTrash2 />
              </button>
            </div>
          ))}
          {(!user?.addresses || user.addresses.length === 0) && (
            <p className="text-sm text-ink-500">No saved addresses yet.</p>
          )}
        </div>

        {addingAddress && (
          <div className="mt-4 grid gap-3 rounded-lg border border-dashed border-primary-200 p-4 sm:grid-cols-2">
            <input placeholder="Label (e.g. Home)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2 text-sm" />
            <input placeholder="Pincode *" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2 text-sm" />
            <input placeholder="Address line 1 *" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2 text-sm sm:col-span-2" />
            <input placeholder="Address line 2" value={newAddress.line2} onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2 text-sm sm:col-span-2" />
            <input placeholder="City *" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2 text-sm" />
            <input placeholder="State *" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
              Set as default address
            </label>
            <button onClick={handleAddAddress} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white sm:col-span-2">
              Save address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
