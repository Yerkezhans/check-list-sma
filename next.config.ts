import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http', // ✅ строго http
        hostname: 'localhost',
        port: '5000',
        pathname: '/api/uploads/**', // ✅ путь к твоим файлам
      },
    ],
  },
};

export default withNextIntl(nextConfig);
