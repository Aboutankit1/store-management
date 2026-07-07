import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { fetchCart, updateCartItemAsync, removeCartItemAsync } from "../../redux/slices/cartSlice";

const DELIVERY_CHARGE = 40;
const FREE_DELIVERY_THRESHOLD = 499;

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, itemsTotal, status } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const deliveryCharge = itemsTotal >= FREE_DELIVERY_THRESHOLD || itemsTotal === 0 ? 0 : DELIVERY_CHARGE;
  const grandTotal = itemsTotal + deliveryCharge;

  if (status === "succeeded" && items.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-primary-200 py-20 text-center">
        <p className="mb-4 text-lg font-medium text-ink-700">Your cart is empty.</p>
        <Link to="/products" className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 font-display text-xl font-bold text-ink-900">Your Cart</h1>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product._id}
              className="flex items-center gap-4 rounded-xl2 border border-primary-100 bg-white p-4"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <span className="text-xl">🛒</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink-900">{item.product.name}</p>
                <p className="text-sm text-ink-500">₹{item.priceAtAdd} · {item.product.unit}</p>
              </div>
              <div className="flex items-center rounded-lg border border-primary-100">
                <button
                  onClick={() => dispatch(updateCartItemAsync({ productId: item.product._id, quantity: Math.max(1, item.quantity - 1) }))}
                  className="p-2 text-ink-700"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => dispatch(updateCartItemAsync({ productId: item.product._id, quantity: item.quantity + 1 }))}
                  className="p-2 text-ink-700"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <p className="w-16 text-right font-semibold text-ink-900">₹{item.priceAtAdd * item.quantity}</p>
              <button
                onClick={() => dispatch(removeCartItemAsync(item.product._id))}
                className="text-ink-500 hover:text-red-600"
                aria-label="Remove item"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-xl2 border border-primary-100 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink-700">
            <span>Items total</span>
            <span>₹{itemsTotal}</span>
          </div>
          <div className="flex justify-between text-ink-700">
            <span>Delivery charge</span>
            <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
          </div>
          {deliveryCharge > 0 && (
            <p className="text-xs text-accent-600">
              Add ₹{FREE_DELIVERY_THRESHOLD - itemsTotal} more for free delivery
            </p>
          )}
          <div className="mt-2 flex justify-between border-t border-primary-100 pt-2 font-display font-bold text-ink-900">
            <span>Grand total</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          className="mt-5 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
