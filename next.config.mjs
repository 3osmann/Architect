/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js + drei ship untranspiled ESM helpers; keep Next from tree-shaking them oddly.
  transpilePackages: ["three"],
};

export default nextConfig;
