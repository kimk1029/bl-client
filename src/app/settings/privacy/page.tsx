"use client";

import { DetailHeader } from "@/components/layout/DetailHeader";

export default function PrivacySettingsPage() {
  return (
    <div className="blessing-detail">
      <DetailHeader title="개인정보 및 보안" subtitle="Privacy & Security" />

      <div className="blessing-settings-body">
        <div className="blessing-settings-section">
          <div className="blessing-settings-section-title">내 정보</div>
          <div className="blessing-settings-row">
            <span>프로필 편집</span>
            <a href="/profile/edit" className="blessing-settings-row-hint">
              이동 ›
            </a>
          </div>
          <div className="blessing-settings-row">
            <span>교회 인증</span>
            <a
              href="/verify-church?return=/settings/privacy"
              className="blessing-settings-row-hint"
            >
              이동 ›
            </a>
          </div>
        </div>

        <div className="blessing-settings-section">
          <div className="blessing-settings-section-title">차단·신고</div>
          <div className="blessing-settings-row">
            <span>차단한 사용자</span>
            <span className="blessing-settings-row-hint">준비 중</span>
          </div>
          <div className="blessing-settings-row">
            <span>내가 보낸 신고 내역</span>
            <span className="blessing-settings-row-hint">준비 중</span>
          </div>
        </div>

        <div className="blessing-settings-section">
          <div className="blessing-settings-section-title">보안</div>
          <div className="blessing-settings-row">
            <span>로그인 기기 관리</span>
            <span className="blessing-settings-row-hint">준비 중</span>
          </div>
          <div className="blessing-settings-row">
            <span>2단계 인증</span>
            <span className="blessing-settings-row-hint">준비 중</span>
          </div>
        </div>

        <div className="blessing-settings-hint">
          blessing은 등록된 교회 내의 성도 신원 확인을 전제로 운영됩니다.
          의심 활동이 발견되면 운영팀이 계정을 보호 조치할 수 있어요.
        </div>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
