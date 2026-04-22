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

export default function Login({ onToggle }: LoginProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
            : result.error.includes("Internal server error")
              ? "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
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

  return (
    <div>
      {serverError && (
        <div className="blessing-notice blessing-notice-error">{serverError}</div>
      )}
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
