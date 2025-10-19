import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, router, userData, showToast } = useAppContext();

  // Get first available image from variants, or use placeholder
  const productImage =
    product.variants?.[0]?.image ||
    assets.placeholder_image ||
    "/placeholder.png";

  // Create product display name from available data
  const displayName =
    product.name || `${product.brand || "Product"} - ${product.category || ""}`;
  // Get available colors and sizes
  const availableColors = [
    ...new Set(product.variants?.map((v) => v.color).filter(Boolean)),
  ];
  const availableSizes = [
    ...new Set(product.variants?.map((v) => v.size).filter(Boolean)),
  ];

  // Create description from variants info
  const variantInfo = [];
  if (availableColors.length > 0)
    variantInfo.push(`${availableColors.length} colors`);
  if (availableSizes.length > 0)
    variantInfo.push(`${availableSizes.length} sizes`);
  const description = variantInfo.join(" • ") || "Available now";

  return (
    <div
      onClick={() => {
        router.push("/product/" + product._id);
        scrollTo(0, 0);
      }}
      className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
    >
      <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
        <Image
          src={productImage}
          alt={displayName}
          className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
          width={800}
          height={800}
          onError={(e) => {
            e.target.src = "/placeholder.png"; // Fallback if image fails
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigation when clicking heart
            // Add wishlist logic here
          }}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition"
        >
          <Image className="h-3 w-3" src={assets.heart_icon} alt="heart_icon" />
        </button>
      </div>

      <p className="md:text-base font-medium pt-2 w-full truncate">
        {displayName}
      </p>
      <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
        {description}
      </p>

      {/* Rating section - you can make this dynamic later */}
      <div className="flex items-center gap-2">
        <p className="text-xs">{4.5}</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Image
              key={index}
              className="h-3 w-3"
              src={
                index < Math.floor(4.5)
                  ? assets.star_icon
                  : assets.star_dull_icon
              }
              alt="star_icon"
            />
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between w-full mt-1">
        <div className="flex flex-col">
          <p className="text-base font-medium">
            {currency}
            {product.offerPrice?.toLocaleString()}
          </p>
          {/* Show price range if variants have different prices */}
          {product.variants &&
            product.variants.length > 1 &&
            (() => {
              const prices = product.variants.map((v) => v.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              return minPrice !== maxPrice ? (
                <p className="text-xs text-gray-500">
                  {currency}
                  {minPrice.toLocaleString()} - {currency}
                  {maxPrice.toLocaleString()}
                </p>
              ) : null;
            })()}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigation
            if (!userData) {
              showToast("Bạn phải đăng nhập để mua hàng", "warning");
              return;
            }
            router.push("/product/" + product._id);
          }}
          className="max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition"
        >
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
