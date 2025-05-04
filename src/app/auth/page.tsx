"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import SignUp from "./sign-up";
import Login from "./login";
import { useTheme } from "@/context/ThemeContext";

const AuthForm: React.FC = () => {
    const [toggleLogin, setToggleLogin] = useState(false);
    const { data: session } = useSession();
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-md w-full mx-auto py-12 px-6">
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {toggleLogin ? '회원가입' : '로그인'}
                        </h1>
                        <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            모든 기능을 즐겨보세요 ✌️
                        </p>
                        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            세션 만료: {session?.expires || 'N/A'}
                        </p>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-xl p-8`}>
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
