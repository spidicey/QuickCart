import Navbar from "@/components/Navbar";
import Link from "next/link";
export default function PaymentSuccess() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-emerald-600 mb-4">
            Thanh toán thành công
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Đơn hàng của quý khách đã thanh toán thành công. MISA sẽ sớm liên hệ
            với quý khách sớm để bàn giao sản phẩm, dịch vụ.
          </p>

          {/* Button */}
          <Link
            href={"/orders"}
            prefetch={false}
            className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded transition-colors duration-200"
          >
            Đơn hàng của tôi
          </Link>
        </div>
      </div>
    </>
  );
}
