"use client";
import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useTheme } from "@/context/ThemeContext";

interface LoginFormData {
    email: string;
    password: string;
}

interface LoginProps {
    onToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<LoginProps> = ({ onToggle }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();
    const { data: session } = useSession();
    const { theme } = useTheme();
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
                setServerError(result.error);
            } else {
                window.location.href = "/";
            }
        } catch (error: any) {
            setServerError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignIn = async () => {
        await signIn("google");
        onToggle(true);
    };

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-8 w-full max-w-md mx-auto mt-10`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mb-6 text-center`}>로그인</h2>
            {serverError && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong className="font-bold">에러!</strong>
                    <span className="block sm:inline ml-2">{serverError}</span>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                            이메일 주소
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register("email", { required: "이메일은 필수 입력입니다." })}
                            className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'focus:bg-gray-700' : 'focus:bg-white'}`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                            비밀번호
                        </label>
                        <input
                            id="password"
                            type="password"
                            {...register("password", { required: "비밀번호는 필수 입력입니다." })}
                            className={`mt-1 block w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'focus:bg-gray-700' : 'focus:bg-white'}`}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "로그인 중..." : "로그인"}
                    </button>
                    <button
                        type="button"
                        onClick={handleSocialSignIn}
                        className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded"
                    >
                        Google으로 로그인
                    </button>
                    <div className="flex justify-center space-x-1">
                        <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>아직 계정이 없으신가요?</p>
                        <button
                            type="button"
                            onClick={() => onToggle(true)}
                            className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'} hover:underline`}
                        >
                            회원가입
                        </button>
                    </div>
                    {session && (
                        <button
                            type="button"
                            onClick={() => signOut()}
                            className={`w-full py-2 px-4 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} font-medium rounded`}
                        >
                            로그아웃
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Login;
