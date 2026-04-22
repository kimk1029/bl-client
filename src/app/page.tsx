"use client";

import React from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { Post } from "@/types/type";

import HeroVerse from "@/components/home/HeroVerse";
import PinnedNotice from "@/components/home/PinnedNotice";
import TopicStrip from "@/components/home/TopicStrip";
import HotSection from "@/components/home/HotSection";
import NoticeSection from "@/components/home/NoticeSection";
import PrayerStream from "@/components/home/PrayerStream";
import TopicLatestSection from "@/components/home/TopicLatestSection";
import EventsRail from "@/components/home/EventsRail";
import { TOPIC_BY_ID } from "@/components/home/data/topics";

const SECTION_TOPIC_IDS = [
  "confide",
  "youth",
  "career",
  "testimony",
  "free",
  "sermon",
  "worship",
  "qt",
  "family",
  "cell",
  "mission",
  "market",
  "local",
  "kids",
] as const;

export default function Home() {
  const { data: posts, error } = useSWR<Post[]>("/api/posts", apiFetcher);

  const list = Array.isArray(posts) ? posts : [];
  const NOTICE_MARK = /^(📌|\[공지\]|\[교회 공지\]|📣)|공지|안내/;
  const pinned =
    list.find((p) => (p as Post & { pinned?: boolean }).pinned) ??
    list.find((p) => NOTICE_MARK.test(p.title)) ??
    list.find((p) => p.category === "life") ??
    list[0] ??
    null;
  const hotIds = new Set<number>();
  const loaded = !!posts || !!error;

  return (
    <div className="blessing-home">
      <HeroVerse />
      <PinnedNotice post={pinned} />
      {loaded && <NoticeSection posts={list} excludeIds={hotIds} />}
      <TopicStrip />

      {!loaded ? (
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      ) : (
        <>
          <HotSection posts={list} outputIds={hotIds} />
          <PrayerStream />

          {SECTION_TOPIC_IDS.map((tid) => {
            const topic = TOPIC_BY_ID[tid];
            if (!topic) return null;
            return (
              <TopicLatestSection
                key={tid}
                topic={topic}
                posts={list}
                excludeIds={hotIds}
              />
            );
          })}

          <EventsRail />
        </>
      )}

      <div className="blessing-end">· · · END · · ·</div>
    </div>
  );
}
