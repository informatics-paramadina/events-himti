/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/event",
        destination: "/",
        permanent: false,
      },
      {
        source: "/participants",
        destination: "/dashboard/participants",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
