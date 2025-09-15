export const apiFetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (res.status === 401) {
    try {
      const { signOut } = await import('next-auth/react');
      // 인증 만료 시 로그인 페이지로 이동
      signOut({ callbackUrl: '/auth/login' });
    } catch {}
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '요청 실패');
    throw new Error(text || '요청 실패');
  }
  return res.json();
};
