"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const { apiUrl, router } = useAppContext();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    full_name: "",
    birthday: "",
    gender: "",
  });

  // Decode JWT token to get user ID
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      // Decode JWT token (base64 decode the payload)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.sub;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Fetch user data from API
  const fetchUserData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Bạn phải đăng nhập để xem hồ sơ");
      router.push("/login");
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      setError("Không thể lấy thông tin người dùng");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${apiUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        setUserData(data);
        // Format birthday for input field (YYYY-MM-DD)
        const birthday = data.customers?.birthday
          ? new Date(data.customers.birthday).toISOString().split("T")[0]
          : "";
        setFormData({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          full_name: data.full_name || "",
          birthday: birthday,
          gender: data.customers?.gender || "",
        });
      } else {
        setError(result.message || "Không thể tải thông tin người dùng");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Có lỗi xảy ra khi tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Update user data
  const updateUserData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Bạn phải đăng nhập để cập nhật hồ sơ");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Prepare update payload - only include fields that API accepts
      const updatePayload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday || null,
        gender: formData.gender || null,
      };

      const response = await fetch(`${apiUrl}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess("Cập nhật hồ sơ thành công!");
        setIsEditing(false);
        // Refresh user data
        await fetchUserData();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Không thể cập nhật thông tin");
      }
    } catch (err) {
      console.error("Error updating user data:", err);
      setError("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (userData) {
      const birthday = userData.customers?.birthday
        ? new Date(userData.customers.birthday).toISOString().split("T")[0]
        : "";
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        phone: userData.phone || "",
        full_name: userData.full_name || "",
        birthday: birthday,
        gender: userData.customers?.gender || "",
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
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
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Hồ Sơ Của Tôi
              </h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh Sửa
                </button>
              )}
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateUserData();
              }}
              className="space-y-6"
            >
              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={true}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                  title="Tên đăng nhập không thể thay đổi"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              {/* Birthday */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isEditing
                      ? "border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center gap-4 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Additional Info */}
          {userData && (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin bổ sung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Trạng thái tài khoản:</span>
                  <span
                    className={`ml-2 font-medium ${
                      userData.status ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {userData.status ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Ngày tạo:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(userData.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Vai trò:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {userData.user_role?.[0]?.roles?.role_name || "N/A"}
                  </span>
                </div>
                {userData.customers && (
                  <div>
                    <span className="text-gray-500">Mã khách hàng:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      #{userData.customers.customer_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

