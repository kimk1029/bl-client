"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { createApiUrl } from "@/utils/apiConfig";
import ChurchSearch from "@/components/ChurchSearch";

interface SignUpProps {
  onToggle: () => void;
  email?: string;
}

interface SignUpFormData {
  username: string;
  email: string;
  password: string;
}

export default function SignUp({ onToggle, email }: SignUpProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [churchName, setChurchName] = useState("");
  const [churchId, setChurchId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<SignUpFormData>({ defaultValues: { email: email || "" } });

  const { data: session } = useSession();

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    if (isEmailAvailable === false || isUsernameAvailable === false) {
      setServerError("이메일 또는 유저네임이 이미 사용 중입니다.");
      setIsLoading(false);
      return;
    }

    try {
      if (isUsernameAvailable == null) {
        const resUser = await axios.post(createApiUrl("/auth/check-username"), {
          username: data.username,
        });
        if (resUser.data?.exists) {
          setServerError("유저네임이 이미 사용 중입니다.");
          setIsLoading(false);
          setIsUsernameAvailable(false);
          return;
        } else {
          setIsUsernameAvailable(true);
        }
      }
      if (!session?.user?.email && isEmailAvailable == null) {
        const resEmail = await axios.post(createApiUrl("/auth/check-email"), {
          email: data.email,
        });
        if (resEmail.data?.exists) {
          setServerError("이메일이 이미 사용 중입니다.");
          setIsLoading(false);
          setIsEmailAvailable(false);
          return;
        } else {
          setIsEmailAvailable(true);
        }
      }
    } catch {
      setServerError("중복 검사 중 오류가 발생했습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(createApiUrl("/auth/register"), {
        ...data,
        affiliation: churchName || null,
        church_id: churchId,
      });
      if (response.status === 201) {
        setSuccessMessage("회원가입이 성공적으로 완료되었습니다!");
        reset();
        setIsEmailAvailable(null);
        setIsUsernameAvailable(null);
      } else {
        setServerError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch {
      setServerError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailDuplicate = async () => {
    const emailValue = getValues("email");
    if (!emailValue) {
      setServerError("이메일을 입력해주세요.");
      return;
    }
    setEmailCheckLoading(true);
    setIsEmailAvailable(null);
    setServerError(null);
    try {
      const response = await axios.post(createApiUrl("/auth/check-email"), {
        email: emailValue,
      });
      setIsEmailAvailable(!response.data.exists);
    } catch {
      setServerError("이메일 중복 검사 중 오류가 발생했습니다.");
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const checkUsernameDuplicate = async () => {
    const usernameValue = getValues("username");
    if (!usernameValue) {
      setServerError("유저네임을 입력해주세요.");
      return;
    }
    setUsernameCheckLoading(true);
    setIsUsernameAvailable(null);
    setServerError(null);
    try {
      const response = await axios.post(createApiUrl("/auth/check-username"), {
        username: usernameValue,
      });
      setIsUsernameAvailable(!response.data.exists);
    } catch {
      setServerError("유저네임 중복 검사 중 오류가 발생했습니다.");
    } finally {
      setUsernameCheckLoading(false);
    }
  };

  const checkLabel = (ok: boolean | null, loading: boolean) =>
    loading ? "확인중" : ok === true ? "사용 가능" : ok === false ? "사용 불가" : "중복 검사";

  const checkClass = (ok: boolean | null) =>
    `blessing-field-suffix-btn ${ok === true ? "blessing-field-suffix-btn-ok" : ok === false ? "blessing-field-suffix-btn-bad" : ""}`;

  return (
    <div>
      {serverError && (
        <div className="blessing-notice blessing-notice-error">{serverError}</div>
      )}
      {successMessage && (
        <div className="blessing-notice blessing-notice-success">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="blessing-field">
          <label htmlFor="username" className="blessing-field-label">유저네임</label>
          <div className="blessing-field-input-row">
            <input
              id="username"
              type="text"
              placeholder="유저네임 입력"
              className="blessing-field-input"
              {...register("username", { required: "유저네임은 필수 입력입니다." })}
            />
            <button
              type="button"
              onClick={checkUsernameDuplicate}
              disabled={usernameCheckLoading}
              className={checkClass(isUsernameAvailable)}
            >
              {checkLabel(isUsernameAvailable, usernameCheckLoading)}
            </button>
          </div>
          {errors.username && (
            <p className="blessing-field-error">{errors.username.message}</p>
          )}
        </div>

        <div className="blessing-field">
          <label htmlFor="email" className="blessing-field-label">이메일</label>
          <div className="blessing-field-input-row">
            <input
              id="email"
              type="email"
              disabled={Boolean(session?.user?.email)}
              placeholder="name@example.com"
              className="blessing-field-input"
              {...register("email", { required: "이메일은 필수 입력입니다." })}
            />
            <button
              type="button"
              onClick={checkEmailDuplicate}
              disabled={emailCheckLoading || Boolean(session?.user?.email)}
              className={checkClass(isEmailAvailable)}
            >
              {checkLabel(isEmailAvailable, emailCheckLoading)}
            </button>
          </div>
          {errors.email && (
            <p className="blessing-field-error">{errors.email.message}</p>
          )}
        </div>

        <div className="blessing-field">
          <label className="blessing-field-label">
            교회 <span className="blessing-field-label-sub">(선택)</span>
          </label>
          <ChurchSearch
            onChange={(name, id) => {
              setChurchName(name);
              setChurchId(id);
            }}
          />
          {churchId && <p className="blessing-field-hint blessing-field-hint-ok">✓ 교회가 선택되었습니다</p>}
        </div>

        <div className="blessing-field">
          <label htmlFor="password" className="blessing-field-label">비밀번호</label>
          <div className="blessing-field-input-row">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="blessing-field-input"
              {...register("password", { required: "비밀번호는 필수 입력입니다." })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="blessing-field-suffix-btn"
              style={{ background: "var(--blessing-bg-2)", color: "var(--blessing-fg-1)" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
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
          {isLoading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <div className="blessing-auth-switch">
        이미 회원이신가요?
        <button type="button" onClick={onToggle} className="blessing-auth-switch-btn">
          로그인
        </button>
      </div>
    </div>
  );
}
