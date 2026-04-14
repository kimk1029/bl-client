"use client";
import React, { useState } from "react";
import SignUp from "./sign-up";
import Login from "./login";
import { useTheme } from "@/context/ThemeContext";

const AuthForm: React.FC = () => {
    const [toggleLogin, setToggleLogin] = useState(false);
    const { theme } = useTheme();

    return (
        <div className="w-full flex justify-center pt-6 pb-12">
            <div className="max-w-md w-full px-4">
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {toggleLogin ? '회원가입' : '로그인'}
                        </h1>
                        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            모든 기능을 즐겨보세요 ✌️
                        </p>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-xl p-6`}>
                        {toggleLogin ? (
                            <SignUp onToggle={() => setToggleLogin(!toggleLogin)} />
                        ) : (
                            <Login onToggle={() => setToggleLogin(!toggleLogin)} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
