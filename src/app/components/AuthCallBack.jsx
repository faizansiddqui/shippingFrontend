"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from "@/utils/api";

const AuthCallback = () => {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/profile`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('refreshExpires', Date.now() + 15 * 24 * 60 * 60 * 1000);
                    router.push('/dashboard');
                } else {
                    router.push('/login');
                }
            } catch (err) {
                console.error('Auth check error:', err);
                router.push('/login');
            }
        };

        checkAuth();
    }, [router]);

    return (
        <div className="h-screen flex justify-center items-center">
            <p>Loading...</p>
        </div>
    );
};

export default AuthCallback;
