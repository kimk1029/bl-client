"use client";

import { DetailHeader } from "@/components/layout/DetailHeader";
import { useTheme } from "@/context/ThemeContext";

function Sun() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Moon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThemeSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const setTheme = (next: "light" | "dark") => {
    if (next !== theme) toggleTheme();
  };

  return (
    <div className="blessing-detail">
      <DetailHeader title="테마 및 표시" subtitle="Theme & Display" />

      <div className="blessing-settings-body">
        <div className="blessing-settings-section">
          <div className="blessing-settings-section-title">테마</div>
          <div className="blessing-settings-theme-grid">
            <button
              type="button"
              className={`blessing-settings-theme-card${!isDark ? " blessing-settings-theme-card-on" : ""}`}
              onClick={() => setTheme("light")}
              aria-pressed={!isDark}
            >
              <div className="blessing-settings-theme-preview blessing-settings-theme-preview-light">
                <span className="blessing-settings-theme-preview-bar" />
                <span className="blessing-settings-theme-preview-line" />
                <span
                  className="blessing-settings-theme-preview-line"
                  style={{ width: "62%" }}
                />
                <span
                  className="blessing-settings-theme-preview-line"
                  style={{ width: "44%" }}
                />
              </div>
              <div className="blessing-settings-theme-card-foot">
                <Sun />
                <span>라이트</span>
                {!isDark && <span className="blessing-settings-theme-dot" />}
              </div>
            </button>
            <button
              type="button"
              className={`blessing-settings-theme-card${isDark ? " blessing-settings-theme-card-on" : ""}`}
              onClick={() => setTheme("dark")}
              aria-pressed={isDark}
            >
              <div className="blessing-settings-theme-preview blessing-settings-theme-preview-dark">
                <span className="blessing-settings-theme-preview-bar" />
                <span className="blessing-settings-theme-preview-line" />
                <span
                  className="blessing-settings-theme-preview-line"
                  style={{ width: "62%" }}
                />
                <span
                  className="blessing-settings-theme-preview-line"
                  style={{ width: "44%" }}
                />
              </div>
              <div className="blessing-settings-theme-card-foot">
                <Moon />
                <span>다크</span>
                {isDark && <span className="blessing-settings-theme-dot" />}
              </div>
            </button>
          </div>
          <div className="blessing-settings-hint">
            기기 시스템 설정과 무관하게 앱 안에서만 적용됩니다. 새로고침해도
            유지돼요.
          </div>
        </div>

        <div className="blessing-settings-section">
          <div className="blessing-settings-section-title">표시 옵션</div>
          <div className="blessing-settings-row">
            <span>글자 크기</span>
            <span className="blessing-settings-row-hint">보통 (준비 중)</span>
          </div>
          <div className="blessing-settings-row">
            <span>애니메이션 줄이기</span>
            <span className="blessing-settings-row-hint">
              시스템 설정 따름
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
