"use client";

import { useState } from "react";
import { DetailHeader } from "@/components/layout/DetailHeader";

interface FaqItem {
  q: string;
  a: string;
}

const FAQ: FaqItem[] = [
  {
    q: "교회 인증은 어떻게 하나요?",
    a: "프로필 › 교회 인증에서 소속 교회를 검색하고, 재직 증빙 또는 담당자 승인 절차로 인증됩니다. 인증된 성도에게만 열리는 피드/셀/쪽지 기능이 있어요.",
  },
  {
    q: "익명으로 글을 쓸 수 있나요?",
    a: "기도제목·익명 고민 상담 등 일부 토픽에서 익명 작성이 가능합니다. 글쓰기 화면 하단 '익명' 토글을 켜면 작성자가 '🫂 익명'으로 표시돼요.",
  },
  {
    q: "셀/목장은 어떤 차이가 있나요?",
    a: "기능적으로는 동일합니다. 교회마다 부르는 이름이 달라 '셀'과 '목장' 중에서 직접 선택할 수 있도록 했어요. 만들 때 '목장 만들기'에서 타입을 고르면 됩니다.",
  },
  {
    q: "알림은 어디서 설정하나요?",
    a: "현재 기본 알림(댓글, 답글, 팔로우, 쪽지)이 켜져 있으며 세부 설정은 순차적으로 열어가고 있습니다.",
  },
  {
    q: "불쾌한 글/댓글은 어떻게 처리되나요?",
    a: "각 글/댓글의 '신고' 버튼으로 운영팀에 신고할 수 있어요. 동일 대상에 대해 24시간 내 중복 신고는 자동 접수되며, 운영팀 검토 후 비공개·삭제·경고 등의 조치가 진행됩니다.",
  },
  {
    q: "계정 삭제는 어디서 하나요?",
    a: "프로필 › 편집 화면 하단의 '계정 삭제' 버튼으로 진행할 수 있습니다. 삭제 시 작성한 글·댓글·쪽지가 모두 함께 삭제되며 복구되지 않아요.",
  },
];

export default function FaqSettingsPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="blessing-detail">
      <DetailHeader title="고객센터 · FAQ" subtitle="Support & FAQ" />

      <div className="blessing-settings-body">
        <div className="blessing-settings-section">
          <div className="blessing-settings-section-title">자주 묻는 질문</div>
          <ol className="blessing-faq-list">
            {FAQ.map((item, i) => {
              const active = open === i;
              return (
                <li key={i} className="blessing-faq-item">
                  <button
                    type="button"
                    className={`blessing-faq-q${active ? " blessing-faq-q-on" : ""}`}
                    onClick={() => setOpen(active ? null : i)}
                    aria-expanded={active}
                  >
                    <span className="blessing-faq-q-num">Q{i + 1}.</span>
                    <span className="blessing-faq-q-text">{item.q}</span>
                    <span
                      className={`blessing-faq-q-chev${active ? " blessing-faq-q-chev-on" : ""}`}
                      aria-hidden
                    >
                      ›
                    </span>
                  </button>
                  {active && <div className="blessing-faq-a">{item.a}</div>}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="blessing-settings-section">
          <div className="blessing-settings-section-title">문의하기</div>
          <a
            className="blessing-settings-row blessing-settings-row-link"
            href="mailto:support@blessing.app?subject=blessing%20%EB%AC%B8%EC%9D%98"
          >
            <span>✉️ 이메일 문의</span>
            <span className="blessing-settings-row-hint">
              support@blessing.app
            </span>
          </a>
          <div className="blessing-settings-row">
            <span>📣 공지사항</span>
            <span className="blessing-settings-row-hint">홈 상단 티커</span>
          </div>
        </div>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
