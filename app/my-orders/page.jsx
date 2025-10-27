"use client";
import { useAppContext } from "@/context/AppContext";
import { useEffect } from "react";

const MyOrders = () => {
  const { router } = useAppContext();

  useEffect(() => {
    // Check authentication before redirecting
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Show alert and redirect to login
      alert("Bạn phải đăng nhập để xem đơn hàng");
      router.push("/login");
      return;
    }
    // Redirect to the new orders page
    router.push("/orders");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
};

export default MyOrders;
