"use client";
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const AddAddress = () => {
  const { apiUrl, userData } = useAppContext();
  const router = useRouter();

  const [address, setAddress] = useState({
    consignee_name: "",
    consignee_phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    house_num: "",
    is_default: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!userData) {
      alert("Vui lòng đăng nhập để thêm địa chỉ");
      return;
    }

    // Validate required fields
    if (
      !address.consignee_name ||
      !address.consignee_phone ||
      !address.province ||
      !address.district ||
      !address.ward ||
      !address.street ||
      !address.house_num
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Vui lòng đăng nhập để thêm địa chỉ");
        return;
      }

      const response = await fetch(`${apiUrl}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể thêm địa chỉ");
      }

      alert("Thêm địa chỉ thành công!");
      router.back(); // Quay lại trang trước (giỏ hàng/thanh toán)
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      alert(
        error.message || "Có lỗi xảy ra khi thêm địa chỉ. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-500">
            Thêm <span className="font-semibold text-orange-600">Địa Chỉ</span>{" "}
            Giao Hàng
          </p>
          <div className="space-y-3 max-w-sm mt-10">
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Tên người nhận"
              onChange={(e) =>
                setAddress({ ...address, consignee_name: e.target.value })
              }
              value={address.consignee_name}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="tel"
              placeholder="Số điện thoại"
              onChange={(e) =>
                setAddress({ ...address, consignee_phone: e.target.value })
              }
              value={address.consignee_phone}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Số nhà"
              onChange={(e) =>
                setAddress({ ...address, house_num: e.target.value })
              }
              value={address.house_num}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Tên đường"
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              value={address.street}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Phường/Xã"
              onChange={(e) => setAddress({ ...address, ward: e.target.value })}
              value={address.ward}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Quận/Huyện"
              onChange={(e) =>
                setAddress({ ...address, district: e.target.value })
              }
              value={address.district}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Tỉnh/Thành phố"
              onChange={(e) =>
                setAddress({ ...address, province: e.target.value })
              }
              value={address.province}
              required
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={address.is_default}
                onChange={(e) =>
                  setAddress({ ...address, is_default: e.target.checked })
                }
                className="w-4 h-4 text-orange-600"
              />
              <label htmlFor="is_default" className="text-sm text-gray-600">
                Đặt làm địa chỉ mặc định
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`max-w-sm w-full mt-6 bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu địa chỉ"}
          </button>
        </form>
        <Image
          className="md:mr-16 mt-16 md:mt-0"
          src={assets.my_location_image}
          alt="hình ảnh vị trí của tôi"
        />
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;
