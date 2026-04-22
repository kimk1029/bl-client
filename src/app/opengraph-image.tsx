import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #F5E6C8 0%, #E8D4A8 50%, #C9B382 100%)",
          fontFamily: "system-ui, sans-serif",
          color: "#1A1915",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: SITE.themeColor,
              color: "#FAFAF8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            b
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: -1.2,
              color: "#1A1915",
            }}
          >
            {SITE.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: -2.5,
              lineHeight: 1.1,
              color: "#1A1915",
            }}
          >
            교회 공동체, 함께 이야기하는 법.
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#4A4A42",
              letterSpacing: -0.5,
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            기도제목·설교노트·청년부 소식까지. 전국 교회 성도들의 따뜻한 나눔 공간.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            fontSize: 22,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            color: "#6B5C38",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          <span>기도 · 나눔 · 공동체</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>CHURCH COMMUNITY PORTAL</span>
        </div>
      </div>
    ),
    size,
  );
}
