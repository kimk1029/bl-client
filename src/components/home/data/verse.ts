export interface Verse {
  ref: string;
  ko: string;
  en: string;
}

const VERSES: Verse[] = [
  { ref: "시편 46:10",   ko: "너희는 가만히 있어 내가 하나님 됨을 알지어다", en: "Be still, and know that I am God." },
  { ref: "빌립보서 4:13", ko: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", en: "I can do all things through Christ who strengthens me." },
  { ref: "요한복음 3:16", ko: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니", en: "For God so loved the world that He gave His one and only Son." },
  { ref: "시편 23:1",    ko: "여호와는 나의 목자시니 내가 부족함이 없으리로다", en: "The Lord is my shepherd; I shall not want." },
  { ref: "이사야 41:10",  ko: "두려워하지 말라 내가 너와 함께 함이라", en: "Do not fear, for I am with you." },
  { ref: "마태복음 11:28", ko: "수고하고 무거운 짐 진 자들아 다 내게로 오라", en: "Come to me, all you who are weary and burdened." },
  { ref: "시편 37:4",    ko: "또 여호와를 기뻐하라 그가 네 마음의 소원을 네게 이루어 주시리로다", en: "Delight yourself in the Lord, and He will give you the desires of your heart." },
];

export function getTodaysVerse(): Verse {
  const d = new Date();
  const seed = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();
  return VERSES[seed % VERSES.length];
}

export function getVerseDateLabel(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}
