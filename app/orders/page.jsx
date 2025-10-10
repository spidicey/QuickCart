"use client";
import Navbar from "@/components/Navbar";
import { Search, MessageSquare, Store, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function MyOrders() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    "Tất cả",
    "Chờ xác nhận",
    "Vận chuyển",
    "Chờ giao hàng",
    "Hoàn thành",
    "Đã hủy",
    "Trả hàng/Hoàn tiền",
  ];

  // Map API status to Vietnamese status
  const statusMap = {
    pending: "Chờ xác nhận",
    processing: "Chờ xác nhận",
    shipping: "Vận chuyển",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };

  const statusLabelMap = {
    pending: "CHỜ XÁC NHẬN",
    processing: "CHỜ XÁC NHẬN",
    shipping: "VẬN CHUYỂN",
    completed: "HOÀN THÀNH",
    cancelled: "ĐÃ HỦY",
  };

  const statusTextMap = {
    pending: "Đang chờ xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang vận chuyển",
    completed: "Giao hàng thành công",
    cancelled: "Đơn hàng đã bị hủy",
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("No access token found");
      return;
    }
    try {
      const response = await fetch("http://localhost:3618/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const getButtonsByStatus = (status) => {
    switch (status) {
      case "completed":
        return ["Đánh Giá", "Liên Hệ Người Bán", "Mua Lại"];
      case "pending":
      case "processing":
        return ["Hủy Đơn Hàng", "Liên Hệ Người Bán"];
      case "shipping":
        return ["Liên Hệ Người Bán", "Xem Vận Đơn"];
      case "cancelled":
        return ["Mua Lại", "Liên Hệ Người Bán"];
      default:
        return ["Liên Hệ Người Bán"];
    }
  };

  const filteredOrders =
    activeTab === "Tất cả"
      ? orders
      : orders.filter((order) => statusMap[order.order_status] === activeTab);

  console.log(filteredOrders);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <Navbar />
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-red-500 border-b-2 border-red-500 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 pb-8 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">Chưa có đơn hàng</div>
            <div className="text-gray-500 text-sm">
              Bạn chưa có đơn hàng nào trong mục này
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Shop Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-red-500 text-white">
                    Mall
                  </span>
                  <span className="font-medium">Shop Official</span>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MessageSquare className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-gray-600 ml-1">Chat</span>
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded flex items-center">
                    <Store className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600 ml-1">Xem Shop</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`flex items-center ${
                      order.order_status === "cancelled"
                        ? "text-gray-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {order.order_status !== "cancelled" && (
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    <span className="text-sm">
                      {statusTextMap[order.order_status]}
                    </span>
                    <HelpCircle className="w-4 h-4 ml-1" />
                  </div>
                  <span
                    className={`font-medium text-sm ${
                      order.order_status === "cancelled"
                        ? "text-gray-500"
                        : "text-red-500"
                    }`}
                  >
                    {statusLabelMap[order.order_status]}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              {order.details &&
                order.details.map((detail) => (
                  <div
                    key={detail.order_detail_id}
                    className="px-6 py-4 border-b last:border-b-0"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded border overflow-hidden">
                        {detail.variant.assets &&
                        detail.variant.assets.length > 0 ? (
                          <img
                            src={
                              detail.variant.assets.find((a) => a.is_primary)
                                ?.url || detail.variant.assets[0].url
                            }
                            alt={detail.variant.product.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2">
                          {detail.variant.product.product_name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          Phân loại hàng: {detail.variant.attribute.color},{" "}
                          {detail.variant.attribute.size},{" "}
                          {detail.variant.attribute.gender}
                        </p>
                        <p className="text-sm">x{detail.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 line-through text-sm">
                          {parseFloat(detail.variant.base_price).toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </div>
                        <div className="text-red-500 font-medium">
                          {parseFloat(detail.total_price).toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Total and Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                {order.order_status === "completed" && (
                  <div className="text-sm text-gray-600 mb-3">
                    Đánh giá sản phẩm
                    <br />
                    <span className="text-red-500">
                      Đánh giá ngay và nhận 300 Xu
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    {getButtonsByStatus(order.order_status).map(
                      (button, index) => (
                        <button
                          key={button}
                          className={`px-6 py-2 rounded text-sm font-medium ${
                            index === 0 && order.order_status === "completed"
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {button}
                        </button>
                      )
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Thành tiền:</div>
                    <div className="text-2xl font-medium text-red-500">
                      {(
                        parseFloat(order.total_price) +
                        parseFloat(order.shipping_fee)
                      ).toLocaleString("vi-VN")}
                      đ
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info Footer */}
              <div className="px-6 py-3 bg-white border-t text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Mã đơn hàng: #{order.order_id}</span>
                  <span>
                    Địa chỉ: {order.address.house_num} {order.address.street},{" "}
                    {order.address.ward}, {order.address.district},{" "}
                    {order.address.province}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>
                    Người nhận: {order.address.consignee_name} -{" "}
                    {order.address.consignee_phone}
                  </span>
                  <span>
                    Trạng thái thanh toán:{" "}
                    {order.payment_status === "paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
