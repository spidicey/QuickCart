"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "VND";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3618";
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lookbooks, setLookbooks] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "info",
  });

  // Fetch all lookbooks from API
  const fetchLookbooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await apiFetch(`${apiUrl}/lookbooks`);

      if (Array.isArray(data)) {
        const transformedLookbooks = data.map((lookbook) => ({
          _id: lookbook.lookbook_id.toString(),
          lookbookId: lookbook.lookbook_id,
          title: lookbook.title,
          slug: lookbook.slug,
          description: lookbook.description,
          image: lookbook.image,
          createdAt: lookbook.created_at,
          updatedAt: lookbook.updated_at,
          items:
            lookbook.items?.map((item) => ({
              itemId: item.item_id,
              position: item.position,
              note: item.note,
              variant: {
                variantId: item.variant.variant_id,
                productId: item.variant.product_id,
                sku: item.variant.sku,
                barcode: item.variant.barcode,
                costPrice: parseFloat(item.variant.cost_price),
                basePrice: parseFloat(item.variant.base_price),
                quantity: item.variant.quantity,
                status: item.variant.status,
                size: item.variant.attribute?.size,
                color: item.variant.attribute?.color,
                gender: item.variant.attribute?.gender,
                product: item.variant.product
                  ? {
                      productId: item.variant.product.product_id,
                      name: item.variant.product.product_name,
                      slug: item.variant.product.slug,
                      description: item.variant.product.description,
                      brandId: item.variant.product.brand_id,
                      categoryId: item.variant.product.category_id,
                      status: item.variant.product.status,
                    }
                  : null,
              },
            })) || [],
        }));

        setLookbooks(transformedLookbooks);
      } else {
        setError("Invalid lookbooks data format");
      }
    } catch (err) {
      console.error("Error fetching lookbooks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single lookbook by ID or slug
  const fetchLookbookById = async (identifier) => {
    try {
      const { data } = await apiFetch(`${apiUrl}/lookbooks/${identifier}`);

      if (data && data.lookbook_id) {
        return {
          _id: data.lookbook_id.toString(),
          lookbookId: data.lookbook_id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          image: data.image,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          items:
            data.items?.map((item) => ({
              itemId: item.item_id,
              position: item.position,
              note: item.note,
              variant: {
                variantId: item.variant.variant_id,
                productId: item.variant.product_id,
                sku: item.variant.sku,
                barcode: item.variant.barcode,
                costPrice: parseFloat(item.variant.cost_price),
                basePrice: parseFloat(item.variant.base_price),
                quantity: item.variant.quantity,
                status: item.variant.status,
                size: item.variant.attribute?.size,
                color: item.variant.attribute?.color,
                gender: item.variant.attribute?.gender,
                product: item.variant.product
                  ? {
                      productId: item.variant.product.product_id,
                      name: item.variant.product.product_name,
                      slug: item.variant.product.slug,
                      description: item.variant.product.description,
                      brandId: item.variant.product.brand_id,
                      categoryId: item.variant.product.category_id,
                      status: item.variant.product.status,
                    }
                  : null,
              },
            })) || [],
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching lookbook:", err);
      return null;
    }
  };

  // Fetch all products from API
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await apiFetch(`${apiUrl}/products`);
      if (Array.isArray(data)) {
        const transformedProducts = data.map((product) => ({
          _id: product.product_id.toString(),
          productId: product.product_id,
          name: product.product_name,
          slug: product.slug,
          description: product.description,
          brand: product.brand?.brand_name,
          brandId: product.brand?.brand_id,
          category: product.category?.category_name,
          categoryId: product.category?.category_id,
          status: product.status,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          variants:
            product.variants?.map((variant) => ({
              variantId: variant.variant_id,
              sku: variant.sku,
              barcode: variant.barcode,
              price: parseFloat(variant.price),
              offerPrice: parseFloat(variant.price),
              quantity: variant.quantity,
              status: variant.status,
              size: variant.size,
              gender: variant.gender,
              sizeType: variant.size_type,
              attributes: variant.attributes,
              color: variant.color,
              assets: variant.assets,
              primaryImage: variant.primary_image,
              image: variant.primary_image, // For backward compatibility
            })) || [],
          offerPrice: product.variants?.[0]?.price
            ? parseFloat(product.variants[0].price)
            : 0,
        }));
        setProducts(transformedProducts);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single product by ID
  const fetchProductById = async (productId) => {
    try {
      const { data } = await apiFetch(`${apiUrl}/products/${productId}`);

      if (data) {
        const product = data;
        return {
          _id: product.product_id.toString(),
          productId: product.product_id,
          name: product.product_name,
          slug: product.slug,
          description: product.description,
          brand: product.brand?.brand_name,
          brandId: product.brand?.brand_id,
          category: product.category?.category_name,
          categoryId: product.category?.category_id,
          status: product.status,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          variants:
            product.variants?.map((variant) => ({
              variantId: variant.variant_id,
              sku: variant.sku,
              barcode: variant.barcode,
              price: parseFloat(variant.price),
              offerPrice: parseFloat(variant.price),
              quantity: variant.quantity,
              status: variant.status,
              size: variant.size,
              gender: variant.gender,
              sizeType: variant.size_type,
              attributes: variant.attributes,
              color: variant.color,
              assets: variant.assets,
              primaryImage: variant.primary_image,
              image: variant.primary_image, // For backward compatibility
            })) || [],
          offerPrice: product.variants?.[0]?.price
            ? parseFloat(product.variants[0].price)
            : 0,
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching product:", err);
      return null;
    }
  };

  // Fetch filtered products from API
  const fetchFilteredProducts = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.brandIds && filters.brandIds.length > 0) {
        filters.brandIds.forEach((id) => queryParams.append("brand_id", id));
      }
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        filters.categoryIds.forEach((id) =>
          queryParams.append("category_id", id)
        );
      }
      if (filters.minPrice) queryParams.append("min_price", filters.minPrice);
      if (filters.maxPrice) queryParams.append("max_price", filters.maxPrice);

      const queryString = queryParams.toString();
      const url = queryString
        ? `${apiUrl}/products/filter?${queryString}`
        : `${apiUrl}/products`;

      // Use direct fetch instead of apiFetch since this endpoint returns array directly
      const response = await fetch(url);

      if (!response.ok) {
        //throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const transformedProducts = data.map((product) => ({
          _id: product.product_id.toString(),
          productId: product.product_id,
          name: product.product_name,
          slug: product.slug,
          description: product.description,
          brand: product.brands?.brand_name || product.brand?.brand_name,
          brandId: product.brands?.brand_id || product.brand?.brand_id,
          category:
            product.categories?.category_name ||
            product.category?.category_name,
          categoryId:
            product.categories?.category_id || product.category?.category_id,
          status: product.status,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          variants:
            product.product_variants?.map((variant) => ({
              variantId: variant.variant_id,
              sku: variant.sku,
              barcode: variant.barcode,
              price: parseFloat(variant.base_price),
              offerPrice: parseFloat(variant.base_price),
              quantity: variant.quantity,
              status: variant.status,
              size:
                variant.attribute?.size ||
                variant.size ||
                (variant.size_id ? `Size ${variant.size_id}` : null),
              gender: variant.attribute?.gender || variant.gender,
              sizeType: variant.size_type,
              attributes: variant.attribute || variant.attributes,
              color: variant.attribute?.màu || variant.attribute?.color,
              assets:
                variant.variant_assets?.map((asset) => ({
                  assetId: asset.asset_id,
                  url: asset.url,
                  type: asset.type,
                  isPrimary: asset.is_primary,
                })) || [],
              primaryImage:
                variant.variant_assets?.find((asset) => asset.is_primary)
                  ?.url || variant.variant_assets?.[0]?.url,
              image:
                variant.variant_assets?.find((asset) => asset.is_primary)
                  ?.url || variant.variant_assets?.[0]?.url,
            })) ||
            product.variants?.map((variant) => ({
              variantId: variant.variant_id,
              sku: variant.sku,
              barcode: variant.barcode,
              price: parseFloat(variant.price),
              offerPrice: parseFloat(variant.price),
              quantity: variant.quantity,
              status: variant.status,
              size: variant.size,
              gender: variant.gender,
              sizeType: variant.size_type,
              attributes: variant.attributes,
              color: variant.color,
              assets: variant.assets,
              primaryImage: variant.primary_image,
              image: variant.primary_image,
            })) ||
            [],
          offerPrice:
            product.product_variants?.[0]?.base_price ||
            product.variants?.[0]?.price
              ? parseFloat(
                  product.product_variants?.[0]?.base_price ||
                    product.variants[0].price
                )
              : 0,
        }));
        setFilteredProducts(transformedProducts);
        return transformedProducts;
      } else {
        setError("Failed to fetch filtered products");
        return [];
      }
    } catch (err) {
      console.error("Error fetching filtered products:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all brands from API
  const fetchBrands = async () => {
    try {
      const { data } = await apiFetch(`${apiUrl}/brands`);
      if (Array.isArray(data)) {
        const transformedBrands = data
          .filter((brand) => brand.status) // Only active brands
          .map((brand) => ({
            brandId: brand.brand_id,
            brandName: brand.brand_name,
            slug: brand.slug,
            description: brand.description,
            logoUrl: brand.logo_url,
          }))
          .sort((a, b) => a.brandName.localeCompare(b.brandName));
        setBrands(transformedBrands);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  // Fetch all categories from API
  const fetchCategories = async () => {
    try {
      const { data } = await apiFetch(`${apiUrl}/categories`);
      if (Array.isArray(data)) {
        // Flatten categories (parent + children) for filter display
        const allCategories = [];
        data.forEach((parent) => {
          if (parent.status) {
            // Add parent category
            allCategories.push({
              categoryId: parent.category_id,
              categoryName: parent.category_name,
              slug: parent.slug,
              parentId: parent.parent_id,
              description: parent.description,
            });
            // Add children categories
            if (parent.children && Array.isArray(parent.children)) {
              parent.children.forEach((child) => {
                if (child.status) {
                  allCategories.push({
                    categoryId: child.category_id,
                    categoryName: child.category_name,
                    slug: child.slug,
                    parentId: child.parent_id,
                    description: child.description,
                  });
                }
              });
            }
          }
        });
        setCategories(
          allCategories.sort((a, b) =>
            a.categoryName.localeCompare(b.categoryName)
          )
        );
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUserData(null);
        return;
      }

      // Decode JWT token to get user ID
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        const userId = decoded.sub;

        // Fetch user data from API
        const response = await fetch(`${apiUrl}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (result.success && result.data) {
          setUserData(result.data);
        } else {
          // If API fails, still set token as userData to maintain auth state
          setUserData({ token });
        }
      } catch (decodeError) {
        console.error("Error decoding token or fetching user:", decodeError);
        // Fallback: set token as userData to maintain auth state
        setUserData({ token });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUserData(null);
    }
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      // API returns cart object directly, not wrapped in {success, data}
      if (result && result.cart_id) {
        setCartData(result);

        // Build local cart items object for UI state
        const localCart = {};
        if (result.cart_detail && Array.isArray(result.cart_detail)) {
          result.cart_detail.forEach((detail) => {
            const variant = detail.product_variants;
            if (variant) {
              const cartKey = `${variant.product_id}_${variant.sku}`;
              localCart[cartKey] = detail.quantity;
            }
          });
        }
        setCartItems(localCart);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  // Add to cart (API + local state)
  const addToCart = async (itemId, variantId = null) => {
    const token = localStorage.getItem("access_token");

    if (token && variantId) {
      try {
        const response = await fetch(`${apiUrl}/cart/add`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variantId: variantId,
            quantity: 1,
          }),
        });

        if (response.ok) {
          await fetchCart();
          showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
          return;
        } else {
          const errorData = await response.json();
          showToast(
            errorData.message || "Không thể thêm vào giỏ hàng",
            "error"
          );
          return;
        }
      } catch (err) {
        console.error("Error adding to cart:", err);
        showToast("Có lỗi xảy ra khi thêm vào giỏ hàng", "error");
        return;
      }
    }

    // Guest user cart - use localStorage
    let cartData = structuredClone(cartItems);
    const cartKey = variantId ? `${itemId}_${variantId}` : itemId;

    if (cartData[cartKey]) {
      cartData[cartKey] += 1;
    } else {
      cartData[cartKey] = 1;
    }
    setCartItems(cartData);
    showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
  };

  // Update cart quantity (API + local state)
  const updateCartQuantity = async (itemId, quantity, variantId = null) => {
    const token = localStorage.getItem("access_token");

    if (token && variantId) {
      try {
        if (quantity === 0) {
          await fetch(`${apiUrl}/cart/${variantId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          await fetch(`${apiUrl}/cart/update`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              variantId: variantId,
              quantity: quantity,
            }),
          });
        }

        await fetchCart();
        return;
      } catch (err) {
        console.error("Error updating cart:", err);
      }
    }

    let cartData = structuredClone(cartItems);
    const cartKey = variantId ? `${itemId}_${variantId}` : itemId;

    if (quantity === 0) {
      delete cartData[cartKey];
    } else {
      cartData[cartKey] = quantity;
    }
    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    if (cartData && cartData.total_price) {
      return parseFloat(cartData.total_price);
    }

    let totalAmount = 0;
    for (const cartKey in cartItems) {
      if (cartItems[cartKey] > 0) {
        const parts = cartKey.split("_");
        const productId = parts[0];
        const variantId = parts.length > 1 ? parts.slice(1).join("_") : null;

        const itemInfo = products.find((product) => product._id === productId);

        if (itemInfo) {
          let price = itemInfo.offerPrice;

          if (variantId && itemInfo.variants) {
            const variant = itemInfo.variants.find((v) => v.sku === variantId);
            if (variant) {
              price = variant.offerPrice || variant.price;
            }
          }

          totalAmount += price * cartItems[cartKey];
        }
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  const getCartDetails = () => {
    if (cartData && cartData.cart_detail) {
      console.log(cartData);
      return cartData.cart_detail.map((detail) => {
        const variant = detail.product_variants;

        // Extract size from attribute object - check common Vietnamese/English keys
        const sizeFromAttr =
          variant.attribute?.size ||
          variant.attribute?.["kích cỡ"] ||
          variant.attribute?.["size"];

        // Fallback to size_id if no size string found
        const size =
          sizeFromAttr || (variant.size_id ? `Size ${variant.size_id}` : null);

        // Get primary image or first available image
        const image =
          variant.variant_assets?.find((asset) => asset.is_primary)?.url ||
          variant.variant_assets?.[0]?.url ||
          null;

        return {
          productId: variant.product_id,
          variantId: variant.variant_id,
          sku: variant.sku,
          quantity: detail.quantity,
          price: parseFloat(variant.base_price),
          subPrice: parseFloat(detail.sub_price),
          image: image,
          size: size,
          color: variant.attribute?.màu || variant.attribute?.color,
          barcode: variant.barcode,
          attributes: variant.attribute,
          assets: variant.variant_assets,
        };
      });
    }
    return [];
  };

  // Toast functions
  const showToast = (message, type = "info") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: "", type: "info" });
  };

  useEffect(() => {
    fetchProductData();
    fetchLookbooks();
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchCart();
    }
  }, [userData]);

  useEffect(() => {
    if (!userData) {
      try {
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    }
  }, [userData]);

  useEffect(() => {
    if (!userData) {
      try {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
      } catch (err) {
        console.error("Error saving cart:", err);
      }
    }
  }, [cartItems, userData]);

  const value = {
    currency,
    router,
    apiUrl,
    isSeller,
    setIsSeller,
    userData,
    setUserData,
    fetchUserData,
    products,
    filteredProducts,
    setFilteredProducts,
    fetchProductData,
    fetchProductById,
    fetchFilteredProducts,
    brands,
    fetchBrands,
    categories,
    fetchCategories,
    lookbooks,
    fetchLookbooks,
    fetchLookbookById,
    cartItems,
    setCartItems,
    cartData,
    addToCart,
    updateCartQuantity,
    fetchCart,
    getCartCount,
    getCartAmount,
    getCartDetails,
    loading,
    error,
    toast,
    showToast,
    hideToast,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
