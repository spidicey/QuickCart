"use client";
import { useAppContext } from "@/context/AppContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderSuccess = () => {
  const { apiUrl, currency } = useAppContext();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails(params.id);
    }
  }, [params.id]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải thông tin đơn hàng");
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang vận chuyển",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "text-yellow-600",
      processing: "text-blue-600",
      shipping: "text-purple-600",
      completed: "text-green-600",
      cancelled: "text-red-600",
    };
    return colorMap[status] || "text-gray-600";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Không thể tải đơn hàng
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Đơn hàng không tồn tại"}
            </p>
            <button
              onClick={() => router.push("/my-orders")}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
            >
              Xem đơn hàng của tôi
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-lg text-gray-600">
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm
              nhất có thể.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Thông tin đơn hàng
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Order ID and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Mã đơn hàng
                  </h3>
                  <p className="text-2xl font-bold text-orange-600">
                    #{order.order_id}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-medium text-gray-900">
                    Trạng thái
                  </h3>
                  <p
                    className={`text-lg font-semibold ${getStatusColor(
                      order.order_status
                    )}`}
                  >
                    {getStatusText(order.order_status)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Sản phẩm đã đặt
                </h3>
                <div className="space-y-3">
                  {order.order_items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <Image
                          src={
                            item.product_variants?.variant_assets?.[0]?.url ||
                            "/placeholder-product.jpg"
                          }
                          alt={
                            item.product_variants?.product?.product_name ||
                            "Product"
                          }
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product_variants?.product?.product_name ||
                            "Sản phẩm"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.quantity} |
                          {item.product_variants?.attribute?.size &&
                            ` Size: ${item.product_variants.attribute.size}`}
                          {item.product_variants?.attribute?.color &&
                            ` | Màu: ${item.product_variants.attribute.color}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {currency}
                          {(parseFloat(item.sub_price) || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Địa chỉ giao hàng
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {order.shipping_address?.full_name}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address?.phone}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address?.address},{" "}
                    {order.shipping_address?.ward},
                    {order.shipping_address?.district},{" "}
                    {order.shipping_address?.city}
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Tổng kết đơn hàng
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">
                      {currency}
                      {(parseFloat(order.total_price) || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {currency}
                      {(parseFloat(order.shipping_fee) || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế:</span>
                    <span className="font-medium">
                      {currency}
                      {(parseFloat(order.tax) || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-orange-600">
                        {currency}
                        {(
                          (parseFloat(order.total_price) || 0) +
                          (parseFloat(order.shipping_fee) || 0) +
                          (parseFloat(order.tax) || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Date */}
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Ngày đặt hàng: {formatDate(order.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/my-orders")}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition font-medium"
            >
              Xem đơn hàng của tôi
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccess;
