"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import { findDM, SAMPLE_THREAD, type ThreadMessage } from "../data";

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const dm = findDM(Number(id));

  const [messages, setMessages] = useState<ThreadMessage[]>(SAMPLE_THREAD);
  const [text, setText] = useState("");

  if (!dm) {
    return (
      <div className="blessing-home">
        <div
          className="blessing-event-detail-missing"
          style={{ minHeight: 240 }}
        >
          <div>대화를 찾을 수 없어요.</div>
        </div>
      </div>
    );
  }

  const title = dm.anon ? "🫧 익명의 성도" : dm.who;
  const subtitle = dm.church ?? (dm.anon ? "익명 메시지" : "범교회");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    const now = new Date();
    const hh = now.getHours();
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ampm = hh >= 12 ? "오후" : "오전";
    const h12 = ((hh + 11) % 12) + 1;
    setMessages((prev) => [...prev, { from: "me", text: v, time: `${ampm} ${h12}:${mm}` }]);
    setText("");
    toast.message("쪽지 전송 UI는 데모입니다. 서버 연동 전이에요.");
  };

  return (
    <div className="blessing-detail">
      <header className="blessing-detail-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-detail-topbar-title-wrap">
          <div className="blessing-dm-title">{title}</div>
          <div className="blessing-dm-subtitle">{subtitle}</div>
        </div>
        <div className="blessing-detail-topbar-actions">
          <button
            type="button"
            className="blessing-detail-icon-btn"
            aria-label="더보기"
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>⋯</span>
          </button>
        </div>
      </header>

      <div className="blessing-thread-area">
        <div className="blessing-thread-date-divider">
          <span>오늘</span>
        </div>
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showAvatar =
            m.from === "them" && (!prev || prev.from !== "them");
          return (
            <div key={i} className={`blessing-bubble-row blessing-bubble-${m.from}`}>
              {m.from === "them" &&
                (showAvatar ? (
                  <Avatar name={dm.who} size={28} seed={dm.id * 11} anon={dm.anon} />
                ) : (
                  <div style={{ width: 28, flexShrink: 0 }} />
                ))}
              <div className={`blessing-bubble blessing-bubble-${m.from}-body`}>
                {m.text}
              </div>
              <span className="blessing-bubble-time">{m.time}</span>
            </div>
          );
        })}
      </div>

      <form className="blessing-comment-compose" onSubmit={send}>
        <button
          type="button"
          className="blessing-detail-icon-btn"
          aria-label="첨부"
        >
          <IconPlus />
        </button>
        <input
          type="text"
          placeholder="쪽지 입력…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="쪽지 입력"
        />
        <button
          type="submit"
          className="blessing-comment-submit"
          disabled={!text.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
}
