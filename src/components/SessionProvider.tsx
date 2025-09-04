'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // 세션이 로드되었고, 세션이 있는 경우에만 토큰 유효성 검사
        if (status === 'authenticated' && session?.user?.id && session?.accessToken) {
            // 토큰의 만료 시간 확인
            const tokenExp = session.expires;
            if (tokenExp) {
                const expirationTime = new Date(tokenExp).getTime();
                const currentTime = new Date().getTime();

                // 만료 시간이 지났을 때만 세션을 비움
                if (currentTime >= expirationTime) {
                    signOut({ redirect: false });
                }
            }
        }
    }, [session, status]);

    return <>{children}</>;
} 