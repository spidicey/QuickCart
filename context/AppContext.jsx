"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "VND";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3618";
  const router = useRouter();

  const [products, setProducts] = useState([]);
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

      const response = await fetch(`${apiUrl}/lookbooks`);
      const result = await response.json();

      if (Array.isArray(result)) {
        const transformedLookbooks = result.map((lookbook) => ({
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
      const response = await fetch(`${apiUrl}/lookbooks/${identifier}`);
      const result = await response.json();

      if (result && result.lookbook_id) {
        return {
          _id: result.lookbook_id.toString(),
          lookbookId: result.lookbook_id,
          title: result.title,
          slug: result.slug,
          description: result.description,
          image: result.image,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
          items:
            result.items?.map((item) => ({
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

      const response = await fetch(`${apiUrl}/products`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const groupedProducts = {};

        result.data.forEach((item) => {
          const productId = item.product_id.toString();

          if (!groupedProducts[productId]) {
            groupedProducts[productId] = {
              _id: productId,
              productId: item.product_id,
              name: item.product_name,
              brand: item.brand?.brand_name,
              brandId: item.brand?.brand_id,
              category: item.category?.category_name,
              categoryId: item.category?.category_id,
              status: item.status,
              variants: [],
            };
          }

          groupedProducts[productId].variants.push({
            sku: item.sku,
            price: parseFloat(item.price),
            offerPrice: parseFloat(item.price),
            size: item.size,
            color: item.color,
            image: item.image,
            status: item.status,
          });
        });

        const transformedProducts = Object.values(groupedProducts).map(
          (product) => ({
            ...product,
            offerPrice: product.variants[0]?.price || 0,
          })
        );

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
      const response = await fetch(`${apiUrl}/products/${productId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const item = result.data;
        return {
          _id: item.product_id.toString(),
          productId: item.product_id,
          name: item.product_name,
          brand: item.brand?.brand_name,
          brandId: item.brand?.brand_id,
          category: item.category?.category_name,
          categoryId: item.category?.category_id,
          variants:
            item.variants?.map((v) => ({
              variantId: v.variant_id,
              sku: v.sku,
              price: parseFloat(v.price),
              offerPrice: parseFloat(v.price),
              size: v.size,
              color: v.color,
              image: v.image,
            })) || [],
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching product:", err);
      return null;
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      console.log(token);
      if (!token) {
        setUserData(null);
        return;
      }
      setUserData(token);
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
        },
      });
      if (response.ok) {
        const result = await response.json();
        setCartData(result);

        const localCart = {};
        if (result.details && Array.isArray(result.details)) {
          result.details.forEach((detail) => {
            const variant = detail.variant;
            const cartKey = `${variant.product_id}_${variant.sku}`;
            localCart[cartKey] = detail.quantity;
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

    if (token) {
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
          return;
        }
      } catch (err) {
        console.error("Error adding to cart:", err);
      }
    }

    let cartData = structuredClone(cartItems);
    const cartKey = variantId ? `${itemId}_${variantId}` : itemId;

    if (cartData[cartKey]) {
      cartData[cartKey] += 1;
    } else {
      cartData[cartKey] = 1;
    }
    setCartItems(cartData);
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
      return parseFloat(cartData.total_price.d.join(""));
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
      return cartData.cart_detail.map((detail) => ({
        productId: detail.product_variants.product_id,
        variantId: detail.product_variants.variant_id,
        sku: detail.product_variants.sku,
        quantity: detail.quantity,
        price: parseFloat(detail.product_variants.base_price.d.join("")),
        subPrice: parseFloat(detail.sub_price.d.join("")),
        image: detail.product_variants.variant_assets?.[0]?.image_url || null,
        size: detail.product_variants.attribute?.size,
        color: detail.product_variants.attribute?.color,
        barcode: detail.product_variants.barcode,
      }));
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
    fetchProductData,
    fetchProductById,
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
