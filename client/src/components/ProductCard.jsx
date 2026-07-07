import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiShoppingCart } from "react-icons/fi";
import toast from "react-hot-toast";
import { addToCartAsync } from "../redux/slices/cartSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const isOut = product.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (isOut) return;
    dispatch(addToCartAsync({ productId: product._id, quantity: 1 }));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group relative flex flex-col rounded-xl2 border border-primary-100 bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-popover"
    >
      {product.discountPercent > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">
          {product.discountPercent}% OFF
        </span>
      )}
      <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-primary-50">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl">🛒</span>
        )}
      </div>
      <h3 className="line-clamp-2 font-display text-sm font-semibold text-ink-900">{product.name}</h3>
      <p className="mt-0.5 text-xs text-ink-500">{product.unit}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-base font-bold text-primary-700">₹{product.sellingPrice}</span>
        {product.mrp > product.sellingPrice && (
          <span className="text-xs text-ink-500 line-through">₹{product.mrp}</span>
        )}
      </div>
      {isOut ? (
        <span className="mt-3 inline-block rounded-lg bg-ink-900/5 py-1.5 text-center text-xs font-semibold text-ink-500">
          Out of stock
        </span>
      ) : (
        <button
          onClick={handleAdd}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
        >
          <FiShoppingCart /> Add to cart
        </button>
      )}
    </Link>
  );
};

export default ProductCard;
