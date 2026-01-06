import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // CI/production builds should not fail on lint rules; run `yarn lint` separately.
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  images: {
    domains: [
      'github.com',
      'bmi-bucket.s3.ap-northeast-2.amazonaws.com', // S3 이미지 도메인 추가
      'bmilab-bucket.s3.ap-northeast-2.amazonaws.com',
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; img-src 'self' data: https:;",
  },
};

export default nextConfig;
