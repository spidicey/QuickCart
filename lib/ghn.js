// GHN (Giao Hang Nhanh) Shipping API Helper
const GHN_TOKEN = "7aae3204-c5b3-11f0-a0b9-a6fd7d3828f8";
const GHN_BASE_URL = "https://online-gateway.ghn.vn/shiip/public-api/master-data";

/**
 * Fetch all provinces from GHN API
 * @returns {Promise<Array<{ProvinceID: number, ProvinceName: string}>>}
 */
export const fetchProvinces = async () => {
  try {
    const response = await fetch(`${GHN_BASE_URL}/province`, {
      method: "GET",
      headers: {
        token: GHN_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch provinces");
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
};

/**
 * Fetch districts by province ID from GHN API
 * @param {number} provinceId
 * @returns {Promise<Array<{DistrictID: number, DistrictName: string, ProvinceID: number}>>}
 */
export const fetchDistricts = async (provinceId) => {
  if (!provinceId) return [];

  try {
    const response = await fetch(
      `${GHN_BASE_URL}/district?province_id=${provinceId}`,
      {
        method: "GET",
        headers: {
          token: GHN_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch districts");
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching districts:", error);
    return [];
  }
};

/**
 * Fetch wards by district ID from GHN API
 * @param {number} districtId
 * @returns {Promise<Array<{WardCode: string, WardName: string, DistrictID: number}>>}
 */
export const fetchWards = async (districtId) => {
  if (!districtId) return [];

  try {
    const response = await fetch(
      `${GHN_BASE_URL}/ward?district_id=${districtId}`,
      {
        method: "GET",
        headers: {
          token: GHN_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch wards");
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching wards:", error);
    return [];
  }
};
