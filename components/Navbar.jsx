"use client";
import React, { useState, useRef, useEffect } from "react";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {
  const { isSeller, router, userData, setUserData, getCartCount } =
    useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    localStorage.removeItem("access_token"); // Remove both just in case
    setUserData(null); // Close dropdown
    console.log("Người dùng đã đăng xuất");
    window.location.reload();
  };

  const cartCount = getCartCount();

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
      />

      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Trang Chủ
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Cửa Hàng
        </Link>
      </div>

      <ul className="hidden md:flex items-center gap-4">
        {/* Search Icon */}
        <button className="hover:opacity-80 transition">
          <Image
            className="w-4 h-4"
            src={assets.search_icon}
            alt="biểu tượng tìm kiếm"
          />
        </button>

        {/* Cart Icon with Badge */}
        <button
          onClick={() => router.push("/cart")}
          className="relative hover:opacity-80 transition"
        >
          <Image
            className="w-5 h-5"
            src={assets.cart_icon}
            alt="biểu tượng giỏ hàng"
          />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        {/* User Account */}
        {userData ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:text-gray-900 transition"
            >
              <Image src={assets.user_icon} alt="biểu tượng người dùng" />
              <span className="max-w-[100px] truncate">
                {userData.name || "Tài Khoản"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <Link
                  href="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Hồ Sơ Của Tôi
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Đơn Hàng Của Tôi
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Danh Sách Yêu Thích
                </Link>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                >
                  Đăng Xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="biểu tượng người dùng" />
            Đăng Nhập
          </button>
        )}
      </ul>

      {/* Mobile Menu */}
      <div className="flex items-center md:hidden gap-3">
        {/* Cart for mobile */}
        <button
          onClick={() => router.push("/cart")}
          className="relative hover:opacity-80 transition"
        >
          <Image
            className="w-5 h-5"
            src={assets.cart_icon}
            alt="biểu tượng giỏ hàng"
          />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        {isSeller && userData && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-3 py-1 rounded-full hover:bg-gray-50 transition"
          >
            Người Bán
          </button>
        )}

        {userData ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:text-gray-900 transition"
            >
              <Image src={assets.user_icon} alt="biểu tượng người dùng" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData.email}
                  </p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Hồ Sơ Của Tôi
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Đơn Hàng Của Tôi
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Danh Sách Yêu Thích
                </Link>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                >
                  Đăng Xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 hover:text-gray-900 transition text-sm"
          >
            <Image src={assets.user_icon} alt="biểu tượng người dùng" />
            Đăng Nhập
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
