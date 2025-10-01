"use client"
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { assets } from "@/assets/assets";
import Link from "next/link";

const Login = () => {
  const { router, apiUrl, setUserData } = useAppContext();
  
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/register
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const result = await response.json();
      if (result.access_token) {
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("token", result.access_token);
        
        setUserData(result.access_token);
        
        router.push("/");
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate phone number (basic validation)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/users/register`, {
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

      const result = await response.json();

      if (result.success || response.ok) {
        // Switch to login form after successful registration
        setIsLogin(true);
        setFormData({
          username: "",
          email: "",
          password: "",
          full_name: "",
          phone: "",
          confirmPassword: ""
        });
        setError("Registration successful! Please login with your credentials.");
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
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
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? "Please login to your account" 
              : "Sign up to get started"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`${error.includes('successful') ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'} border px-4 py-3 rounded text-sm`}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="your_username"
              />
            </div>

            {/* Registration-only fields */}
            {!isLogin && (
              <>
                {/* Full Name field */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required={!isLogin}
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required={!isLogin}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Phone field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
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
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                  Forgot password?
                </Link>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>

          {/* Toggle between Login/Register */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setFormData({ 
                    username: "", 
                    email: "", 
                    password: "", 
                    full_name: "", 
                    phone: "", 
                    confirmPassword: "" 
                  });
                }}
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </form>

        {/* Demo Credentials (remove in production) */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-xs text-gray-500 text-center">Demo Credentials</p>
          <p className="text-xs text-gray-600 mt-1">Username: demo</p>
          <p className="text-xs text-gray-600">Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;