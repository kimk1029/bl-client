"use client";
import React, { useState } from "react";
import SignUp from "./sign-up";
import Login from "./login";

export default function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="blessing-auth-wrap">
      <div className="blessing-auth-header">
        <h1 className="blessing-auth-title">
          {showSignUp ? "회원가입" : "로그인"}
        </h1>
        <p className="blessing-auth-subtitle">
          {showSignUp
            ? "블레싱과 함께 시작해보세요 ✨"
            : "다시 오신 것을 환영합니다 👋"}
        </p>
      </div>
      <div className="blessing-auth-card">
        {showSignUp ? (
          <SignUp onToggle={() => setShowSignUp(false)} />
        ) : (
          <Login onToggle={() => setShowSignUp(true)} />
        )}
      </div>
    </div>
  );
}
