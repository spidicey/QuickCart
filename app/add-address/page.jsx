"use client";
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchProvinces, fetchDistricts, fetchWards } from "@/lib/ghn";

const AddAddress = () => {
  const { apiUrl, userData } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editAddressId = searchParams.get("edit");

  const [address, setAddress] = useState({
    consignee_name: "",
    consignee_phone: "",
    province: "",
    province_id: "",
    district: "",
    district_id: "",
    ward: "",
    ward_id: "",
    street: "",
    house_num: "",
    is_default: false,
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      const data = await fetchProvinces();
      setProvinces(data);
      setIsLoadingProvinces(false);
    };
    loadProvinces();
  }, []);

  // Fetch address data when in edit mode
  useEffect(() => {
    const loadAddressForEdit = async () => {
      if (!editAddressId) return;

      setIsLoadingAddress(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(`${apiUrl}/addresses/${editAddressId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          //throw new Error("Failed to fetch address");
        }

        const data = await response.json();

        // Set address data
        setAddress({
          consignee_name: data.consignee_name || "",
          consignee_phone: data.consignee_phone || "",
          province: data.province || "",
          province_id: data.province_id || "",
          district: data.district || "",
          district_id: data.district_id || "",
          ward: data.ward || "",
          ward_id: data.ward_id || "",
          street: data.street || "",
          house_num: data.house_num || "",
          is_default: data.is_default || false,
        });

        // Load districts and wards for the existing address
        if (data.province_id) {
          const districtsData = await fetchDistricts(data.province_id);
          setDistricts(districtsData);
        }
        if (data.district_id) {
          const wardsData = await fetchWards(data.district_id);
          setWards(wardsData);
        }
      } catch (error) {
        console.error("Error loading address:", error);
        alert("Không thể tải thông tin địa chỉ");
      } finally {
        setIsLoadingAddress(false);
      }
    };

    loadAddressForEdit();
  }, [editAddressId, apiUrl]);

  // Handle province change
  const handleProvinceChange = async (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const provinceId = e.target.value;
    const provinceName = selectedOption.text;

    setAddress({
      ...address,
      province: provinceName,
      province_id: provinceId,
      district: "",
      district_id: "",
      ward: "",
      ward_id: "",
    });
    setDistricts([]);
    setWards([]);

    if (provinceId) {
      setIsLoadingDistricts(true);
      const data = await fetchDistricts(provinceId);
      setDistricts(data);
      setIsLoadingDistricts(false);
    }
  };

  // Handle district change
  const handleDistrictChange = async (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const districtId = e.target.value;
    const districtName = selectedOption.text;

    setAddress({
      ...address,
      district: districtName,
      district_id: districtId,
      ward: "",
      ward_id: "",
    });
    setWards([]);

    if (districtId) {
      setIsLoadingWards(true);
      const data = await fetchWards(districtId);
      setWards(data);
      setIsLoadingWards(false);
    }
  };

  // Handle ward change
  const handleWardChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const wardId = e.target.value;
    const wardName = selectedOption.text;

    setAddress({
      ...address,
      ward: wardName,
      ward_id: wardId,
    });
  };

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
      !address.province_id ||
      !address.district_id ||
      !address.ward_id ||
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

      const url = editAddressId
        ? `${apiUrl}/addresses/${editAddressId}`
        : `${apiUrl}/addresses`;

      const method = editAddressId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });

      const result = await response.json();

      if (!response.ok) {
        //throw new Error(result.message || "Không thể lưu địa chỉ");
      }

      alert(
        editAddressId
          ? "Cập nhật địa chỉ thành công!"
          : "Thêm địa chỉ thành công!"
      );
      router.back();
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      alert(
        error.message || "Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editAddressId) return;

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const response = await fetch(`${apiUrl}/addresses/${editAddressId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        //throw new Error(result.message || "Không thể xóa địa chỉ");
      }

      alert("Xóa địa chỉ thành công!");
      router.back();
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      alert(
        error.message || "Có lỗi xảy ra khi xóa địa chỉ. Vui lòng thử lại."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const selectClassName =
    "px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 bg-white";

  if (isLoadingAddress) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 py-16 flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Đang tải thông tin địa chỉ...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-500">
            {editAddressId ? "Chỉnh Sửa" : "Thêm"}{" "}
            <span className="font-semibold text-orange-600">Địa Chỉ</span> Giao
            Hàng
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

            {/* Province Select */}
            <select
              className={selectClassName}
              value={address.province_id}
              onChange={handleProvinceChange}
              disabled={isLoadingProvinces}
              required
            >
              <option value="">
                {isLoadingProvinces
                  ? "Đang tải..."
                  : "-- Chọn Tỉnh/Thành phố --"}
              </option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>

            {/* District Select */}
            <select
              className={selectClassName}
              value={address.district_id}
              onChange={handleDistrictChange}
              disabled={!address.province_id || isLoadingDistricts}
              required
            >
              <option value="">
                {isLoadingDistricts
                  ? "Đang tải..."
                  : !address.province_id
                  ? "-- Chọn Tỉnh/Thành phố trước --"
                  : "-- Chọn Quận/Huyện --"}
              </option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>

            {/* Ward Select */}
            <select
              className={selectClassName}
              value={address.ward_id}
              onChange={handleWardChange}
              disabled={!address.district_id || isLoadingWards}
              required
            >
              <option value="">
                {isLoadingWards
                  ? "Đang tải..."
                  : !address.district_id
                  ? "-- Chọn Quận/Huyện trước --"
                  : "-- Chọn Phường/Xã --"}
              </option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>

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
              placeholder="Số nhà"
              onChange={(e) =>
                setAddress({ ...address, house_num: e.target.value })
              }
              value={address.house_num}
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

          <div className="flex gap-3 max-w-sm mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting
                ? "Đang lưu..."
                : editAddressId
                ? "Cập nhật"
                : "Lưu địa chỉ"}
            </button>

            {editAddressId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-6 bg-red-600 text-white py-3 hover:bg-red-700 uppercase transition ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="max-w-sm w-full mt-3 text-gray-600 py-2 hover:text-gray-800 transition"
          >
            Quay lại
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
