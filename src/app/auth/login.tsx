"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginProps {
  onToggle: () => void;
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3C7.03 3 3 6.36 3 10.5c0 2.66 1.69 5 4.24 6.35l-.97 3.57 4.15-2.75c.5.07 1.02.11 1.58.11 4.97 0 9-3.36 9-7.5S16.97 3 12 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"
        fill="currentColor"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Login({ onToggle }: LoginProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        const msg =
          result.error === "CredentialsSignin"
            ? "이메일 또는 비밀번호가 올바르지 않습니다."
            : result.error;
        setServerError(msg);
      } else if (result?.ok) {
        window.location.href = "/";
      } else {
        setServerError("알 수 없는 오류가 발생했습니다.");
      }
    } catch {
      setServerError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = async (provider: "kakao" | "naver" | "google") => {
    setSocialLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div>
      {serverError && (
        <div className="blessing-notice blessing-notice-error">{serverError}</div>
      )}

      {/* ── 소셜 로그인 ── */}
      <div className="blessing-social-btns">
        <button
          type="button"
          className="blessing-social-btn blessing-social-btn-kakao"
          onClick={() => handleSocial("kakao")}
          disabled={!!socialLoading}
        >
          <KakaoIcon />
          {socialLoading === "kakao" ? "연결 중..." : "카카오로 로그인"}
        </button>
        <button
          type="button"
          className="blessing-social-btn blessing-social-btn-naver"
          onClick={() => handleSocial("naver")}
          disabled={!!socialLoading}
        >
          <NaverIcon />
          {socialLoading === "naver" ? "연결 중..." : "네이버로 로그인"}
        </button>
        <button
          type="button"
          className="blessing-social-btn blessing-social-btn-google"
          onClick={() => handleSocial("google")}
          disabled={!!socialLoading}
        >
          <GoogleIcon />
          {socialLoading === "google" ? "연결 중..." : "구글로 로그인"}
        </button>
      </div>

      <div className="blessing-auth-divider">
        <span>또는 이메일로 로그인</span>
      </div>

      {/* ── 이메일/비밀번호 ── */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="blessing-field">
          <label htmlFor="email" className="blessing-field-label">
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="blessing-field-input"
            {...register("email", { required: "이메일을 입력해주세요." })}
          />
          {errors.email && (
            <p className="blessing-field-error">{errors.email.message}</p>
          )}
        </div>

        <div className="blessing-field">
          <label htmlFor="password" className="blessing-field-label">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="blessing-field-input"
            {...register("password", { required: "비밀번호를 입력해주세요." })}
          />
          {errors.password && (
            <p className="blessing-field-error">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="blessing-btn-primary"
          style={{ width: "100%", marginTop: 6 }}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="blessing-auth-switch">
        아직 계정이 없으신가요?
        <button type="button" onClick={onToggle} className="blessing-auth-switch-btn">
          회원가입
        </button>
      </div>
    </div>
  );
}
