"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { TOPICS, TOPIC_BY_ID, type TopicId } from "@/components/home/data/topics";
import { composeBus } from "@/lib/composeBus";

function resolveInitialTopic(raw: string | null): TopicId {
  if (raw && (raw in TOPIC_BY_ID)) return raw as TopicId;
  return "free";
}

function ComposeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
    }
  }, [status, router]);

  const initialTopic = resolveInitialTopic(searchParams.get("topic"));
  const [topicId, setTopicId] = useState<TopicId>(initialTopic);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anon, setAnon] = useState<boolean>(
    !!TOPIC_BY_ID[initialTopic]?.anon,
  );
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const topic = TOPIC_BY_ID[topicId];
  const canPost =
    !submitting && title.trim().length > 0 && body.trim().length > 0;

  useEffect(() => {
    const submit = async () => {
      if (submitting) return;
      const t = title.trim();
      const c = body.trim();
      if (!t || !c) return;
      const accessToken = (session as { accessToken?: string } | null)
        ?.accessToken;
      if (!accessToken) {
        toast.error("로그인 후 다시 시도해 주세요.");
        router.push("/auth");
        return;
      }
      setSubmitting(true);
      try {
        const category = topic.mapsTo ?? "free";
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: t,
            content: c,
            category,
            is_anonymous: topic.anon ? true : anon,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "게시글 작성에 실패했어요.");
        }
        const created = (await res.json()) as { id?: number };
        toast.success("글이 등록되었습니다.");
        if (created?.id) {
          router.replace(`/posts/${created.id}`);
        } else {
          router.replace("/posts");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "게시글 작성 실패";
        toast.error(msg);
        setSubmitting(false);
      }
    };
    composeBus.set({ canSubmit: canPost, onSubmit: submit });
    return () => {
      composeBus.reset();
    };
  }, [canPost, submitting, title, body, anon, topic, router, session]);

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  return (
    <div className="blessing-compose">
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

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      }
    >
      <ComposeInner />
    </Suspense>
  );
}
