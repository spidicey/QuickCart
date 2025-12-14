"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import MobileFilterToggle from "@/components/MobileFilterToggle";
import { useAppContext } from "@/context/AppContext";

const SearchPage = () => {
  const {
    products,
    filteredProducts,
    setFilteredProducts,
    fetchFilteredProducts,
    loading,
  } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    keyword: "",
    brandIds: [],
    categoryIds: [],
    minPrice: "",
    maxPrice: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayProducts, setDisplayProducts] = useState([]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const keyword = searchParams.get("keyword") || searchParams.get("q") || "";
    const brandIdsParam = searchParams.getAll("brand_id");
    const categoryIdsParam = searchParams.getAll("category_id");
    const minPrice = searchParams.get("min_price") || "";
    const maxPrice = searchParams.get("max_price") || "";

    const initialFilters = {
      keyword,
      brandIds: brandIdsParam.map((id) => parseInt(id)),
      categoryIds: categoryIdsParam.map((id) => parseInt(id)),
      minPrice,
      maxPrice,
    };

    setFilters(initialFilters);

    // Fetch filtered products if there's a keyword or any filter
    if (
      keyword ||
      brandIdsParam.length > 0 ||
      categoryIdsParam.length > 0 ||
      minPrice ||
      maxPrice
    ) {
      fetchFilteredProducts(initialFilters);
    }
  }, []);

  // Update displayed products based on filtered products
  useEffect(() => {
    const hasActiveFilters =
      filters.keyword ||
      filters.brandIds.length > 0 ||
      filters.categoryIds.length > 0 ||
      filters.minPrice ||
      filters.maxPrice;

    if (hasActiveFilters) {
      setDisplayProducts(filteredProducts);
    } else {
      setDisplayProducts([]);
    }
  }, [filteredProducts, filters]);

  // Handle filter changes
  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);

    // Update URL with new filters
    const params = new URLSearchParams();
    if (newFilters.keyword) params.set("keyword", newFilters.keyword);
    if (newFilters.brandIds && newFilters.brandIds.length > 0) {
      newFilters.brandIds.forEach((id) => params.append("brand_id", id));
    }
    if (newFilters.categoryIds && newFilters.categoryIds.length > 0) {
      newFilters.categoryIds.forEach((id) => params.append("category_id", id));
    }
    if (newFilters.minPrice) params.set("min_price", newFilters.minPrice);
    if (newFilters.maxPrice) params.set("max_price", newFilters.maxPrice);

    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search", {
      scroll: false,
    });

    // Fetch filtered products
    const hasFilters =
      newFilters.keyword ||
      newFilters.brandIds.length > 0 ||
      newFilters.categoryIds.length > 0 ||
      newFilters.minPrice ||
      newFilters.maxPrice;

    if (hasFilters) {
      await fetchFilteredProducts(newFilters);
    } else {
      setFilteredProducts([]);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.brandIds.length > 0) count += filters.brandIds.length;
    if (filters.categoryIds.length > 0) count += filters.categoryIds.length;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  };

  return (
    <>
      <Navbar />
      <div className="flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 px-6 md:px-16 lg:px-8">
          <div className="flex flex-col items-start">
            <div className="flex justify-between items-center w-full pt-12 mb-2">
              <div className="flex flex-col items-start">
                <p className="text-2xl font-medium">
                  {filters.keyword
                    ? `Kết quả tìm kiếm: "${filters.keyword}"`
                    : "Tìm kiếm sản phẩm"}
                </p>
                <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1"></div>
              </div>
              {displayProducts.length > 0 && (
                <p className="text-sm text-gray-600">
                  {displayProducts.length} sản phẩm
                </p>
              )}
            </div>

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 mb-2">
                {filters.keyword && (
                  <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    Từ khóa: {filters.keyword}
                    <button
                      onClick={() =>
                        handleFilterChange({ ...filters, keyword: "" })
                      }
                      className="ml-2 hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.minPrice && (
                  <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    Giá từ: {parseInt(filters.minPrice).toLocaleString()}đ
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    Giá đến: {parseInt(filters.maxPrice).toLocaleString()}đ
                  </span>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="w-full py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            )}

            {/* Products Grid */}
            {!loading && displayProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 pb-14 w-full">
                {displayProducts.map((product, index) => (
                  <ProductCard key={product._id || index} product={product} />
                ))}
              </div>
            )}

            {/* Empty State - No Filters Applied */}
            {!loading &&
              displayProducts.length === 0 &&
              !filters.keyword &&
              filters.brandIds.length === 0 &&
              filters.categoryIds.length === 0 &&
              !filters.minPrice &&
              !filters.maxPrice && (
                <div className="w-full py-20 flex flex-col items-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg">
                    Nhập từ khóa để tìm kiếm
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Hoặc sử dụng bộ lọc để tìm sản phẩm
                  </p>
                </div>
              )}

            {/* Empty State - No Results Found */}
            {!loading &&
              displayProducts.length === 0 &&
              (filters.keyword ||
                filters.brandIds.length > 0 ||
                filters.categoryIds.length > 0 ||
                filters.minPrice ||
                filters.maxPrice) && (
                <div className="w-full py-20 flex flex-col items-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg">
                    Không tìm thấy sản phẩm phù hợp
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Thử điều chỉnh từ khóa hoặc bộ lọc của bạn
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <MobileFilterToggle
        onClick={() => setIsFilterOpen(true)}
        activeFilterCount={getActiveFilterCount()}
      />

      <Footer />
    </>
  );
};

export default SearchPage;
