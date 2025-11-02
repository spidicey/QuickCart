"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  MessageSquare,
  Store,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

export default function MyOrders() {
  const { apiUrl, currency, router } = useAppContext();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [repayingOrders, setRepayingOrders] = useState(new Set());

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Show alert and redirect to login
      alert("Bạn phải đăng nhập để xem đơn hàng");
      router.push("/login");
      return;
    }
  }, [router]);

  const tabs = [
    "Tất cả",
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đang xử lý",
    "Vận chuyển",
    "Hoàn thành",
  ];

  // Map API status to Vietnamese status
  const statusMap = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Vận chuyển",
    delivered: "Hoàn thành",
  };

  const statusLabelMap = {
    pending: "CHỜ XÁC NHẬN",
    confirmed: "ĐÃ XÁC NHẬN",
    processing: "ĐANG XỬ LÝ",
    shipping: "VẬN CHUYỂN",
    delivered: "HOÀN THÀNH",
  };

  const statusTextMap = {
    pending: "Đang chờ xác nhận",
    confirmed: "Đã xác nhận đơn hàng",
    processing: "Đang xử lý đơn hàng",
    shipping: "Đang vận chuyển",
    delivered: "Giao hàng thành công",
  };

  const statusColors = {
    pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
    confirmed: "text-blue-600 bg-blue-50 border-blue-200",
    processing: "text-indigo-600 bg-indigo-50 border-indigo-200",
    shipping: "text-purple-600 bg-purple-50 border-purple-200",
    delivered: "text-green-600 bg-green-50 border-green-200",
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("No access token found");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      // Handle new API response structure
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        // Fallback for old structure
        setOrders(result);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleRepay = async (orderId) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setRepayingOrders((prev) => new Set(prev).add(orderId));

    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể thực hiện thanh toán lại");
      }

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        alert("Thanh toán lại thành công!");
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error("Error repaying order:", error);
      alert(error.message || "Có lỗi xảy ra khi thanh toán lại");
    } finally {
      setRepayingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleBuyAgain = (order) => {
    // Get the first product from order details
    if (
      order.order_detail &&
      order.order_detail.length > 0 &&
      order.order_detail[0].product_variants?.products?.product_id
    ) {
      const productId =
        order.order_detail[0].product_variants.products.product_id;
      router.push(`/product/${productId}`);
    } else {
      alert("Không thể tìm thấy thông tin sản phẩm");
    }
  };

  const getButtonsByStatus = (status, orderId) => {
    const buttons = [];

    switch (status) {
      case "delivered":
        buttons.push("Đánh Giá", "Mua Lại");
        break;
      case "pending":
        buttons.push("Hủy Đơn Hàng");
        break;
      case "confirmed":
        buttons.push("Hủy Đơn Hàng");
        break;
      case "processing":
        buttons.push("Hủy Đơn Hàng");
        break;
      case "shipping":
        buttons.push("Xem Vận Đơn");
        break;
      default:
        // No buttons for default status
        break;
    }

    return buttons;
  };

  const formatDate = (dateString) => {
    try {
      // Handle custom format like "15:30:00 25/10/2025"
      if (
        dateString &&
        typeof dateString === "string" &&
        dateString.includes("/")
      ) {
        // Parse custom format: "HH:mm:ss DD/MM/YYYY"
        const [time, date] = dateString.split(" ");
        const [day, month, year] = date.split("/");
        const [hours, minutes] = time.split(":");

        const dateObj = new Date(year, month - 1, day, hours, minutes);
        return dateObj.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // Fallback to standard date parsing
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if parsing fails
    }
  };

  // Count orders by status for tab display
  const getOrderCountByTab = (tab) => {
    if (tab === "Tất cả") {
      return orders.length;
    }
    return orders.filter((order) => statusMap[order.order_status] === tab)
      .length;
  };

  const filteredOrders =
    activeTab === "Tất cả"
      ? orders
      : orders.filter((order) => statusMap[order.order_status] === activeTab);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Tabs */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const count = getOrderCountByTab(tab);
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "text-orange-600 border-b-2 border-orange-600 font-medium"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                    {count > 0 && (
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          activeTab === tab
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, tên sản phẩm..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="max-w-7xl mx-auto px-4 pb-8 space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">Chưa có đơn hàng</div>
              <div className="text-gray-500 text-sm">
                Bạn chưa có đơn hàng nào trong mục này
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.order_id);
              const hasMultipleItems =
                order.order_detail && order.order_detail.length > 1;
              const isRepaying = repayingOrders.has(order.order_id);

              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-orange-500 text-white">
                            Mall
                          </span>
                          <span className="font-medium text-gray-900">
                            Shop Official
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-gray-200 rounded flex items-center text-gray-600 hover:text-gray-800">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="text-xs">Chat</span>
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded flex items-center text-gray-600 hover:text-gray-800">
                            <Store className="w-4 h-4 mr-1" />
                            <span className="text-xs">Xem Shop</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            statusColors[order.order_status] ||
                            statusColors.pending
                          }`}
                        >
                          {statusLabelMap[order.order_status] ||
                            order.order_status}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Mã đơn hàng
                          </div>
                          <div className="font-medium text-gray-900">
                            #{order.order_id}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      {/* First Product Display */}
                      <div className="flex items-start space-x-4 flex-1">
                        {order.order_detail && order.order_detail[0] && (
                          <>
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {order.order_detail[0].product_variants
                                ?.variant_assets?.[0]?.url ? (
                                <Image
                                  src={
                                    order.order_detail[0].product_variants
                                      .variant_assets[0].url
                                  }
                                  alt={
                                    order.order_detail[0].product_variants
                                      .products?.product_name || "Product"
                                  }
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                                {order.order_detail[0].product_variants
                                  ?.products?.product_name || "Sản phẩm"}
                              </h3>
                              <p className="text-xs text-gray-500 mb-2">
                                {order.order_detail[0].product_variants
                                  ?.attribute?.["màu"] &&
                                  `Màu: ${order.order_detail[0].product_variants.attribute["màu"]}`}
                                {order.order_detail[0].product_variants
                                  ?.attribute?.size &&
                                  ` | Size: ${order.order_detail[0].product_variants.attribute.size}`}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>x{order.order_detail[0].quantity}</span>
                                {hasMultipleItems && (
                                  <span className="text-orange-600 font-medium">
                                    +{order.order_detail.length - 1} sản phẩm
                                    khác
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Order Status and Actions */}
                      <div className="text-right ml-4">
                        {/* <div className="text-sm text-gray-500 mb-1">
                          Trạng thái
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            statusColors[order.order_status]?.split(" ")[0] ||
                            "text-gray-600"
                          }`}
                        >
                          {statusTextMap[order.order_status] ||
                            order.order_status}
                        </div> */}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {order.addresses?.consignee_name}
                          </span>{" "}
                          - {order.addresses?.consignee_phone}
                          <br />
                          {order.addresses?.house_num} {order.addresses?.street}
                          , {order.addresses?.ward}, {order.addresses?.district}
                          , {order.addresses?.province}
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    {hasMultipleItems && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => toggleOrderExpansion(order.order_id)}
                          className="flex items-center justify-center space-x-2 text-orange-600 hover:text-orange-700 font-medium text-sm mx-auto"
                        >
                          <span>
                            {isExpanded ? "Thu gọn" : "Xem thêm"} sản phẩm
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Products */}
                  {isExpanded && hasMultipleItems && (
                    <div className="px-6 py-4 border-t bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Tất cả sản phẩm trong đơn hàng
                      </h4>
                      <div className="space-y-3">
                        {order.order_detail.slice(1).map((detail, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              {detail.product_variants?.variant_assets?.[0]
                                ?.url ? (
                                <Image
                                  src={
                                    detail.product_variants.variant_assets[0]
                                      .url
                                  }
                                  alt={
                                    detail.product_variants.products
                                      ?.product_name || "Product"
                                  }
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate">
                                {detail.product_variants?.products
                                  ?.product_name || "Sản phẩm"}
                              </h5>
                              <p className="text-xs text-gray-500">
                                {detail.product_variants?.attribute?.["màu"] &&
                                  `Màu: ${detail.product_variants.attribute["màu"]}`}
                                {detail.product_variants?.attribute?.size &&
                                  ` | Size: ${detail.product_variants.attribute.size}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                x{detail.quantity}
                              </div>
                              <div className="text-sm text-orange-600 font-medium">
                                {currency}
                                {parseFloat(
                                  detail.total_price
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        {getButtonsByStatus(
                          order.order_status,
                          order.order_id
                        ).map((button, index) => (
                          <button
                            key={button}
                            onClick={() => {
                              if (button === "Mua Lại") {
                                handleBuyAgain(order);
                              }
                              // Add handlers for other buttons if needed
                            }}
                            className={`px-4 py-2 rounded text-sm font-medium transition ${
                              index === 0 && order.order_status === "delivered"
                                ? "bg-orange-600 text-white hover:bg-orange-700"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {button}
                          </button>
                        ))}

                        {/* Repay Button for Pending Orders */}
                        {(order.order_status === "pending" ||
                          order.order_status === "confirmed" ||
                          order.order_status === "processing") &&
                          order.payment_status === "pending" && (
                            <button
                              onClick={() => handleRepay(order.order_id)}
                              disabled={isRepaying}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isRepaying ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  <span>Đang xử lý...</span>
                                </>
                              ) : (
                                <span>Thanh toán lại</span>
                              )}
                            </button>
                          )}
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600">Thành tiền:</div>
                        <div className="text-xl font-semibold text-orange-600">
                          {currency}
                          {(
                            (parseFloat(order.total_price) || 0) +
                            (parseFloat(order.shipping_fee) || 0)
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.payment_status === "paid"
                            ? "Đã thanh toán"
                            : order.payment_status === "pending"
                            ? "Chờ thanh toán"
                            : "Chưa thanh toán"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
