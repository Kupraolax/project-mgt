/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pm-kupra-s3-images.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;   // ← This line is required
