"use client";

import React from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";
import type { Post } from "@/types/type";

import HeroVerse from "@/components/home/HeroVerse";
import NoticeTicker from "@/components/home/NoticeTicker";
import TopicStrip from "@/components/home/TopicStrip";
import HotSection from "@/components/home/HotSection";
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
  const hotIds = new Set<number>();
  const loaded = !!posts || !!error;

  return (
    <div className="blessing-home">
      <HeroVerse />
      <NoticeTicker posts={list} />
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
