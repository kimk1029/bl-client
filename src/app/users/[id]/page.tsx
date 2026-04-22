"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import PostRow from "@/components/home/PostRow";
import UserMenu from "@/components/users/UserMenu";
import type { Post } from "@/types/type";

interface PublicUser {
  id: number;
  username: string;
  affiliation: string | null;
  points: number;
  level: number;
  created_at: string;
  counts: {
    posts: number;
    comments: number;
    followers: number;
    following: number;
  };
  relation: {
    isMe: boolean;
    followed: boolean;
    blocked: boolean;
    blockedMe: boolean;
  };
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconMore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <circle cx="19" cy="12" r="1.7" fill="currentColor" />
    </svg>
  );
}

const tokenFetcher = async (url: string, token?: string | null) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return res.json();
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PublicUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const userId = Number(id);
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  const { data: user, mutate: mutateUser, error } = useSWR<PublicUser>(
    Number.isFinite(userId) ? `/api/users/${userId}` : null,
    (u: string) => tokenFetcher(u, token),
  );
  const { data: posts } = useSWR<Post[]>(
    Number.isFinite(userId) ? `/api/users/${userId}/posts` : null,
    (u: string) => fetch(u).then((r) => (r.ok ? r.json() : [])),
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  if (!Number.isFinite(userId)) {
    return (
      <div className="blessing-home">
        <div className="blessing-event-detail-missing" style={{ minHeight: 240 }}>
          <div>잘못된 사용자입니다.</div>
          <Link href="/" className="blessing-section-more">← 홈으로</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blessing-home">
        <div className="blessing-event-detail-missing" style={{ minHeight: 240 }}>
          <div>프로필을 불러올 수 없어요.</div>
          <Link href="/" className="blessing-section-more">← 홈으로</Link>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="blessing-home">
        <div className="blessing-loading">
          <div className="blessing-spinner" aria-label="Loading" />
        </div>
      </div>
    );
  }

  const onFollow = async () => {
    if (!token) {
      toast.error("로그인 후 이용해 주세요.");
      router.push("/auth");
      return;
    }
    if (followBusy || user.relation.isMe) return;
    setFollowBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetId: user.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "실패");
      }
      const json = (await res.json()) as { followed: boolean; followers: number };
      await mutateUser(
        (prev) =>
          prev
            ? {
                ...prev,
                relation: { ...prev.relation, followed: json.followed },
                counts: { ...prev.counts, followers: json.followers },
              }
            : prev,
        { revalidate: false },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "요청 실패");
    } finally {
      setFollowBusy(false);
    }
  };

  const goDM = () => router.push(`/messages/${user.id}`);

  return (
    <div className="blessing-detail">
      <header className="blessing-detail-topbar">
        <button
          type="button"
          className="blessing-detail-icon-btn"
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <IconBack />
        </button>
        <div className="blessing-detail-topbar-title-wrap">
          <div className="blessing-dm-title">{user.username}</div>
          <div className="blessing-dm-subtitle">Profile</div>
        </div>
        <div className="blessing-detail-topbar-actions">
          <button
            type="button"
            className="blessing-detail-icon-btn"
            aria-label="더보기"
            onClick={() => setMenuOpen(true)}
          >
            <IconMore />
          </button>
        </div>
      </header>

      <div className="blessing-profile-head">
        <Avatar name={user.username} seed={user.id} size={72} />
        <div className="blessing-profile-name-line">
          <span className="blessing-profile-name">{user.username}</span>
          {user.affiliation && (
            <span className="blessing-verify-badge">✓ {user.affiliation}</span>
          )}
        </div>
        <div className="blessing-profile-joined">
          블레싱 가입 · {formatDate(user.created_at)}
        </div>
        {!user.relation.isMe && (
          <div
            className="blessing-user-head-actions"
            style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}
          >
            <button
              type="button"
              className={`blessing-btn-primary${user.relation.followed ? " blessing-btn-primary-on" : ""}`}
              onClick={onFollow}
              disabled={followBusy || user.relation.blocked || user.relation.blockedMe}
              style={{ minWidth: 120 }}
            >
              {user.relation.followed ? "팔로우 중" : "팔로우"}
            </button>
            <button
              type="button"
              className="blessing-btn-secondary"
              onClick={goDM}
              disabled={user.relation.blocked || user.relation.blockedMe}
              style={{ minWidth: 120 }}
            >
              ✉ 쪽지
            </button>
          </div>
        )}
        {(user.relation.blocked || user.relation.blockedMe) && (
          <div
            style={{
              marginTop: 10,
              fontSize: 11.5,
              color: "var(--blessing-fg-2)",
            }}
          >
            {user.relation.blocked
              ? "내가 차단한 사용자예요. 프로필 시트에서 해제할 수 있어요."
              : "이 사용자가 나를 차단했어요."}
          </div>
        )}
      </div>

      <div className="blessing-profile-stats">
        <Link
          href={`/users/${user.id}#posts`}
          className="blessing-profile-stat"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="blessing-stat-num">{user.counts.posts}</div>
          <div className="blessing-stat-label">작성 글</div>
        </Link>
        <div className="blessing-profile-stat">
          <div className="blessing-stat-num">{user.counts.comments}</div>
          <div className="blessing-stat-label">댓글</div>
        </div>
        <Link
          href={`/users/${user.id}/follows?tab=followers`}
          className="blessing-profile-stat"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="blessing-stat-num">{user.counts.followers}</div>
          <div className="blessing-stat-label">팔로워</div>
        </Link>
        <Link
          href={`/users/${user.id}/follows?tab=following`}
          className="blessing-profile-stat"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="blessing-stat-num">{user.counts.following}</div>
          <div className="blessing-stat-label">팔로잉</div>
        </Link>
      </div>

      <div
        id="posts"
        className="blessing-section-header"
        style={{ scrollMarginTop: 60 }}
      >
        <div className="blessing-section-title-wrap">
          <div>
            <div className="blessing-section-title">작성한 글</div>
            <div className="blessing-section-en">POSTS · {posts?.length ?? 0}</div>
          </div>
        </div>
      </div>
      <div className="blessing-hot-list">
        {!posts ? (
          <div className="blessing-loading">
            <div className="blessing-spinner" aria-label="Loading" />
          </div>
        ) : posts.length === 0 ? (
          <div className="blessing-comment-empty">
            아직 작성한 글이 없어요.
          </div>
        ) : (
          posts.map((p) => <PostRow key={p.id} post={p} />)
        )}
      </div>

      <UserMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        userId={user.id}
        username={user.username}
        affiliation={user.affiliation}
      />
      <div style={{ height: 40 }} />
    </div>
  );
}
