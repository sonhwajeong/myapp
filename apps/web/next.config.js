/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@myapp/shared'],
  experimental: {
    externalDir: true,
  },
  // 모든 네트워크 인터페이스에서 접근 가능하도록 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig