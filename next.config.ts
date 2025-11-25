import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [new URL('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dHExcnE1dGUzcWs1eGp2MWRlcWppaWZvMG8zbzV2Z3cyYXlwb2c5NyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/iqatr9kJTDezD9YLpZ/giphy.gif'), new URL('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXpzOTBqMXN4aGMydTFva3hsajd2ZmtmZmZzdDBoZWx1cDF3d29tbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6wZpP5PLB9WEpwaqiW/giphy.gif')]
  }
};

export default nextConfig;
