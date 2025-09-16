import React, { Dispatch, SetStateAction, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from "@/context/ThemeContext";
import { createApiUrl } from "@/utils/apiConfig";

interface SignUpProps {
    onToggle: Dispatch<SetStateAction<boolean>>;
    email?: string;
}

interface SignUpFormData {
    username: string;
    email: string;
    password: string;
}

const SignUp: React.FC<SignUpProps> = ({ onToggle, email }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { theme } = useTheme();

    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [emailCheckLoading, setEmailCheckLoading] = useState(false);
    const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        getValues,
    } = useForm<SignUpFormData>({ defaultValues: { email: email || '' } });

    const { data: session } = useSession();

    const onSubmit = async (data: SignUpFormData) => {
        setIsLoading(true);
        setServerError(null);
        setSuccessMessage(null);

        // 사전 중복 검사: 이메일/유저네임 버튼을 누르지 않아도 서버로 확인
        if (isEmailAvailable === false || isUsernameAvailable === false) {
            setServerError('이메일 또는 유저네임이 이미 사용 중입니다.');
            setIsLoading(false);
            return;
        }

        try {
            // Username 자동 중복 확인
            if (isUsernameAvailable == null) {
                const resUser = await axios.post(createApiUrl('/auth/check-username'), { username: data.username });
                if (resUser.data?.exists) {
                    setServerError('유저네임이 이미 사용 중입니다.');
                    setIsLoading(false);
                    setIsUsernameAvailable(false);
                    return;
                } else {
                    setIsUsernameAvailable(true);
                }
            }
            // Email 자동 중복 확인 (이메일 입력 가능한 경우만)
            if (!session?.user?.email && isEmailAvailable == null) {
                const resEmail = await axios.post(createApiUrl('/auth/check-email'), { email: data.email });
                if (resEmail.data?.exists) {
                    setServerError('이메일이 이미 사용 중입니다.');
                    setIsLoading(false);
                    setIsEmailAvailable(false);
                    return;
                } else {
                    setIsEmailAvailable(true);
                }
            }
        } catch (err) {
            console.error('Pre-check Error:', err);
            setServerError('중복 검사 중 오류가 발생했습니다.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                createApiUrl('/auth/register'),
                data
            );
            if (response.status === 201) {
                setSuccessMessage('회원가입이 성공적으로 완료되었습니다!');
                reset();
                setIsEmailAvailable(null);
                setIsUsernameAvailable(null);
            } else {
                setServerError('회원가입에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('SignUp Error:', error);
            setServerError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleLogin = () => onToggle(false);

    const checkEmailDuplicate = async () => {
        const emailValue = getValues('email');
        if (!emailValue) { setServerError('이메일을 입력해주세요.'); return; }
        setEmailCheckLoading(true);
        setIsEmailAvailable(null);
        setServerError(null);
        try {
            const response = await axios.post(
                createApiUrl('/auth/check-email'),
                { email: emailValue }
            );
            setIsEmailAvailable(!response.data.exists);
        } catch (error) {
            console.error('Check Email Error:', error);
            setServerError('이메일 중복 검사 중 오류가 발생했습니다.');
        } finally { setEmailCheckLoading(false); }
    };

    const checkUsernameDuplicate = async () => {
        const usernameValue = getValues('username');
        if (!usernameValue) { setServerError('유저네임을 입력해주세요.'); return; }
        setUsernameCheckLoading(true);
        setIsUsernameAvailable(null);
        setServerError(null);
        try {
            const response = await axios.post(
                createApiUrl('/auth/check-username'),
                { username: usernameValue }
            );
            setIsUsernameAvailable(!response.data.exists);
        } catch (error) {
            console.error('Check Username Error:', error);
            setServerError('유저네임 중복 검사 중 오류가 발생했습니다.');
        } finally { setUsernameCheckLoading(false); }
    };

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-8 w-full max-w-md mx-auto mt-10`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                회원가입
            </h2>
            {serverError && (
                <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong className="font-semibold">에러!</strong>
                    <span className="ml-2">{serverError}</span>
                </div>
            )}
            {successMessage && (
                <div className="mt-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <strong className="font-semibold">성공!</strong>
                    <span className="ml-2">{successMessage}</span>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
                {/* Username */}
                <div>
                    <label htmlFor="username" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                        유저네임
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="username"
                            type="text"
                            placeholder="유저네임 입력"
                            {...register('username', { required: '유저네임은 필수 입력입니다.' })}
                            className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'focus:bg-gray-700' : 'focus:bg-white'}`}
                        />
                        <button
                            type="button"
                            onClick={checkUsernameDuplicate}
                            disabled={usernameCheckLoading}
                            className={`absolute inset-y-0 right-0 px-3 rounded-r-md text-sm font-medium focus:outline-none ${isUsernameAvailable === true ? 'bg-green-500 text-white hover:bg-green-600' :
                                isUsernameAvailable === false ? 'bg-red-500 text-white hover:bg-red-600' :
                                    'bg-teal-500 text-white hover:bg-teal-600'} ${usernameCheckLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUsernameAvailable === true ? '사용 가능' : isUsernameAvailable === false ? '사용 불가' : '중복 검사'}
                        </button>
                    </div>
                    {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                        이메일 주소
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="email"
                            type="email"
                            disabled={Boolean(session?.user?.email)}
                            placeholder="이메일 입력"
                            {...register('email', { required: '이메일은 필수 입력입니다.' })}
                            className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'focus:bg-gray-700' : 'focus:bg-white'}`}
                        />
                        <button
                            type="button"
                            onClick={checkEmailDuplicate}
                            disabled={emailCheckLoading || Boolean(session?.user?.email)}
                            className={`absolute inset-y-0 right-0 px-3 rounded-r-md text-sm font-medium focus:outline-none ${isEmailAvailable === true ? 'bg-green-500 text-white hover:bg-green-600' :
                                isEmailAvailable === false ? 'bg-red-500 text-white hover:bg-red-600' :
                                    'bg-teal-500 text-white hover:bg-teal-600'} ${emailCheckLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isEmailAvailable === true ? '사용 가능' : isEmailAvailable === false ? '사용 불가' : '중복 검사'}
                        </button>
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                        비밀번호
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="비밀번호 입력"
                            {...register('password', { required: '비밀번호는 필수 입력입니다.' })}
                            className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'focus:bg-gray-700' : 'focus:bg-white'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(s => !s)}
                            className={`absolute inset-y-0 right-0 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} focus:outline-none`}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? '가입 중...' : '회원가입'}
                </button>

                <div className="pt-6 flex justify-center space-x-1 text-sm">
                    <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>이미 회원이신가요?</p>
                    <button onClick={toggleLogin} className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'} hover:underline focus:outline-none`}>
                        로그인
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;
