import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../services/api";
import { fetchCart, clearCartLocal } from "../../redux/slices/cartSlice";
import { fetchMe } from "../../redux/slices/authSlice";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items, itemsTotal } = useSelector((state) => state.cart);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState({ line1: "", line2: "", city: "", state: "", pincode: "", phone: "" });
  const [useNew, setUseNew] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user?.addresses?.length) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def._id);
    } else {
      setUseNew(true);
    }
  }, [user]);

  const deliveryCharge = itemsTotal >= 499 || itemsTotal === 0 ? 0 : 40;
  const grandTotal = itemsTotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    let shippingAddress;

    if (useNew) {
      if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        toast.error("Please fill in all required address fields");
        return;
      }
      shippingAddress = newAddress;
    } else {
      const addr = user.addresses.find((a) => a._id === selectedAddressId);
      if (!addr) {
        toast.error("Please select a delivery address");
        return;
      }
      shippingAddress = addr;
    }

    setPlacing(true);
    try {
      const { data } = await api.post("/orders", { shippingAddress, paymentMethod });
      dispatch(clearCartLocal());
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <p className="py-16 text-center text-ink-500">Your cart is empty. Add products before checking out.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-xl2 border border-primary-100 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Delivery Address</h2>

          {user?.addresses?.length > 0 && (
            <div className="mb-4 space-y-2">
              {user.addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                    !useNew && selectedAddressId === addr._id ? "border-primary-500 bg-primary-50" : "border-primary-100"
                  }`}
                >
                  <input
                    type="radio"
                    checked={!useNew && selectedAddressId === addr._id}
                    onChange={() => {
                      setUseNew(false);
                      setSelectedAddressId(addr._id);
                    }}
                    className="mt-1"
                  />
                  <span>
                    <strong>{addr.label}</strong> — {addr.line1}, {addr.city}, {addr.state} {addr.pincode}
                  </span>
                </label>
              ))}
              <button onClick={() => setUseNew(true)} className="text-sm font-semibold text-primary-700 hover:underline">
                + Use a new address
              </button>
            </div>
          )}

          {useNew && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Address line 1 *"
                value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                className="rounded-lg border border-primary-100 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                placeholder="Address line 2"
                value={newAddress.line2}
                onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                className="rounded-lg border border-primary-100 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                placeholder="City *"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
              />
              <input
                placeholder="State *"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
              />
              <input
                placeholder="Pincode *"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
              />
              <input
                placeholder="Phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        <div className="rounded-xl2 border border-primary-100 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Payment Method</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
              Online Payment
            </label>
          </div>
        </div>
      </div>

      <div className="h-fit rounded-xl2 border border-primary-100 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Order Summary</h2>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.product._id} className="flex justify-between text-ink-700">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>₹{item.priceAtAdd * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-primary-100 pt-2 text-ink-700">
            <span>Delivery</span>
            <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-ink-900">
            <span>Grand total</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="mt-5 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {placing ? "Placing order..." : "Place order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
