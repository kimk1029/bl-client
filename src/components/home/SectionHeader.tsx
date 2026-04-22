import Link from "next/link";

interface Props {
  icon?: string;
  title: string;
  en?: string;
  count?: number;
  moreHref?: string;
}

export default function SectionHeader({ icon, title, en, count, moreHref }: Props) {
  return (
    <div className="blessing-section-header">
      <div className="blessing-section-title-wrap">
        {icon && <span className="blessing-section-icon">{icon}</span>}
        <div>
          <div className="blessing-section-title">{title}</div>
          {en && <div className="blessing-section-en">{en}</div>}
        </div>
        {count !== undefined && <span className="blessing-section-count">{count}</span>}
      </div>
      {moreHref && (
        <Link href={moreHref} className="blessing-section-more">
          전체 →
        </Link>
      )}
    </div>
  );
}
