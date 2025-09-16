"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useTheme } from "@/context/ThemeContext";
import { computeLevel } from "@/utils/level";
import { showSuccess, showError } from "@/components/toast";
import { Check, Pencil, X } from "lucide-react";
import { apiFetcher } from "@/lib/fetcher";

const fetcher = apiFetcher;

type EditableKey = "username" | "affiliation" | "cell";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const { theme } = useTheme();
    const userId = (session?.user as any)?.id;

    const { data: account, mutate } = useSWR(userId ? `/api/users/account/${userId}` : null, fetcher, { revalidateOnFocus: false });

    const points = (account?.points ?? (session?.user as any)?.points) ?? 0;
    const { level, progressPct, rangeEnd } = computeLevel(points);

    const [editing, setEditing] = useState<Record<EditableKey, boolean>>({ username: false, affiliation: false, cell: false });
    const [values, setValues] = useState<Record<EditableKey, string>>({
        username: account?.username ?? (session?.user as any)?.name ?? "",
        affiliation: account?.affiliation ?? (session?.user as any)?.affiliation ?? "",
        cell: account?.cell ?? "",
    });
    const [pristine, setPristine] = useState(true);
    const [checking, setChecking] = useState(false);
    const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);

    useEffect(() => {
        setValues({
            username: account?.username ?? (session?.user as any)?.name ?? "",
            affiliation: account?.affiliation ?? (session?.user as any)?.affiliation ?? "",
            cell: account?.cell ?? "",
        });
        setPristine(true);
        setUsernameValid(null);
        setUsernameError(null);
    }, [account, session]);

    const onChange = (key: EditableKey, val: string) => {
        setValues(prev => ({ ...prev, [key]: val }));
        setPristine(false);
        if (key === "username") {
            setUsernameValid(null);
            setUsernameError(null);
        }
    };

    const checkUsername = async () => {
        try {
            setChecking(true);
            const q = values.username.trim();
            if (!q) {
                setUsernameValid(false);
                setUsernameError("닉네임을 입력하세요.");
                return;
            }
            // 본인과 동일하면 통과
            const current = account?.username ?? (session?.user as any)?.name ?? "";
            if (q === current) {
                setUsernameValid(true);
                setUsernameError(null);
                return;
            }
            const res = await fetch(`/api/auth/check-username`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: q })
            });
            const data = await res.json();
            const exists = Boolean(data?.exists);
            if (!exists) {
                setUsernameValid(true);
                setUsernameError(null);
            } else {
                setUsernameValid(false);
                setUsernameError("중복된 닉네임입니다.");
            }
        } catch {
            setUsernameValid(false);
            setUsernameError("중복 확인에 실패했습니다.");
        } finally {
            setChecking(false);
        }
    };

    const save = async () => {
        try {
            if (!userId) return;
            const payload: any = {};
            const initial = {
                username: account?.username ?? (session?.user as any)?.name ?? "",
                affiliation: account?.affiliation ?? (session?.user as any)?.affiliation ?? "",
                cell: account?.cell ?? "",
            };
            (Object.keys(values) as EditableKey[]).forEach(k => {
                if (values[k] !== (initial as any)[k]) payload[k] = values[k];
            });
            if (Object.keys(payload).length === 0) return;

            const res = await fetch(`/api/users/account/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || '수정 실패');
            }
            const updated = await res.json();
            showSuccess('프로필이 저장되었습니다.');
            mutate();
            // 세션 업데이트 시도
            await update?.({
                user: {
                    ...(session?.user || {}),
                    name: values.username || (session?.user as any)?.name,
                    email: (session?.user as any)?.email,
                    affiliation: values.affiliation,
                    image: (session?.user as any)?.image,
                } as any,
            } as any).catch(() => { });
        } catch (e: any) {
            showError(e?.message || '저장 중 오류가 발생했습니다.');
        }
    };

    const section = (label: string, key: EditableKey, placeholder = "") => (
        <div className="mb-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{label}</label>
                {!editing[key] ? (
                    <button className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} onClick={() => setEditing(p => ({ ...p, [key]: true }))}>
                        <Pencil className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="flex items-center space-x-2">
                        {key === 'username' && (
                            <button disabled={checking} onClick={checkUsername} className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>중복검사</button>
                        )}
                        <button onClick={() => setEditing(p => ({ ...p, [key]: false }))} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <X className="w-4 h-4" />
                        </button>
                        <button disabled={key === 'username' && usernameValid === false} onClick={() => { setEditing(p => ({ ...p, [key]: false })); }} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${key === 'username' && usernameValid === false ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            {!editing[key] ? (
                <div className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{values[key] || '-'}</div>
            ) : (
                <div className="mt-1">
                    <input
                        className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        value={values[key]}
                        onChange={e => onChange(key, e.target.value)}
                        placeholder={placeholder}
                    />
                    {key === 'username' && usernameValid === false && (
                        <div className={`flex items-center mt-1 text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                            <X className="w-3 h-3 mr-1" /> {usernameError || '중복된 닉네임입니다.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const canSave = useMemo(() => {
        const initial = {
            username: account?.username ?? (session?.user as any)?.name ?? "",
            affiliation: account?.affiliation ?? (session?.user as any)?.affiliation ?? "",
            cell: account?.cell ?? "",
        };
        const changed = (Object.keys(values) as EditableKey[]).some(k => values[k] !== (initial as any)[k]);
        const usernameOk = editing.username ? usernameValid !== false : true;
        return changed && usernameOk;
    }, [values, account, session, editing, usernameValid]);

    return (
        <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
                <div className="flex items-center space-x-4 mb-6">
                    <img
                        src={(session?.user as any)?.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent((session?.user as any)?.name ?? '')}&background=random`}
                        alt={(session?.user as any)?.name ?? 'User'}
                        className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                        <div className="text-lg font-bold">{(session?.user as any)?.name ?? '-'}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{(session?.user as any)?.email ?? '-'}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-semibold">Lv.{level}</div>
                        <div className="text-xs">{points}pt</div>
                        <div className={`mt-1 h-1 w-40 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div className="h-1 rounded bg-blue-500" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>

                <div className={`border rounded-md ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
                    {section('닉네임', 'username', '닉네임을 입력하세요')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section('소속', 'affiliation', '소속을 입력하세요')}
                        {section('셀', 'cell', '셀을 입력하세요')}
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            disabled={!canSave}
                            onClick={save}
                            className={`px-4 py-2 rounded text-sm font-medium ${canSave ? 'bg-blue-600 text-white hover:bg-blue-700' : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-500'}`}
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
