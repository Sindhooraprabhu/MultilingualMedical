import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log('Login Success:', decoded);
            
            // Store user info in local storage (basic implementation)
            localStorage.setItem('user', JSON.stringify(decoded));
            localStorage.setItem('token', credentialResponse.credential);
            
            // Redirect to dashboard
            navigate('/');
        } catch (err) {
            setError('Failed to process login');
        }
    };

    const handleError = () => {
        setError('Google Login Failed');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl mb-4">
                        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">Meditech AI</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Multilingual Clinical Workflow System
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={handleError}
                            theme="filled_blue"
                            size="large"
                            text="signin_with"
                            shape="pill"
                        />
                        
                        <div className="flex items-center w-full gap-4">
                            <div className="flex-1 h-px bg-slate-700"></div>
                            <span className="text-slate-500 text-xs uppercase font-medium">or</span>
                            <div className="flex-1 h-px bg-slate-700"></div>
                        </div>

                        <button 
                            onClick={() => {
                                const guestUser = { name: 'Dr. Guest', email: 'guest@meditech.ai', picture: null };
                                localStorage.setItem('user', JSON.stringify(guestUser));
                                navigate('/');
                            }}
                            className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all border border-slate-600 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Continue as Guest
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500">
                        Authorized medical staff only. By signing in, you agree to the terms of service and privacy policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
