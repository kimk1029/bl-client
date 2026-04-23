"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { toast } from "sonner";
import Avatar from "@/components/common/Avatar";
import UserLink from "@/components/users/UserLink";
import { formatTimeAgo } from "@/components/home/lib/postAdapters";
import type { Comment } from "@/types/type";

const commentsFetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("fetch fail");
    return res.json();
  });

interface CommentsProps {
  postId: number;
  postAuthorId?: number | null;
  commentCount: number;
}

type NestedComment = Comment & { replies: Comment[] };

function buildTree(list: Comment[]): NestedComment[] {
  const map = new Map<number, NestedComment>();
  list.forEach((c) =>
    map.set(c.id, { ...c, replies: Array.isArray(c.replies) ? [...c.replies] : [] }),
  );
  const roots: NestedComment[] = [];
  list.forEach((c) => {
    const node = map.get(c.id)!;
    const pid = (c as Comment & { parentId?: number | null; parent_id?: number | null })
      .parentId ??
      (c as Comment & { parent_id?: number | null }).parent_id ??
      null;
    if (pid) {
      const parent = map.get(Number(pid));
      if (parent) parent.replies.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

interface CommentRowProps {
  c: Comment;
  postAuthorId?: number | null;
  nested?: boolean;
  onReply: (id: number) => void;
}

function CommentRow({ c, postAuthorId, nested, onReply }: CommentRowProps) {
  const name = c.author?.username ?? "익명";
  const isOp = postAuthorId != null && c.author?.id === postAuthorId;
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const [reporting, setReporting] = useState(false);

  const onReport = async () => {
    if (!token) {
      toast.error("로그인 후 신고할 수 있어요.");
      return;
    }
    if (reporting) return;
    setReporting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_type: "comment",
          target_id: c.id,
          reason: "inappropriate",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "신고 실패");
      toast.success(
        json.duplicate
          ? "이미 접수된 신고예요."
          : "신고가 접수되었어요.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "신고 실패");
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className={`blessing-comment${nested ? " blessing-comment-nested" : ""}`}>
      <Avatar name={name} size={30} seed={c.id} />
      <div className="blessing-comment-body">
        <div className="blessing-comment-head">
          <UserLink
            userId={c.author?.id ?? null}
            username={name}
            className="blessing-comment-name"
            disabled={!c.author}
          >
            {name}
          </UserLink>
          {isOp && <span className="blessing-comment-op">작성자</span>}
          <span className="blessing-comment-time">
            · {formatTimeAgo(c.created_at)}
          </span>
        </div>
        <div className="blessing-comment-text">{c.content}</div>
        <div className="blessing-comment-actions">
          <button type="button" onClick={() => onReply(c.id)}>답글</button>
          <button type="button" onClick={onReport} disabled={reporting}>
            {reporting ? "처리 중…" : "신고"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Comments({
  postId,
  postAuthorId,
  commentCount,
}: CommentsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const url = `/api/posts/${postId}/comments`;
  const { data, mutate, isLoading } = useSWR<Comment[]>(url, commentsFetcher);

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tree = useMemo(() => (data ? buildTree(data) : []), [data]);
  const flat = (t: NestedComment[]): Array<{ c: Comment; nested: boolean }> => {
    const out: Array<{ c: Comment; nested: boolean }> = [];
    t.forEach((n) => {
      out.push({ c: n, nested: false });
      n.replies.forEach((r) => out.push({ c: r, nested: true }));
    });
    return out;
  };
  const rows = flat(tree);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!session || !token) {
      toast.error("로그인 후 댓글을 작성할 수 있어요.");
      router.push("/auth");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: text.trim(),
          parentId: replyTo,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setText("");
      setReplyTo(null);
      mutate();
      toast.success("댓글이 등록되었습니다.");
    } catch {
      toast.error("댓글 등록에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="blessing-comment-section-head">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3V6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        댓글{" "}
        <span className="blessing-comment-count-num">
          {data?.length ?? commentCount ?? 0}
        </span>
      </div>

      <div className="blessing-comment-list">
        {isLoading && !data ? (
          <div className="blessing-loading">
            <div className="blessing-spinner" aria-label="Loading" />
          </div>
        ) : rows.length === 0 ? (
          <div className="blessing-comment-empty">
            아직 댓글이 없어요. 첫 댓글을 남겨보세요.
          </div>
        ) : (
          rows.map((row) => (
            <CommentRow
              key={row.c.id}
              c={row.c}
              postAuthorId={postAuthorId}
              nested={row.nested}
              onReply={(id) => {
                setReplyTo(id);
                const el = document.getElementById("blessing-comment-input");
                el?.focus();
              }}
            />
          ))
        )}
      </div>

      <form className="blessing-comment-compose" onSubmit={onSubmit}>
        <Avatar name={session?.user?.name ?? "나"} size={28} seed={99} />
        <input
          id="blessing-comment-input"
          type="text"
          placeholder={
            replyTo != null
              ? "답글을 입력하세요..."
              : "댓글을 입력하세요..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {replyTo != null && (
          <button
            type="button"
            className="blessing-comment-reply-cancel"
            onClick={() => setReplyTo(null)}
            aria-label="답글 취소"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="blessing-comment-submit"
          disabled={submitting || !text.trim()}
        >
          등록
        </button>
      </form>
    </>
  );
}
