"use client";
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const Login = () => {
  const { router, apiUrl, setUserData } = useAppContext();

  const [isLogin, setIsLogin] = useState(true); // Toggle between login/register
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
  const [otpCode, setOtpCode] = useState(""); // OTP code input
  const [otpLoading, setOtpLoading] = useState(false); // Loading state for OTP operations
  const [showResetPassword, setShowResetPassword] = useState(false); // Show reset password modal
  const [resetPasswordData, setResetPasswordData] = useState({
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetPasswordStep, setResetPasswordStep] = useState(1); // 1: email, 2: OTP, 3: new password

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      var data = await res.json();
      if (data.access_token && data.roles && data.roles.includes("CUSTOMER")) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token", data.access_token);

        setUserData(data.access_token);

        router.push("/");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError("");

    // Validate form data before sending OTP
    if (!formData.email) {
      setError("Vui lòng nhập địa chỉ email của bạn");
      setOtpLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      setOtpLoading(false);
      return;
    }

    // Validate phone number (basic validation)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Vui lòng nhập số điện thoại hợp lệ (10 chữ số)");
      setOtpLoading(false);
      return;
    }

    try {
      const { success } = await apiFetch(`${apiUrl}/auth/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          purpose: "register",
        }),
      });

      if (success) {
        setOtpSent(true);
        setError(
          "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã."
        );
      } else {
        setError("Gửi mã OTP thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(err.message || "Gửi mã OTP thất bại. Vui lòng thử lại.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTPAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!otpCode || otpCode.length !== 6) {
      setError("Vui lòng nhập mã OTP hợp lệ (6 chữ số)");
      setLoading(false);
      return;
    }

    try {
      // Verify OTP first
      const verifyResponse = await apiFetch(`${apiUrl}/auth/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          code: otpCode,
          purpose: "register",
        }),
      });

      console.log("Verify response:", verifyResponse);

      // If OTP verification successful, proceed with registration
      if (verifyResponse && verifyResponse.success) {
        try {
          // Use fetch directly to check HTTP status code
          const registerResponse = await fetch(`${apiUrl}/users/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: formData.username,
              email: formData.email,
              password: formData.password,
              full_name: formData.full_name,
              phone: formData.phone,
            }),
          });

          const registerData = await registerResponse.json();

          // Check if HTTP status is 200-299 (success) or if success field is true
          if (registerResponse.ok || registerData.success) {
            // Registration successful
            setIsLogin(true);
            setOtpSent(false);
            setOtpCode("");
            setFormData({
              username: "",
              email: "",
              password: "",
              full_name: "",
              phone: "",
              confirmPassword: "",
            });
            setError(
              "Đăng ký thành công! Vui lòng đăng nhập với thông tin đăng nhập của bạn."
            );
          } else {
            setError(
              registerData.message || "Đăng ký thất bại. Vui lòng thử lại."
            );
          }
        } catch (registerErr) {
          console.error("Registration error:", registerErr);
          // If it's a network error or other issue
          setError(
            registerErr.message || "Đăng ký thất bại. Vui lòng thử lại."
          );
        }
      } else {
        setError("Xác minh OTP thất bại. Vui lòng kiểm tra mã và thử lại.");
      }
    } catch (err) {
      console.error("Verify OTP/Registration error:", err);
      // Handle specific error messages from API
      // The API returns Vietnamese messages like "OTP đã được sử dụng"
      if (err.message) {
        setError(err.message);
      } else if (err.data && err.data.message) {
        setError(err.data.message);
      } else {
        setError("Mã OTP không hợp lệ hoặc đã được sử dụng. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    // If OTP hasn't been sent, send it first
    if (!otpSent) {
      await handleSendOTP(e);
      return;
    }
    // Otherwise, verify OTP and register
    await handleVerifyOTPAndRegister(e);
  };

  // Reset Password Functions
  const handleSendResetOTP = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError("");

    if (!resetPasswordData.email) {
      setError("Vui lòng nhập địa chỉ email của bạn");
      setOtpLoading(false);
      return;
    }

    try {
      const { success } = await apiFetch(`${apiUrl}/auth/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetPasswordData.email,
          purpose: "reset",
        }),
      });

      if (success) {
        setResetPasswordStep(2);
        setError("");
      } else {
        setError("Gửi mã OTP thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Send reset OTP error:", err);
      setError(err.message || "Gửi mã OTP thất bại. Vui lòng thử lại.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyResetOTP = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError("");

    if (!resetPasswordData.otpCode || resetPasswordData.otpCode.length !== 6) {
      setError("Vui lòng nhập mã OTP hợp lệ (6 chữ số)");
      setOtpLoading(false);
      return;
    }

    try {
      // First, we need to login or get a token to verify OTP
      // For reset password, we'll verify OTP and then proceed to password reset
      const verifyResponse = await apiFetch(`${apiUrl}/auth/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetPasswordData.email,
          code: resetPasswordData.otpCode,
          purpose: "reset",
        }),
      });

      if (verifyResponse && verifyResponse.success) {
        setResetPasswordStep(3);
        setError("");
      } else {
        setError("Mã OTP không hợp lệ. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Verify reset OTP error:", err);
      setError(err.message || "Mã OTP không hợp lệ. Vui lòng thử lại.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError("Mật khẩu không khớp");
      setLoading(false);
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    try {
      // Note: The reset-password endpoint requires authentication
      // The user needs to be logged in to reset their password
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError(
          "Vui lòng đăng nhập trước để đặt lại mật khẩu. Nếu bạn quên mật khẩu, vui lòng liên hệ hỗ trợ."
        );
        setLoading(false);
        return;
      }

      const { success } = await apiFetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: resetPasswordData.email,
          new_password: resetPasswordData.newPassword,
          confirm_new_password: resetPasswordData.confirmPassword,
        }),
      });

      if (success) {
        setError(
          "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới."
        );
        setShowResetPassword(false);
        setResetPasswordStep(1);
        setResetPasswordData({
          email: "",
          otpCode: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setError("");
        }, 5000);
      } else {
        setError("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src={assets.logo}
            alt="logo"
            className="w-32 cursor-pointer"
            onClick={() => router.push("/")}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin
              ? "Vui lòng đăng nhập vào tài khoản của bạn"
              : "Đăng ký để bắt đầu"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`${
              error.includes("thành công") || error.includes("successful")
                ? "bg-green-50 border-green-200 text-green-600"
                : "bg-red-50 border-red-200 text-red-600"
            } border px-4 py-3 rounded text-sm`}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            {/* Username field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="tên_đăng_nhập"
              />
            </div>

            {/* Registration-only fields */}
            {!isLogin && (
              <>
                {/* Full Name field */}
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required={!isLogin}
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Email field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Địa chỉ email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required={!isLogin}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Phone field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required={!isLogin}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0123456789"
                    maxLength="10"
                  />
                </div>
              </>
            )}

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password field (only for registration) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* OTP Code field (only for registration after OTP is sent) */}
            {!isLogin && otpSent && (
              <div>
                <label
                  htmlFor="otpCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nhập mã OTP
                </label>
                <input
                  id="otpCode"
                  name="otpCode"
                  type="text"
                  required={otpSent}
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtpCode(value);
                    setError("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nhập mã 6 chữ số đã được gửi đến {formData.email}
                </p>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpLoading}
                  className="mt-2 text-sm text-orange-600 hover:text-orange-500 disabled:opacity-50"
                >
                  {otpLoading ? "Đang gửi..." : "Gửi lại mã OTP"}
                </button>
              </div>
            )}
          </div>

          {/* Forgot Password (only for login) */}
          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(true);
                    setError("");
                    setResetPasswordStep(1);
                    setResetPasswordData({
                      email: "",
                      otpCode: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otpLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading || otpLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {otpLoading ? "Đang gửi mã OTP..." : "Đang xử lý..."}
              </span>
            ) : isLogin ? (
              "Đăng nhập"
            ) : otpSent ? (
              "Xác minh OTP & Tạo tài khoản"
            ) : (
              "Gửi mã OTP"
            )}
          </button>

          {/* Toggle between Login/Register */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setOtpSent(false);
                  setOtpCode("");
                  setFormData({
                    username: "",
                    email: "",
                    password: "",
                    full_name: "",
                    phone: "",
                    confirmPassword: "",
                  });
                }}
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                {isLogin ? "Đăng ký" : "Đăng nhập"}
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Đặt lại mật khẩu
              </h3>
              <button
                onClick={() => {
                  setShowResetPassword(false);
                  setResetPasswordStep(1);
                  setResetPasswordData({
                    email: "",
                    otpCode: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div
                className={`mb-4 p-3 rounded text-sm ${
                  error.includes("thành công") || error.includes("successful")
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-red-50 border-red-200 text-red-600"
                } border`}
              >
                {error}
              </div>
            )}

            {resetPasswordStep === 1 && (
              <form onSubmit={handleSendResetOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="resetEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Địa chỉ email
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetPasswordData.email}
                    onChange={(e) =>
                      setResetPasswordData({
                        ...resetPasswordData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="email@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {otpLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
              </form>
            )}

            {resetPasswordStep === 2 && (
              <form onSubmit={handleVerifyResetOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="resetOTP"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nhập mã OTP
                  </label>
                  <input
                    id="resetOTP"
                    type="text"
                    required
                    value={resetPasswordData.otpCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setResetPasswordData({
                        ...resetPasswordData,
                        otpCode: value,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Nhập mã 6 chữ số đã được gửi đến {resetPasswordData.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetPasswordStep(1)}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleSendResetOTP}
                    disabled={otpLoading}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  >
                    Gửi lại mã
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    Xác minh
                  </button>
                </div>
              </form>
            )}

            {resetPasswordStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mật khẩu mới
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={resetPasswordData.newPassword}
                    onChange={(e) =>
                      setResetPasswordData({
                        ...resetPasswordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmNewPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    required
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) =>
                      setResetPasswordData({
                        ...resetPasswordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetPasswordStep(2)}
                    className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
