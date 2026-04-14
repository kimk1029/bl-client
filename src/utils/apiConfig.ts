// 모든 API는 Next.js 자체 /api 라우트로 통합됨 (Phase 4 포팅 완료).
// 클라이언트(브라우저)에서는 상대 경로를, 서버 사이드에서는 NEXTAUTH_URL 기반 절대 경로를 사용.
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  return '';
};

export const getEnvironment = (): string => process.env.NODE_ENV || 'local';

export const createApiUrl = (endpoint: string): string => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${getApiBaseUrl()}/api${path}`;
};
