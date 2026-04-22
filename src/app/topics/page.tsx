"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { Post } from "@/types/type";
import MyChurchFeed from "@/components/topics/MyChurchFeed";
import TopicBrowser from "@/components/topics/TopicBrowser";

type HubTab = "feed" | "browse";

export default function TopicsPage() {
  const [tab, setTab] = useState<HubTab>("feed");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("blessing:hubTab");
      if (saved === "feed" || saved === "browse") setTab(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("blessing:hubTab", tab);
    } catch {}
  }, [tab]);

  const { data: posts, error } = useSWR<Post[]>("/api/posts", apiFetcher);
  const list = Array.isArray(posts) ? posts : [];
  const loaded = !!posts || !!error;

  return (
    <div className="blessing-home">
      <div className="blessing-hub-tabs">
        <button
          className={`blessing-hub-tab ${tab === "feed" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setTab("feed")}
        >
          <span
            className="blessing-hub-tab-dot"
            style={{
              background:
                tab === "feed" ? "var(--blessing-accent)" : "var(--blessing-fg-3)",
            }}
          />
          내 교회 피드
        </button>
        <button
          className={`blessing-hub-tab ${tab === "browse" ? "blessing-hub-tab-active" : ""}`}
          onClick={() => setTab("browse")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          토픽 탐색
        </button>
      </div>

      {!loaded ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : tab === "feed" ? (
        <MyChurchFeed posts={list} />
      ) : (
        <TopicBrowser posts={list} />
      )}
    </div>
  );
}
