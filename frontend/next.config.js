/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "images.unsplash.com",
      "unsplash.com",
      "images.pexels.com",
      "api.qrserver.com",
      "lh3.googleusercontent.com", // For Google Auth avatars
      "assets.emergent.sh"
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://portfolio.seoplanet.in http://localhost:3000",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
