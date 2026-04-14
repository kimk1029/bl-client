'use client';

import { useState, useEffect, useRef } from 'react';

interface Church {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
}

interface ChurchSearchProps {
  onChange: (name: string, churchId: number | null) => void;
  theme?: string;
  initialValue?: string;
}

export default function ChurchSearch({ onChange, theme, initialValue = '' }: ChurchSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<Church[]>([]);
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(false); // 선택 완료 상태
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (locked) return;
    clearTimeout(debounceRef.current);
    if (query.trim().length < 1) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/churches/search?q=${encodeURIComponent(query)}`);
        const data: Church[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      }
    }, 300);
  }, [query, locked]);

  const selectChurch = (church: Church) => {
    setQuery(church.name);
    setLocked(true);
    setOpen(false);
    setResults([]);
    onChange(church.name, church.id);
  };

  const handleInput = (val: string) => {
    setQuery(val);
    setLocked(false);
    onChange(val, null);
  };

  const isDark = theme === 'dark';
  const inputClass = `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500
    ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700' : 'bg-gray-100 border-gray-200 focus:bg-white'}`;

  const location = (c: Church) =>
    [c.city, c.district].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => { if (!locked && results.length > 0) setOpen(true); }}
        placeholder="교회 이름으로 검색 (예: 명성교회)"
        autoComplete="off"
        className={inputClass}
      />
      {locked && (
        <button
          type="button"
          onClick={() => { setQuery(''); setLocked(false); onChange('', null); }}
          className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-600"
          title="선택 취소"
        >
          ✕
        </button>
      )}
      {open && results.length > 0 && (
        <ul
          className={`absolute z-50 w-full mt-1 border rounded shadow-lg max-h-52 overflow-y-auto
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          {results.map(c => (
            <li
              key={c.id}
              onMouseDown={() => selectChurch(c)}
              className={`px-3 py-2 cursor-pointer
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
            >
              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {c.name}
              </div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {[location(c), c.address].filter(Boolean).join(' · ') || '주소 정보 없음'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
