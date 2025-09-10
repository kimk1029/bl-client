import type { NextConfig } from "next";


// 환경별 API URL 설정
const getApiUrl = () => {
  // 환경변수에서 직접 가져오기 (dotenv가 자동으로 로드됨)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: getApiUrl(),
  },
  async rewrites() {
    const apiUrl = getApiUrl();
    console.log(`🔗 API URL: ${apiUrl}`);
    return [
      // 외부 백엔드 호출은 '/proxy/*'로만 프록시. '/api/*'는 모두 Next 내부에서 처리
      {
        source: '/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
