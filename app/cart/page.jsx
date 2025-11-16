"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";

const Cart = () => {
  const { products, router, userData, currency, showToast } = useAppContext();

  const [cartData, setCartData] = useState(null);
  const [cartDisplay, setCartDisplay] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3618";

  // Fetch cart from API
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setCartData(result);
    } catch (err) {
      console.error("Error fetching cart:", err);
      showToast("Không thể tải giỏ hàng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial cart fetch
  useEffect(() => {
    if (userData) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [userData]);

  // Transform cart data for display
  useEffect(() => {
    if (!cartData || !cartData.cart_detail) {
      setCartDisplay([]);
      return;
    }

    const displayItems = cartData.cart_detail.map((detail) => {
      const variant = detail.product_variants;

      // Find product name from products list
      const product = products.find((p) => p.productId === variant.product_id);
      const productName = product?.name || "Sản phẩm";

      // Extract size from attributes
      const sizeFromAttr =
        variant.attribute?.size ||
        variant.attribute?.["kích cỡ"] ||
        variant.attribute?.["size"];
      const size =
        sizeFromAttr || (variant.size_id ? `Size ${variant.size_id}` : null);

      // Get primary image
      const image =
        variant.variant_assets?.find((asset) => asset.is_primary)?.url ||
        variant.variant_assets?.[0]?.url ||
        null;

      return {
        cartDetailId: detail.cart_detail_id,
        productId: variant.product_id,
        variantId: variant.variant_id,
        sku: variant.sku,
        name: productName,
        image: image,
        price: parseFloat(variant.base_price),
        quantity: detail.quantity,
        subPrice: parseFloat(detail.sub_price),
        size: size,
        color: variant.attribute?.màu || variant.attribute?.color,
        barcode: variant.barcode,
        cartKey: `${variant.product_id}_${variant.sku}`,
      };
    });

    setCartDisplay(displayItems);
  }, [cartData, products]);

  // Add item to cart (increment quantity by 1)
  const handleIncrease = async (variantId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showToast("Vui lòng đăng nhập", "error");
        return;
      }

      const response = await fetch(`${apiUrl}/cart/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: variantId,
          quantity: 1,
        }),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok && result.cart_id) {
        await fetchCart();
        showToast("Đã cập nhật giỏ hàng", "success");
      } else {
        showToast(result.message || "Không thể thêm vào giỏ hàng", "error");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast("Có lỗi xảy ra", "error");
    }
  };

  // Update cart item quantity
  const handleUpdateQuantity = async (variantId, newQuantity) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showToast("Vui lòng đăng nhập", "error");
        return;
      }

      if (newQuantity <= 0) {
        await handleRemove(variantId);
        return;
      }

      const response = await fetch(`${apiUrl}/cart/update`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: variantId,
          quantity: newQuantity,
        }),
      });

      const result = await response.json();

      if (response.ok && result.cart_id) {
        await fetchCart();
      } else {
        showToast(result.message || "Không thể cập nhật giỏ hàng", "error");
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      showToast("Có lỗi xảy ra", "error");
    }
  };

  // Remove item from cart
  const handleRemove = async (variantId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showToast("Vui lòng đăng nhập", "error");
        return;
      }

      const response = await fetch(`${apiUrl}/cart/${variantId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchCart();
        showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
      } else {
        const result = await response.json();
        showToast(result.message || "Không thể xóa sản phẩm", "error");
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      showToast("Có lỗi xảy ra", "error");
    }
  };

  // Decrease quantity by 1
  const handleDecrease = async (variantId, currentQuantity) => {
    const newQuantity = currentQuantity - 1;
    if (newQuantity <= 0) {
      await handleRemove(variantId);
    } else {
      await handleUpdateQuantity(variantId, newQuantity);
    }
  };

  // Handle manual quantity input change
  const handleQuantityChange = async (variantId, value) => {
    const quantity = Math.max(0, Number(value) || 0);
    await handleUpdateQuantity(variantId, quantity);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!isLoading && !userData) {
  //     router.push("/login");
  //   }
  // }, [isLoading, userData, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="text-center">
            <p className="text-gray-500">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </>
    );
  }

  // if (!userData) {
  //   return null; // Will redirect to login
  // }

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
              {cartDisplay.length} Sản phẩm
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
                            onClick={() => handleRemove(item.variantId)}
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
                          {item.sku && (
                            <p className="text-xs text-gray-400 mt-1">
                              SKU: {item.sku}
                            </p>
                          )}
                          <button
                            className="hidden md:block text-xs text-orange-600 mt-1 hover:text-orange-700"
                            onClick={() => handleRemove(item.variantId)}
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
                            handleDecrease(item.variantId, item.quantity)
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
                            handleQuantityChange(item.variantId, e.target.value)
                          }
                          type="number"
                          value={item.quantity}
                          min="1"
                          className="w-12 border border-gray-300 text-center rounded py-1 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => handleIncrease(item.variantId)}
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
