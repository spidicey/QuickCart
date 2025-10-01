/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "assets.adidas.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "brand.assets.adidas.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
