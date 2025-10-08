import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    cartData,
    userData,
    apiUrl,
    getCartDetails,
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

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

      // Filter active addresses only
      const activeAddresses = data.filter((addr) => addr.status === true);
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

  const handleApplyPromo = () => {
    // Handle promo code application
    console.log("Applying promo code:", promoCode);
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

    // Get cart details
    const cartDetails = getCartDetails();

    if (!cartDetails || cartDetails.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items from cart details
      const items = cartDetails.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      // Get selected payment method value
      const paymentMethod = paymentMethods.find(
        (m) => m.id === selectedPayment
      );

      // Prepare order data with the selected address ID
      const orderData = {
        customerId: userData.customer_id || 1,
        addressId: selectedAddress.address_id,
        items: items,
        // paymentMethod: paymentMethod.apiValue,
        // voucherCode: promoCode || null,
        // note: ""
      };

      console.log("Creating order with:", orderData);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể tạo đơn hàng");
      }

      console.log("Order created successfully:", result);

      // Handle different payment methods
      if (selectedPayment === "vnpay" && result.qrUrl) {
        // Redirect to VNPay payment page
        window.location.href = result.qrUrl;
      } else if (selectedPayment === "momo" && result.payUrl) {
        // Redirect to MoMo payment page
        window.location.href = result.payUrl;
      } else {
        alert("Đặt hàng thành công!");
        router.push(`/order-success/${result.order.order_id}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchUserAddresses();
  }, []);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Tóm Tắt Đơn Hàng
      </h2>
      <hr className="border-gray-500/30 my-5" />
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
                      <div>
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
              {getCartAmount().toLocaleString()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Phí Vận Chuyển</p>
            <p className="font-medium text-gray-800">Miễn Phí</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Thuế (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {Math.floor(getCartAmount() * 0.02).toLocaleString()}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Tổng Cộng</p>
            <p>
              {currency}
              {(
                getCartAmount() + Math.floor(getCartAmount() * 0.02)
              ).toLocaleString()}
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
