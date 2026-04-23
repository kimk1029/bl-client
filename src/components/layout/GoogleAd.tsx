'use client';
import { useEffect } from 'react';

type Props = {
  slot?: string;
  className?: string;
  minHeight?: number;
};

// AdSense 사용 방법:
// 1) .env 에 NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-XXXXXXXX" 설정
// 2) 각 위치에 맞는 slot 번호 전달
// 클라이언트 ID 없으면 placeholder 표시
export default function GoogleAd({ slot = '0000000000', className = '', minHeight = 600 }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client) return;
    try {
      const w = window as Window & { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // ignore — script may not be loaded yet
    }
  }, [client, slot]);

  if (!client) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500 ${className}`}
        style={{ minHeight }}
      >
        <span>광고 영역</span>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', minHeight }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
