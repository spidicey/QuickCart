import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { apiFetch, getAuthHeaders } from "@/lib/api";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    cartData,
    userData,
    apiUrl,
    fetchCart,
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [isDeletingAddress, setIsDeletingAddress] = useState(null);

  const paymentMethods = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng (COD)",
      icon: "💵",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      apiValue: "COD",
    },
    {
      id: "vnpay",
      name: "VNPay",
      icon: "/vnpay-logo.jpg",
      description: "Thanh toán qua VNPay",
      apiValue: "VNPAY_QR",
    },
    {
      id: "momo",
      name: "MoMo",
      icon: "/momo-logo.png",
      description: "Thanh toán qua ví điện tử MoMo",
      apiValue: "MOMO",
    },
    {
      id: "banking",
      name: "Chuyển khoản ngân hàng",
      icon: "🏦",
      description: "Chuyển khoản qua ngân hàng",
      apiValue: "BANK_TRANSFER",
    },
  ];

  const fetchUserAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await fetch(`${apiUrl}/addresses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      // Filter active addresses only - API now returns direct array
      const activeAddresses = Array.isArray(data)
        ? data.filter((addr) => addr.status === true)
        : [];
      setUserAddresses(activeAddresses);

      // Set default address if available
      const defaultAddress = activeAddresses.find(
        (addr) => addr.is_default === true
      );
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      alert("Không thể tải địa chỉ. Vui lòng thử lại.");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const handleEditAddress = (e, addressId) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    router.push(`/add-address?edit=${addressId}`);
  };

  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation();

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?");
    if (!confirmed) return;

    setIsDeletingAddress(addressId);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const response = await fetch(`${apiUrl}/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Không thể xóa địa chỉ");
      }

      // Remove from local state
      setUserAddresses((prev) =>
        prev.filter((addr) => addr.address_id !== addressId)
      );

      // Clear selected if it was the deleted one
      if (selectedAddress?.address_id === addressId) {
        setSelectedAddress(null);
      }

      alert("Xóa địa chỉ thành công!");
    } catch (error) {
      console.error("Error deleting address:", error);
      alert(error.message || "Có lỗi xảy ra khi xóa địa chỉ");
    } finally {
      setIsDeletingAddress(null);
    }
  };

  const handleApplyPromo = () => {
    setVoucherError("");
    if (!promoCode.trim()) {
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    const code = promoCode.trim().toLowerCase();
    const match = vouchers.find((v) => (v.title || "").toLowerCase() === code);
    if (!match) {
      setAppliedVoucher(null);
      setDiscountAmount(0);
      setVoucherError("Mã giảm giá không hợp lệ");
      return;
    }

    // Validate status and quantity
    if (match.status === false) {
      setVoucherError("Mã giảm giá đã hết hạn hoặc không khả dụng");
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    const subtotal = getCartAmount();
    if (match.min_order_value && subtotal < Number(match.min_order_value)) {
      setVoucherError(
        `Đơn tối thiểu ${currency}${Number(
          match.min_order_value
        ).toLocaleString()} để áp dụng mã`
      );
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    // Optional: validate time range if provided (format: "HH:mm:ss DD/MM/YYYY")
    const parseVnDate = (s) => {
      if (!s) return null;
      const [time, date] = s.split(" ");
      const [hh, mm, ss] = time.split(":").map(Number);
      const [dd, MM, yyyy] = date.split("/").map(Number);
      return new Date(yyyy, MM - 1, dd, hh, mm, ss);
    };
    const now = new Date();
    const start = parseVnDate(match.start_date);
    const end = parseVnDate(match.end_date);
    if ((start && now < start) || (end && now > end)) {
      setVoucherError("Mã giảm giá không nằm trong thời gian áp dụng");
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    // Calculate discount
    let discount = 0;
    if ((match.discount_type || "").toLowerCase() === "percent") {
      discount = Math.floor(
        (subtotal * Number(match.discount_value || 0)) / 100
      );
      if (match.max_discount) {
        discount = Math.min(discount, Number(match.max_discount));
      }
    } else if ((match.discount_type || "").toLowerCase() === "fixed") {
      discount = Number(match.discount_value || 0);
      if (match.max_discount) {
        discount = Math.min(discount, Number(match.max_discount));
      }
    }
    discount = Math.max(0, Math.min(discount, subtotal));

    setAppliedVoucher(match);
    setDiscountAmount(discount);
  };

  const applyVoucher = (voucher) => {
    setVoucherError("");
    if (!voucher) {
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    if (voucher.status === false) {
      setVoucherError("Mã giảm giá đã hết hạn hoặc không khả dụng");
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    const subtotalCurrent = getCartAmount();
    if (
      voucher.min_order_value &&
      subtotalCurrent < Number(voucher.min_order_value)
    ) {
      setVoucherError(
        `Đơn tối thiểu ${currency}${Number(
          voucher.min_order_value
        ).toLocaleString()} để áp dụng mã`
      );
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    const parseVnDate = (s) => {
      if (!s) return null;
      const [time, date] = s.split(" ");
      const [hh, mm, ss] = time.split(":").map(Number);
      const [dd, MM, yyyy] = date.split("/").map(Number);
      return new Date(yyyy, MM - 1, dd, hh, mm, ss);
    };
    const now = new Date();
    const start = parseVnDate(voucher.start_date);
    const end = parseVnDate(voucher.end_date);
    if ((start && now < start) || (end && now > end)) {
      setVoucherError("Mã giảm giá không nằm trong thời gian áp dụng");
      setAppliedVoucher(null);
      setDiscountAmount(0);
      return;
    }

    let discount = 0;
    if ((voucher.discount_type || "").toLowerCase() === "percent") {
      discount = Math.floor(
        (subtotalCurrent * Number(voucher.discount_value || 0)) / 100
      );
      if (voucher.max_discount) {
        discount = Math.min(discount, Number(voucher.max_discount));
      }
    } else if ((voucher.discount_type || "").toLowerCase() === "fixed") {
      discount = Number(voucher.discount_value || 0);
      if (voucher.max_discount) {
        discount = Math.min(discount, Number(voucher.max_discount));
      }
    }
    discount = Math.max(0, Math.min(discount, subtotalCurrent));

    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
    setPromoCode(voucher.title || "");
  };

  const handleSelectVoucher = (e) => {
    const value = e.target.value;
    setSelectedVoucherId(value);
    if (!value) {
      setAppliedVoucher(null);
      setDiscountAmount(0);
      setPromoCode("");
      setVoucherError("");
      return;
    }
    const v = vouchers.find((x) => String(x.voucher_id) === value);
    if (v) {
      applyVoucher(v);
    }
  };

  const createOrder = async () => {
    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (!selectedPayment) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!userData) {
      alert("Vui lòng đăng nhập để đặt hàng");
      return;
    }
    console.log(cartData);
    // Get cart details
    if (!cartData?.cart_detail || cartData.cart_detail.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items from cart details
      const items = cartData.cart_detail.map((item) => ({
        variantId: item.variant_id,
        quantity: item.quantity,
      }));

      // Calculate total price after discount
      const finalTotalPrice = totalAfterDiscount;

      // Prepare order data with the selected address ID
      const orderData = {
        addressId: selectedAddress.address_id,
        items: items,
        voucher_id: appliedVoucher ? appliedVoucher.voucher_id : null,
        totalPrice: finalTotalPrice,
      };

      const token = localStorage.getItem("access_token");
      if (!token) return;
      console.log("1123", orderData);
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tạo đơn hàng");
      }
      console.log(result);
      window.location.href = result.payment.qrUrl;
      await fetchCart();
      // router.push(`/order-success/${result.order.order_id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchUserAddresses();
    fetchCart();
  }, []);

  // Fetch vouchers list
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setIsLoadingVouchers(true);
        const token = localStorage.getItem("access_token");

        if (!token) {
          setVouchers([]);
          return;
        }

        const { data } = await apiFetch(`${apiUrl}/vouchers/active/list`, {
          headers: {
            ...getAuthHeaders(token),
            "Content-Type": "application/json",
          },
        });

        if (Array.isArray(data)) {
          setVouchers(data);
        } else {
          setVouchers([]);
        }
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        setVouchers([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    };
    loadVouchers();
  }, [apiUrl]);

  // Calculate subtotal from cart_detail by summing sub_price
  const subtotal =
    cartData?.cart_detail && Array.isArray(cartData.cart_detail)
      ? cartData.cart_detail.reduce(
          (sum, item) => sum + parseFloat(item.sub_price || 0),
          0
        )
      : getCartAmount();
  const shippingFee = 30000;
  const totalAfterDiscount = Math.max(
    0,
    subtotal + shippingFee - discountAmount
  );

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Tóm Tắt Đơn Hàng
      </h2>
      <hr className="border-gray-500/30 my-5" />

      {/* Cart Items Display */}
      {cartData && cartData.cart_detail && cartData.cart_detail.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-medium uppercase text-gray-600 mb-3">
            Sản Phẩm Trong Giỏ
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cartData.cart_detail.map((item) => {
              const variant = item.product_variants;
              const primaryImage =
                variant.variant_assets?.find((asset) => asset.is_primary)
                  ?.url || variant.variant_assets?.[0]?.url;

              return (
                <div
                  key={item.cart_detail_id}
                  className="flex gap-3 p-3 bg-white rounded border border-gray-200"
                >
                  {primaryImage && (
                    <Image
                      src={primaryImage}
                      alt={variant.sku}
                      width={60}
                      height={60}
                      className="object-cover rounded"
                      unoptimized
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      SKU: {variant.sku}
                    </p>
                    <div className="flex gap-2 text-xs text-gray-600 mt-1">
                      {variant.attribute?.màu && (
                        <span>Màu: {variant.attribute.màu}</span>
                      )}
                      {variant.size_id && <span>Size: {variant.size_id}</span>}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        SL: {item.quantity}
                      </span>
                      <span className="text-sm font-medium text-orange-600">
                        {currency}
                        {parseFloat(item.sub_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <hr className="border-gray-500/30 my-5" />
        </div>
      )}

      <div className="space-y-6">
        {/* Address Selection */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Chọn Địa Chỉ
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoadingAddresses}
            >
              <span>
                {isLoadingAddresses
                  ? "Đang tải địa chỉ..."
                  : selectedAddress
                  ? `${selectedAddress.consignee_name}, ${selectedAddress.house_num} ${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`
                  : "Chọn địa chỉ giao hàng"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 max-h-64 overflow-y-auto">
                {userAddresses.length === 0 ? (
                  <li className="px-4 py-2 text-gray-500 text-center">
                    Không có địa chỉ nào
                  </li>
                ) : (
                  userAddresses.map((address) => (
                    <li
                      key={address.address_id}
                      className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{address.consignee_name}</p>
                          <p className="text-xs text-gray-600">
                            {address.house_num} {address.street}, {address.ward},{" "}
                            {address.district}, {address.province}
                          </p>
                          <p className="text-xs text-gray-500">
                            {address.consignee_phone}
                          </p>
                          {address.is_default && (
                            <span className="text-xs text-orange-600 font-medium">
                              (Mặc định)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            type="button"
                            onClick={(e) => handleEditAddress(e, address.address_id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Chỉnh sửa"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(e, address.address_id)}
                            disabled={isDeletingAddress === address.address_id}
                            className={`p-1.5 text-red-600 hover:bg-red-50 rounded transition ${
                              isDeletingAddress === address.address_id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            title="Xóa"
                          >
                            {isDeletingAddress === address.address_id ? (
                              <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center border-t mt-1 pt-2 text-orange-600 font-medium"
                >
                  + Thêm Địa Chỉ Mới
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Available Vouchers */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Voucher khả dụng
          </label>
          <select
            className="w-full outline-none p-2.5 text-gray-600 border rounded bg-white"
            onChange={handleSelectVoucher}
            value={selectedVoucherId}
            disabled={isLoadingVouchers || vouchers.length === 0}
          >
            <option value="">-- Chọn voucher --</option>
            {vouchers.map((v) => (
              <option key={v.voucher_id} value={String(v.voucher_id)}>
                {v.title} {v.description ? `- ${v.description}` : ""}
              </option>
            ))}
          </select>
          {!isLoadingVouchers && vouchers.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Không có voucher khả dụng
            </p>
          )}
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-3">
            Phương Thức Thanh Toán
          </label>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                  selectedPayment === method.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPayment === method.id}
                  onChange={() => setSelectedPayment(method.id)}
                  className="w-4 h-4 text-orange-600 cursor-pointer"
                />
                <div className="flex items-center gap-2 flex-1">
                  {method.icon.startsWith("/") ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "block";
                        }}
                      />
                      <span className="text-2xl hidden">
                        {method.id === "vnpay" ? "💳" : "📱"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl">{method.icon}</span>
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm ${
                        selectedPayment === method.id
                          ? "text-orange-600"
                          : "text-gray-800"
                      }`}
                    >
                      {method.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Code */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Mã Giảm Giá
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border rounded"
            />
            <button
              onClick={handleApplyPromo}
              className="bg-orange-600 text-white px-6 py-2.5 hover:bg-orange-700 rounded whitespace-nowrap"
            >
              Áp Dụng
            </button>
          </div>
          {isLoadingVouchers && (
            <p className="text-xs text-gray-500 mt-1">
              Đang tải mã giảm giá...
            </p>
          )}
          {voucherError && (
            <p className="text-xs text-red-600 mt-1">{voucherError}</p>
          )}
          {appliedVoucher && discountAmount > 0 && (
            <p className="text-xs text-green-600 mt-1">
              Đã áp dụng: {appliedVoucher.title} - Giảm {currency}
              {discountAmount.toLocaleString()}
            </p>
          )}
        </div>

        <hr className="border-gray-500/30 my-5" />

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">
              Sản Phẩm ({getCartCount()})
            </p>
            <p className="text-gray-800">
              {currency}
              {subtotal.toLocaleString()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Phí Vận Chuyển</p>
            <p className="font-medium text-gray-800">
              {currency}
              {shippingFee.toLocaleString()}
            </p>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <p className="text-gray-600">Giảm giá</p>
              <p className="font-medium text-green-700">
                - {currency}
                {discountAmount.toLocaleString()}
              </p>
            </div>
          )}
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Tổng Cộng</p>
            <p>
              {currency}
              {totalAfterDiscount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={isProcessing}
        className={`w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700 rounded transition ${
          isProcessing ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isProcessing ? "Đang xử lý..." : "Đặt Hàng"}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Bằng cách đặt hàng, bạn đồng ý với{" "}
        <span className="text-orange-600 cursor-pointer hover:underline">
          Điều khoản & Điều kiện
        </span>
      </p>
    </div>
  );
};

export default OrderSummary;
