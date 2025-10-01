"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";

const Product = () => {

    const { id } = useParams();

    const { products, router, addToCart, currency, apiUrl } = useAppContext()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProductData = async () => {
        try {
            setLoading(true)
            
            // First try to get from context
            let product = products.find(p => p._id === id);
            
            // If not found, fetch from API
            if (!product) {
                const response = await fetch(`${apiUrl}/products/${id}`)
                const result = await response.json()
                
                if (result.success && result.data) {
                    const item = result.data
                    product = {
                        _id: item.product_id.toString(),
                        productId: item.product_id,
                        name: item.product_name,
                        brand: item.brand?.brand_name,
                        brandId: item.brand?.brand_id,
                        category: item.category?.category_name,
                        categoryId: item.category?.category_id,
                        variants: item.variants?.map(v => ({
                            variantId: v.variant_id,
                            sku: v.sku,
                            price: parseFloat(v.price),
                            size: v.size,
                            color: v.color,
                            image: v.image
                        })) || []
                    }
                }
            }
            
            if (product) {
                setProductData(product);
                
                // Set default selections
                if (product.variants && product.variants.length > 0) {
                    const firstVariant = product.variants[0]
                    setSelectedColor(firstVariant.color)
                    setSelectedSize(firstVariant.size)
                    setSelectedVariant(firstVariant)
                    setMainImage(firstVariant.image)
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchProductData();
        }
    }, [id, products.length])

    // Update selected variant when color or size changes
    useEffect(() => {
        if (productData && selectedColor && selectedSize) {
            const variant = productData.variants.find(
                v => v.color === selectedColor && v.size === selectedSize
            )
            if (variant) {
                setSelectedVariant(variant)
                if (variant.image) {
                    setMainImage(variant.image)
                }
            }
        }
    }, [selectedColor, selectedSize, productData])

    // Get unique colors and sizes
    const availableColors = productData ? [...new Set(productData.variants.map(v => v.color))] : []
    const availableSizes = productData ? [...new Set(productData.variants.map(v => v.size))] : []

    // Get all unique images from variants
    const allImages = productData ? 
        [...new Set(productData.variants.map(v => v.image).filter(Boolean))] : []

    // Product display name
    const displayName = productData?.name || 
        `${productData?.brand || 'Product'} ${productData?.category || ''}`

    const handleAddToCart = () => {
        if (selectedVariant) {
            addToCart(productData._id, selectedVariant.variantId)
        }
    }

    const handleBuyNow = () => {
        if (selectedVariant) {
            addToCart(productData._id, selectedVariant.sku)
            router.push('/cart')
        }
    }

    return loading ? <Loading /> : productData ? (<>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* Product Images */}
                <div className="px-5 lg:px-16 xl:px-20">
                    <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 min-h-[400px] flex items-center justify-center">
                        {mainImage || allImages[0] ? (
                            <Image
                                src={mainImage || allImages[0]}
                                alt={displayName}
                                className="w-full h-auto object-cover mix-blend-multiply"
                                width={1280}
                                height={720}
                                onError={(e) => {
                                    e.target.src = '/placeholder.png'
                                }}
                            />
                        ) : (
                            <div className="text-gray-400">No image available</div>
                        )}
                    </div>

                    {allImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {allImages.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setMainImage(image)}
                                    className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 border-2 transition ${
                                        mainImage === image ? 'border-orange-500' : 'border-transparent'
                                    }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${displayName} view ${index + 1}`}
                                        className="w-full h-auto object-cover mix-blend-multiply"
                                        width={1280}
                                        height={720}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                    <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
                        {displayName}
                    </h1>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star" />
                            <Image className="h-4 w-4" src={assets.star_dull_icon} alt="star" />
                        </div>
                        <p>(4.5)</p>
                    </div>

                    {/* Price */}
                    <p className="text-3xl font-medium mt-6">
                        {currency}{selectedVariant?.price.toLocaleString() || productData.variants[0]?.price.toLocaleString()}
                    </p>

                    <hr className="bg-gray-600 my-6" />

                    {/* Color Selection */}
                    {availableColors.length > 0 && (
                        <div className="mb-4">
                            <p className="text-gray-600 font-medium mb-2">Color: <span className="text-gray-800">{selectedColor}</span></p>
                            <div className="flex gap-2 flex-wrap">
                                {availableColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-4 py-2 border rounded transition ${
                                            selectedColor === color
                                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    {availableSizes.length > 0 && (
                        <div className="mb-6">
                            <p className="text-gray-600 font-medium mb-2">Size: <span className="text-gray-800">{selectedSize}</span></p>
                            <div className="flex gap-2 flex-wrap">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 border rounded transition ${
                                            selectedSize === size
                                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product Info Table */}
                    <div className="overflow-x-auto mb-6">
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody>
                                {productData.brand && (
                                    <tr>
                                        <td className="text-gray-600 font-medium py-1">Brand</td>
                                        <td className="text-gray-800/50">{productData.brand}</td>
                                    </tr>
                                )}
                                {selectedColor && (
                                    <tr>
                                        <td className="text-gray-600 font-medium py-1">Color</td>
                                        <td className="text-gray-800/50">{selectedColor}</td>
                                    </tr>
                                )}
                                {productData.category && (
                                    <tr>
                                        <td className="text-gray-600 font-medium py-1">Category</td>
                                        <td className="text-gray-800/50">{productData.category}</td>
                                    </tr>
                                )}
                                {selectedVariant && (
                                    <tr>
                                        <td className="text-gray-600 font-medium py-1">SKU</td>
                                        <td className="text-gray-800/50 text-xs">{selectedVariant.sku}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center mt-4 gap-4">
                        <button 
                            onClick={handleAddToCart}
                            disabled={!selectedVariant}
                            className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={handleBuyNow}
                            disabled={!selectedVariant}
                            className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy now
                        </button>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-3xl font-medium">Featured <span className="font-medium text-orange-600">Products</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                    {products.slice(0, 5).map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
                <button 
                    onClick={() => router.push('/all-products')}
                    className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
                >
                    See more
                </button>
            </div>
        </div>
        <Footer />
    </>) : (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Product not found</p>
        </div>
    )
};

export default Product;