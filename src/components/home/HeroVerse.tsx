"use client";

import { useEffect, useState } from "react";
import HeroLandscape from "./icons/HeroLandscape";
import { getTodaysVerse, getVerseDateLabel, type Verse } from "./data/verse";

// Stable SSR/first-render fallback — avoids Date-based text mismatch (#418)
const INITIAL_VERSE: Verse = {
  ref: "시편 46:10",
  ko: "너희는 가만히 있어 내가 하나님 됨을 알지어다",
  en: "Be still, and know that I am God.",
};

export default function HeroVerse() {
  const [verse, setVerse] = useState<Verse>(INITIAL_VERSE);
  const [dateLabel, setDateLabel] = useState<string>("");

  useEffect(() => {
    setVerse(getTodaysVerse());
    setDateLabel(getVerseDateLabel());
  }, []);

  return (
    <div className="blessing-hero">
      <HeroLandscape />
      <div className="blessing-hero-content">
        <div className="blessing-hero-label">
          <span className="blessing-hero-dot" />
          오늘의 말씀{dateLabel && ` · ${dateLabel}`}
        </div>
        <div className="blessing-hero-ko">{verse.ko}</div>
        <div className="blessing-hero-en">&ldquo;{verse.en}&rdquo;</div>
        <div className="blessing-hero-ref">— {verse.ref}</div>
      </div>
    </div>
  );
}
