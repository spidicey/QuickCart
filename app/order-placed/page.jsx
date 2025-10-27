"use client";
import { useAppContext } from "@/context/AppContext";
import { useEffect } from "react";

const OrderPlaced = () => {
  const { router } = useAppContext();

  useEffect(() => {
    // Redirect to my orders page after a short delay
    setTimeout(() => {
      router.push("/my-orders");
    }, 2000);
  }, [router]);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5">
      <div className="flex justify-center items-center relative">
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
      </div>
      <div className="text-center text-2xl font-semibold">
        Đang chuyển hướng...
      </div>
      <div className="text-center text-gray-600">
        Bạn sẽ được chuyển đến trang đơn hàng của tôi
      </div>
    </div>
  );
};

export default OrderPlaced;
