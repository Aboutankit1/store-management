import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";
import { CardSkeleton } from "../../components/Loader";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories?activeOnly=true"),
          api.get("/products?featured=true&limit=8"),
        ]);
        setCategories(catRes.data.data);
        setFeatured(prodRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-xl2 bg-gradient-to-br from-primary-700 to-primary-900 px-8 py-12 text-white md:px-14">
        <p className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
          DELIVERED IN UNDER 30 MINUTES
        </p>
        <h1 className="max-w-xl font-display text-3xl font-extrabold leading-tight md:text-4xl">
          Everyday groceries, straight from your neighborhood store.
        </h1>
        <p className="mt-3 max-w-lg text-primary-100">
          Fresh produce, dairy, snacks and household essentials — browse the full catalog and check out in seconds.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-600"
        >
          Start shopping <FiArrowRight />
        </Link>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-ink-900">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-24" />)
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl2 border border-primary-100 bg-white p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-popover"
                >
                  <span className="text-2xl">🧺</span>
                  <span className="text-sm font-medium text-ink-700">{cat.name}</span>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured products */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink-900">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-primary-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : featured.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>
    </div>
  );
};

export default Home;
