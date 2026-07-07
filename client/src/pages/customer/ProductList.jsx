import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";
import { CardSkeleton } from "../../components/Loader";
import Pagination from "../../components/Pagination";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "-createdAt";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    api.get("/categories?activeOnly=true").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (search) params.search = search;
        if (category) params.category = category;
        const { data } = await api.get("/products", { params });
        setProducts(data.data);
        setPageInfo({ page: data.page, pages: data.pages, total: data.total });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, category, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900">
          {search ? `Results for "${search}"` : "All products"}
          <span className="ml-2 text-sm font-normal text-ink-500">({pageInfo.total} items)</span>
        </h1>
        <div className="flex gap-3">
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-lg border border-primary-100 px-3 py-2 text-sm"
          >
            <option value="-createdAt">Newest</option>
            <option value="sellingPrice">Price: Low to High</option>
            <option value="-sellingPrice">Price: High to Low</option>
            <option value="-discountPercent">Highest Discount</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-primary-200 py-16 text-center text-ink-500">
          No products found. Try a different search or category.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <Pagination page={pageInfo.page} pages={pageInfo.pages} onChange={(p) => updateParam("page", p)} />
        </>
      )}
    </div>
  );
};

export default ProductList;
