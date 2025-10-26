import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, router, loading, error } = useAppContext();

  // Show loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col items-center pt-14">
        <p className="text-2xl font-medium text-left w-full">
          Popular products
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2 animate-pulse">
              <div className="bg-gray-200 rounded-lg w-full h-52"></div>
              <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
              <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
              <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="flex flex-col items-center pt-14">
        <p className="text-2xl font-medium text-left w-full">
          Popular products
        </p>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-500">Failed to load products: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center pt-14">
        <p className="text-2xl font-medium text-left w-full">
          Popular products
        </p>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-gray-500">No products available</p>
        </div>
      </div>
    );
  }

  // Show only first 10 products on home page
  const displayProducts = products.slice(0, 10);

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
        {displayProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {products.length > 10 && (
        <button
          onClick={() => {
            router.push("/all-products");
          }}
          className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
        >
          See more ({products.length - 10} more products)
        </button>
      )}
    </div>
  );
};

export default HomeProducts;
