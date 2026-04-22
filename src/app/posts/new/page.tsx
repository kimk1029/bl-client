"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOPICS, TOPIC_BY_ID, type TopicId } from "@/components/home/data/topics";

export default function ComposePage() {
  const router = useRouter();
  const [topicId, setTopicId] = useState<TopicId>("free");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anon, setAnon] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const topic = TOPIC_BY_ID[topicId];
  const canPost = title.trim().length > 0 && body.trim().length > 0;

  const onSubmit = () => {
    if (!canPost) return;
    // TODO: wire to POST /api/posts when backend supports the topic schema.
    router.back();
  };

  return (
    <div className="blessing-compose">
      <div className="blessing-compose-submit-bar">
        <button
          className="blessing-submit-btn"
          disabled={!canPost}
          onClick={onSubmit}
        >
          등록
        </button>
      </div>

      <div
        className="blessing-compose-topic-picker"
        onClick={() => setShowPicker((v) => !v)}
      >
        <span className="blessing-compose-topic-label">TOPIC</span>
        <span className="blessing-compose-topic-value">
          <span style={{ fontSize: 14 }}>{topic.emoji}</span>
          {topic.ko}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            transform: showPicker ? "rotate(90deg)" : "rotate(-90deg)",
            transition: "transform 0.15s",
            color: "var(--blessing-fg-2)",
          }}
          aria-hidden
        >
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showPicker && (
        <div className="blessing-chip-row blessing-chip-row-wrap">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              className={`blessing-chip ${t.id === topicId ? "blessing-chip-active" : ""}`}
              onClick={() => {
                setTopicId(t.id);
                setShowPicker(false);
                if (t.anon) setAnon(true);
              }}
            >
              <span style={{ fontSize: 13 }}>{t.emoji}</span>
              <span>{t.ko}</span>
            </button>
          ))}
        </div>
      )}

      <input
        className="blessing-compose-title-input"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="blessing-compose-body-input"
        placeholder={
          topic.anon
            ? "익명으로 편하게 나눠주세요. 서로 비난 없이 경청하는 공간입니다."
            : `${topic.ko}에 대한 이야기를 나눠주세요.\n\n성도님들과 따뜻하게 소통하는 공간입니다.`
        }
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <div className="blessing-compose-toolbar">
        <button className="blessing-toolbar-btn" aria-label="사진">📷</button>
        <button className="blessing-toolbar-btn" aria-label="성경">📖</button>
        <button className="blessing-toolbar-btn" aria-label="기도">🙏</button>
        <button className="blessing-toolbar-btn" aria-label="이모지">😊</button>
        <button
          className="blessing-compose-anon-toggle"
          onClick={() => setAnon(!anon)}
          type="button"
        >
          <span>익명</span>
          <span
            className={`blessing-anon-switch ${anon ? "blessing-anon-switch-on" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
