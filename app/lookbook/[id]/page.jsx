"use client";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LookbookDetail() {
  const params = useParams();
  const {
    fetchLookbookById,
    currency,
    addToCart,
    router,
    userData,
    showToast,
  } = useAppContext();
  const [lookbook, setLookbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupedProducts, setGroupedProducts] = useState({});

  useEffect(() => {
    const loadLookbook = async () => {
      setLoading(true);
      const data = await fetchLookbookById(params.id);
      setLookbook(data);

      if (data && data.items) {
        const grouped = {};
        data.items.forEach((item) => {
          const productId = item.variant.productId;
          if (!grouped[productId]) {
            grouped[productId] = {
              product: item.variant.product,
              variants: [],
            };
          }
          grouped[productId].variants.push({
            ...item.variant,
            itemId: item.itemId,
            position: item.position,
          });
        });
        setGroupedProducts(grouped);
      }

      setLoading(false);
    };

    if (params.id) {
      loadLookbook();
    }
  }, [params.id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleAddToCart = async (productId, variantId) => {
    if (!userData) {
      showToast("Bạn phải đăng nhập để thêm vào giỏ hàng", "warning");
      return;
    }
    await addToCart(productId, variantId);
  };

  const handleViewProduct = (slug) => {
    router.push(`/product/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!lookbook) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Không tìm thấy lookbook</h1>
        <Link href="/" className="text-orange-600 hover:underline">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
          <Image
            src={lookbook.image}
            alt={lookbook.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-8 md:p-12 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {lookbook.title}
              </h1>
              <p className="text-lg md:text-xl mb-2">{lookbook.description}</p>
              <p className="text-sm opacity-90">
                {Object.keys(groupedProducts).length} sản phẩm •{" "}
                {lookbook.items?.length} phiên bản
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-orange-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/lookbooks" className="hover:text-orange-600">
            Lookbooks
          </Link>
          <span>/</span>
          <span className="text-gray-900">{lookbook.title}</span>
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Sản phẩm trong bộ sưu tập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(groupedProducts).map(({ product, variants }) => (
              <div
                key={product.productId}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative h-64 bg-gray-100">
                  {variants[0]?.image ? (
                    <Image
                      src={variants[0].image}
                      alt={product.product_name}
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.product_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Variants */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Có {variants.length} phiên bản
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variants.slice(0, 4).map((variant) => (
                        <div
                          key={variant.variantId}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {variant.size} - {variant.color}
                        </div>
                      ))}
                      {variants.length > 4 && (
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          +{variants.length - 4} khác
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-orange-600">
                      {formatPrice(variants[0].basePrice)} {currency}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleAddToCart(
                          product.productId,
                          variants[0].variantId
                        )
                      }
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-medium transition"
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      onClick={() => handleViewProduct(product.slug)}
                      className="flex-1 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 py-2.5 rounded-lg font-medium transition"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Variants Section */}
        <div className="bg-gray-50 rounded-xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Tất cả phiên bản
          </h2>
          <div className="space-y-4">
            {Object.values(groupedProducts).map(({ product, variants }) => (
              <div key={product.productId} className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">
                  {product.product_name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {variants.map((variant) => (
                    <div
                      key={variant.variantId}
                      className="flex items-center justify-between border rounded-lg p-3 hover:border-orange-600 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {variant.size} - {variant.color}
                        </p>
                        <p className="text-xs text-gray-500">
                          SKU: {variant.sku}
                        </p>
                        <p className="text-orange-600 font-semibold mt-1">
                          {formatPrice(variant.basePrice)} {currency}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleAddToCart(product.productId, variant.variantId)
                        }
                        disabled={variant.quantity === 0}
                        className="ml-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        {variant.quantity > 0 ? "Thêm" : "Hết hàng"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
