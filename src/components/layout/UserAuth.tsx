import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ChevronDown, User, FileText, Settings, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import PostModal from '../posts/PostModal';
import { Post } from '@/types/type';
import useSWR from 'swr';
import { useEffect } from 'react';
import { computeLevel } from '@/utils/level';

const UserAuth = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { mutate } = useSWR<Post[]>('/api/posts', (url: string) => fetch(url, { cache: 'no-store' }).then((res) => res.json()));
    const { data: session, status, update } = useSession();
    const { theme } = useTheme();
    const userId = (session?.user as unknown as { id?: string | number })?.id;
    const accountKey = userId ? `/api/users/account/${userId}` : null;
    const { data: account, mutate: mutateAccount } = useSWR(accountKey, (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json()));
    const detailsRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const el = detailsRef.current;
            if (!el) return;
            if (el.open && e.target instanceof Node && !el.contains(e.target)) {
                el.open = false;
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // 로딩 중에는 아무 것도 렌더링하지 않아 로그인 버튼이 깜빡이지 않도록 함
    if (status === 'loading') {
        return null;
    }

    if (!session?.user) {
        return (
            <Link href="/auth" className={`border text-sm px-3 py-1 rounded transition-colors duration-200 ${theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}>
                Login
            </Link>
        );
    }
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@", session)
    return (
        <>
            <PostModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSuccess={async () => {
                    // 게시 목록 갱신
                    mutate();
                    // 계정 정보 즉시 가져와 SWR 캐시 및 세션 동기화
                    try {
                        if (accountKey) {
                            console.log('Fetching fresh account data...');
                            const fresh = await fetch(accountKey, { cache: 'no-store' }).then(r => r.json()).catch(() => null);
                            console.log('Fresh account data:', fresh);
                            if (fresh) {
                                await mutateAccount?.(fresh, { revalidate: false });

                                // 현재 사용자 정보를 백엔드에서 최신 데이터로 가져와서 세션 업데이트
                                const userId = (session.user as any)?.id;
                                if (userId) {
                                    // 백엔드에서 최신 사용자 정보 가져오기 (/api/users/account/:id 사용)
                                    const accountResponse = await fetch(`/api/users/account/${userId}`, {
                                        method: 'GET',
                                        cache: 'no-store'
                                    });

                                    if (accountResponse.ok) {
                                        const accountData = await accountResponse.json();
                                        console.log('Latest account data from backend:', accountData);

                                        // user 객체에서 포인트와 레벨만 추출하여 세션 업데이트
                                        if (accountData.user) {
                                            await update?.({
                                                user: {
                                                    ...(session.user as any),
                                                    points: accountData.user.points ?? (session.user as any)?.points,
                                                    level: accountData.user.level ?? (session.user as any)?.level,
                                                }
                                            } as any);

                                            console.log('Session updated with latest points and level');
                                        }
                                    }
                                }
                            } else {
                                await mutateAccount?.();
                            }
                        }
                    } catch (error) {
                        console.error('Error updating account:', error);
                    }
                    setIsOpen(false);
                }}
                apiEndpoint="/api/posts"
                modalTitle="새 게시글 작성"
            />
            <button onClick={() => setIsOpen(true)} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer text-sm px-3 py-1 rounded transition-colors duration-200">
                Write
            </button>
            <div className="relative">
                <details ref={detailsRef} className="group">
                    <summary className={`flex items-center space-x-1 border px-3 py-1 text-sm rounded cursor-pointer transition-colors duration-200 ${theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}>
                        <span>My Profile</span>
                        <ChevronDown className="w-4 h-4" />
                    </summary>
                    <div className={`absolute right-0 mt-2 w-48 border shadow-lg rounded transition-colors duration-200 ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                        }`}>
                        <div className="flex items-center px-3 py-2 space-x-2">
                            <img
                                src={session.user.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name ?? '')}&background=random`}
                                alt={session.user.name ?? 'User'}
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex flex-col">
                                <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {session.user.name ?? 'User'}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {session.user.email ?? ''}
                                </span>
                                {((session.user as unknown as { affiliation?: string | null }).affiliation ?? '') && (
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {((session.user as unknown as { affiliation?: string | null }).affiliation) as string}
                                    </span>
                                )}
                                {(() => {
                                    const points = (account?.points ?? (session.user as any)?.points) ?? 0;
                                    const lvl = (account?.level ?? (session.user as any)?.level) as number | undefined;
                                    const { level, progressPct } = computeLevel(points);
                                    const displayLevel = typeof lvl === 'number' ? lvl : level;
                                    return (
                                        <div className="mt-1">
                                            <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Lv.{displayLevel} · {points}pt</div>
                                            <div className={`h-1 w-28 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                <div className="h-1 rounded bg-blue-500" style={{ width: `${progressPct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                        <Link href="/profile" className={`flex items-center px-3 py-2 transition-colors duration-200 ${theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                            <User className="w-4 h-4 mr-2" />Profile
                        </Link>
                        <Link href="/my-articles" className={`flex items-center px-3 py-2 transition-colors duration-200 ${theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                            <FileText className="w-4 h-4 mr-2" />My Articles
                        </Link>
                        <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                        <button onClick={() => signOut()} className={`w-full text-left flex items-center px-3 py-2 text-red-500 transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}>
                            <LogOut className="w-4 h-4 mr-2" />Logout
                        </button>
                    </div>
                </details>
            </div>
        </>
    );
};

export default UserAuth;