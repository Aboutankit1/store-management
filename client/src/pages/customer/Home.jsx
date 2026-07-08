import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiTruck,
  FiShield,
  FiClock,
  FiTag,
  FiStar,
} from "react-icons/fi";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";
import { CardSkeleton } from "../../components/Loader";

// Maps common grocery category names to a fitting emoji; falls back to a basket.
const CATEGORY_ICONS = {
  fruit: "🍎",
  vegetable: "🥦",
  dairy: "🥛",
  bakery: "🍞",
  snack: "🍿",
  beverage: "🥤",
  household: "🧽",
  personal: "🧴",
  baby: "🍼",
  meat: "🍗",
  frozen: "🧊",
  grain: "🌾",
  spice: "🌶️",
  cleaning: "🧹",
  pet: "🐾",
};

const getCategoryIcon = (name = "") => {
  const key = Object.keys(CATEGORY_ICONS).find((k) => name.toLowerCase().includes(k));
  return key ? CATEGORY_ICONS[key] : "🧺";
};

const FEATURES = [
  { icon: FiClock, title: "30-Min Delivery", desc: "Fast doorstep delivery, every day" },
  { icon: FiStar, title: "Freshness Promise", desc: "Hand-picked produce, always fresh" },
  { icon: FiTag, title: "Best Prices", desc: "Everyday low prices, no surprises" },
  { icon: FiShield, title: "Secure Payments", desc: "Safe checkout, every single time" },
];

const TESTIMONIALS = [
  { name: "Priya S.", text: "Order aata hai bilkul time pe, aur sabziyan bhi fresh hoti hain. Ab main sirf yahin se lena pasand karti hoon." },
  { name: "Rahul M.", text: "App use karna super easy hai aur delivery charges bhi kaafi reasonable hain. Highly recommended!" },
  { name: "Ayesha K.", text: "Customer support bahut helpful hai — ek baar order mein galti hui thi, unhone turant fix kar diya." },
];

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
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-8 py-14 text-white md:px-14">
        {/* decorative background blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-primary-400/20 blur-3xl" />

        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
              <FiClock size={12} /> DELIVERED IN UNDER 30 MINUTES
            </p>
            <h1 className="max-w-xl font-display text-3xl font-extrabold leading-tight md:text-5xl">
              Everyday groceries, straight from your neighborhood store.
            </h1>
            <p className="mt-4 max-w-lg text-primary-100">
              Fresh produce, dairy, snacks and household essentials — browse the full catalog and check out in seconds.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-600"
              >
                Start shopping <FiArrowRight />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse categories
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-6 border-t border-white/10 pt-6 text-sm">
              <div>
                <p className="font-display text-2xl font-extrabold">500+</p>
                <p className="text-primary-100">Daily essentials</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold">4.8★</p>
                <p className="text-primary-100">Customer rating</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold">30 min</p>
                <p className="text-primary-100">Avg. delivery time</p>
              </div>
            </div>
          </div>

          <div className="hidden justify-items-center md:grid md:grid-cols-2 md:gap-4">
            {["🥦", "🍎", "🥛", "🍞"].map((emoji, i) => (
              <div
                key={i}
                className={`flex h-28 w-28 items-center justify-center rounded-xl2 bg-white/10 text-5xl backdrop-blur ${
                  i % 2 === 1 ? "translate-y-6" : ""
                }`}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl2 border border-primary-100 bg-white p-4 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">{title}</p>
              <p className="text-xs text-ink-500">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink-900">Shop by category</h2>
          <Link to="/products" className="text-sm font-semibold text-primary-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28" />)
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl2 border border-primary-100 bg-white p-5 text-center shadow-card transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-popover"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-3xl transition group-hover:bg-primary-100">
                    {getCategoryIcon(cat.name)}
                  </span>
                  <span className="text-sm font-medium text-ink-700">{cat.name}</span>
                </Link>
              ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="flex flex-col items-center justify-between gap-4 rounded-xl2 bg-accent-500/10 px-6 py-6 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-500 text-2xl text-white">
            🚚
          </span>
          <div>
            <p className="font-display text-base font-bold text-ink-900">Free delivery on orders above ₹499</p>
            <p className="text-sm text-ink-500">No codes needed — the discount applies automatically at checkout.</p>
          </div>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Shop now <FiArrowRight />
        </Link>
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
            : featured.length > 0
            ? featured.map((product) => <ProductCard key={product._id} product={product} />)
            : (
              <p className="col-span-full py-8 text-center text-sm text-ink-500">
                No featured products yet — check back soon.
              </p>
            )}
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-ink-900">What our customers say</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl2 border border-primary-100 bg-white p-5 shadow-card">
              <div className="mb-2 flex gap-0.5 text-accent-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-ink-700">"{t.text}"</p>
              <p className="mt-3 text-sm font-semibold text-ink-900">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="flex flex-col items-center gap-3 rounded-xl2 border border-primary-100 bg-primary-50 px-6 py-10 text-center">
        <FiTruck className="text-primary-600" size={28} />
        <h2 className="font-display text-xl font-bold text-ink-900">Ready to fill up your cart?</h2>
        <p className="max-w-md text-sm text-ink-500">
          Browse the full catalog of fresh groceries and everyday essentials — delivered fast, every time.
        </p>
        <Link
          to="/products"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Browse products <FiArrowRight />
        </Link>
      </section>
    </div>
  );
};

export default Home;