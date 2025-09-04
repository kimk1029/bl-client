// 환경별 API 엔드포인트 설정
export const getApiBaseUrl = (): string => {
  const nodeEnv = process.env.NODE_ENV;
  
  switch (nodeEnv) {
    case 'local':
      return 'http://localhost:8080/api';
    case 'development':
      return 'https://kimk1029.synology.me:8080/kh1/api';
    case 'production':
      return 'https://kimk1029.synology.me:8080/kh1/api';
    default:
      // 기본값은 로컬 환경
      return 'http://localhost:8080/api';
  }
};

// 환경 정보 반환
export const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'local';
};

// API URL 생성 헬퍼 함수
export const createApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
