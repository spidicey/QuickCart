"use client";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

const FilterSidebar = ({ filters, onFilterChange, isOpen, onClose }) => {
  const { brands, categories, currency } = useAppContext();

  const [localFilters, setLocalFilters] = useState({
    keyword: "",
    brandIds: [],
    categoryIds: [],
    minPrice: "",
    maxPrice: "",
    ...filters,
  });

  useEffect(() => {
    setLocalFilters({ ...localFilters, ...filters });
  }, [filters]);

  const handleKeywordChange = (e) => {
    setLocalFilters({ ...localFilters, keyword: e.target.value });
  };

  const handleBrandToggle = (brandId) => {
    const newBrandIds = localFilters.brandIds.includes(brandId)
      ? localFilters.brandIds.filter((id) => id !== brandId)
      : [...localFilters.brandIds, brandId];
    setLocalFilters({ ...localFilters, brandIds: newBrandIds });
  };

  const handleCategoryToggle = (categoryId) => {
    const newCategoryIds = localFilters.categoryIds.includes(categoryId)
      ? localFilters.categoryIds.filter((id) => id !== categoryId)
      : [...localFilters.categoryIds, categoryId];
    setLocalFilters({ ...localFilters, categoryIds: newCategoryIds });
  };

  const handlePriceChange = (field, value) => {
    setLocalFilters({ ...localFilters, [field]: value });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    if (onClose) onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      keyword: "",
      brandIds: [],
      categoryIds: [],
      minPrice: "",
      maxPrice: "",
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.keyword) count++;
    if (localFilters.brandIds.length > 0) count += localFilters.brandIds.length;
    if (localFilters.categoryIds.length > 0)
      count += localFilters.categoryIds.length;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    return count;
  };

  const sidebarClasses = `
    fixed lg:relative top-0 left-0 h-full w-80 bg-white
    transition-transform duration-300 z-50 overflow-y-auto
    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    border-r border-gray-200 shadow-lg lg:shadow-none
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Bộ lọc</h2>
              {getActiveFilterCount() > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                  {getActiveFilterCount()} đang áp dụng
                </span>
              )}
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
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

          {/* Search Keyword */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={localFilters.keyword}
              onChange={handleKeywordChange}
              placeholder="Nhập từ khóa..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Brand Filter */}
          {brands.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {brands.map((brand) => (
                  <label
                    key={brand.brandId}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.brandIds.includes(brand.brandId)}
                      onChange={() => handleBrandToggle(brand.brandId)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      {brand.brandName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {categories.map((category) => (
                  <label
                    key={category.categoryId}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.categoryIds.includes(
                        category.categoryId
                      )}
                      onChange={() => handleCategoryToggle(category.categoryId)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      {category.categoryName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng giá
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Giá tối thiểu
                </label>
                <input
                  type="number"
                  value={localFilters.minPrice}
                  onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Giá tối đa
                </label>
                <input
                  type="number"
                  value={localFilters.maxPrice}
                  onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                  placeholder="10000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sticky bottom-0 bg-white pt-4 border-t">
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Áp dụng bộ lọc
            </button>
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
