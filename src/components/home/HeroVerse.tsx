import HeroLandscape from "./icons/HeroLandscape";
import { getTodaysVerse, getVerseDateLabel } from "./data/verse";

export default function HeroVerse() {
  const verse = getTodaysVerse();
  const dateLabel = getVerseDateLabel();
  return (
    <div className="blessing-hero">
      <HeroLandscape />
      <div className="blessing-hero-content">
        <div className="blessing-hero-label">
          <span className="blessing-hero-dot" />
          오늘의 말씀 · {dateLabel}
        </div>
        <div className="blessing-hero-ko">{verse.ko}</div>
        <div className="blessing-hero-en">&ldquo;{verse.en}&rdquo;</div>
        <div className="blessing-hero-ref">— {verse.ref}</div>
      </div>
    </div>
  );
}
