"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";

const Cart = () => {
  const {
    products,
    router,
    cartItems,
    cartData,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartDetails,
    userData,
    currency,
  } = useAppContext();

  const [cartDisplay, setCartDisplay] = useState([]);

  useEffect(() => {
    if (userData && cartData) {
      const details = getCartDetails();
      console.log("Cart Details:", details);
      setCartDisplay(
        details.map((detail) => {
          const product = products.find(
            (p) => p.productId === detail.productId
          );
          return {
            ...detail,
            name: product?.name || "Product",
            cartKey: `${detail.productId}_${detail.sku}`,
          };
        })
      );
    } else {
      // Use local cart for guest users
      const localCart = Object.keys(cartItems)
        .filter((itemId) => cartItems[itemId] > 0)
        .map((itemId) => {
          // Handle both productId and productId_sku format
          const parts = itemId.split("_");
          const productId = parts[0];
          const variantSku = parts.length > 1 ? parts.slice(1).join("_") : null;

          const product = products.find((p) => p._id === productId);

          if (!product) return null;

          let variant = null;
          let image = product.variants?.[0]?.image || "";
          let price = product.offerPrice;
          let size = "";
          let color = "";

          if (variantSku && product.variants) {
            variant = product.variants.find((v) => v.sku === variantSku);
            if (variant) {
              image = variant.image || image;
              price = variant.offerPrice || variant.price;
              size = variant.size || "";
              color = variant.color || "";
            }
          }

          return {
            productId: product.productId,
            sku: variantSku,
            name: product.name,
            image: image,
            price: price,
            quantity: cartItems[itemId],
            subPrice: price * cartItems[itemId],
            size: size,
            color: color,
            cartKey: itemId,
          };
        })
        .filter((item) => item !== null);

      setCartDisplay(localCart);
    }
  }, [cartItems, cartData, products, userData]);

  const handleRemove = (cartKey, sku) => {
    const parts = cartKey.split("_");
    const productId = parts[0];
    updateCartQuantity(productId, 0, sku);
  };

  const handleDecrease = (cartKey, sku, currentQuantity) => {
    const parts = cartKey.split("_");
    const productId = parts[0];
    updateCartQuantity(productId, currentQuantity - 1, sku);
  };

  const handleIncrease = (cartKey, sku) => {
    const parts = cartKey.split("_");
    const productId = parts[0];
    addToCart(productId, sku);
  };

  const handleQuantityChange = (cartKey, sku, newQuantity) => {
    const parts = cartKey.split("_");
    const productId = parts[0];
    const quantity = Math.max(0, Number(newQuantity) || 0);
    updateCartQuantity(productId, quantity, sku);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };
  if (cartDisplay.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="text-center">
            <Image
              src={assets.cart_icon}
              alt="giỏ hàng trống"
              className="w-24 h-24 mx-auto opacity-20 mb-6"
              width={96}
              height={96}
            />
            <h2 className="text-2xl font-medium text-gray-700 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-500 mb-6">
              Thêm sản phẩm để bắt đầu mua sắm!
            </p>
            <button
              onClick={() => router.push("/all-products")}
              className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition"
            >
              Bắt đầu mua sắm
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Giỏ hàng{" "}
              <span className="font-medium text-orange-600">của bạn</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">
              {getCartCount()} Sản phẩm
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Chi tiết sản phẩm
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Giá
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Số lượng
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Tổng phụ
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartDisplay.map((item) => (
                  <tr key={item.cartKey} className="border-b border-gray-200">
                    <td className="py-4 md:px-4 px-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                            <Image
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover mix-blend-multiply"
                              width={64}
                              height={64}
                            />
                          </div>
                          <button
                            className="md:hidden text-xs text-orange-600 mt-1 hover:text-orange-700"
                            onClick={() =>
                              handleRemove(item.cartKey, item.variantId)
                            }
                          >
                            Xóa
                          </button>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-800 font-medium">
                            {item.name}
                          </p>
                          {item.size && (
                            <p className="text-xs text-gray-500 mt-1">
                              Kích cỡ: {item.size}
                            </p>
                          )}
                          {item.color && (
                            <p className="text-xs text-gray-500">
                              Màu sắc: {item.color}
                            </p>
                          )}
                          {item.variantId && (
                            <p className="text-xs text-gray-400 mt-1">
                              SKU: {item.variantId}
                            </p>
                          )}
                          <button
                            className="hidden md:block text-xs text-orange-600 mt-1 hover:text-orange-700"
                            onClick={() =>
                              handleRemove(item.cartKey, item.variantId)
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 md:px-4 px-1 text-gray-600">
                      {formatPrice(item.price)} {currency}
                    </td>
                    <td className="py-4 md:px-4 px-1">
                      <div className="flex items-center md:gap-2 gap-1">
                        <button
                          onClick={() =>
                            handleDecrease(
                              item.cartKey,
                              item.variantId,
                              item.quantity
                            )
                          }
                          className="hover:opacity-70 transition"
                          disabled={item.quantity <= 1}
                        >
                          <Image
                            src={assets.decrease_arrow}
                            alt="decrease"
                            className="w-4 h-4"
                            width={16}
                            height={16}
                          />
                        </button>
                        <input
                          onChange={(e) =>
                            handleQuantityChange(
                              item.cartKey,
                              item.variantId,
                              e.target.value
                            )
                          }
                          type="number"
                          value={item.quantity}
                          min="1"
                          className="w-12 border border-gray-300 text-center rounded py-1 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() =>
                            handleIncrease(item.cartKey, item.variantId)
                          }
                          className="hover:opacity-70 transition"
                        >
                          <Image
                            src={assets.increase_arrow}
                            alt="increase"
                            className="w-4 h-4"
                            width={16}
                            height={16}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 md:px-4 px-1 text-gray-600 font-medium">
                      {formatPrice(item.subPrice)} {currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => router.push("/all-products")}
            className="group flex items-center mt-6 gap-2 text-orange-600 hover:text-orange-700 transition"
          >
            <Image
              className="group-hover:-translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="quay lại"
              width={20}
              height={20}
            />
            Tiếp tục mua sắm
          </button>
        </div>

        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
