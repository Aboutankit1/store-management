import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiShoppingCart, FiMinus, FiPlus, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { addToCartAsync } from "../../redux/slices/cartSlice";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading product" />;
  if (!product) return <p className="py-16 text-center text-ink-500">Product not found.</p>;

  const isOut = product.stock <= 0;

  const handleAdd = () => {
    dispatch(addToCartAsync({ productId: product._id, quantity: qty }));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div>
      <Link to="/products" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-primary-700">
        <FiArrowLeft /> Back to products
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex h-80 items-center justify-center rounded-xl2 bg-primary-50">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full rounded-xl2 object-cover" />
          ) : (
            <span className="text-6xl">🛒</span>
          )}
        </div>
        <div>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {product.brand} • {product.unit}
          </p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-primary-700">₹{product.sellingPrice}</span>
            {product.mrp > product.sellingPrice && (
              <>
                <span className="text-lg text-ink-500 line-through">₹{product.mrp}</span>
                <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-2 text-sm">
            {isOut ? (
              <span className="font-semibold text-red-600">Out of stock</span>
            ) : product.stockStatus === "low_stock" ? (
              <span className="font-semibold text-accent-600">Only {product.stock} left</span>
            ) : (
              <span className="font-semibold text-primary-600">In stock</span>
            )}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-ink-700">{product.description}</p>

          {!isOut && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-primary-100">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 text-ink-700">
                  <FiMinus />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="p-2.5 text-ink-700"
                >
                  <FiPlus />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <FiShoppingCart /> Add to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
