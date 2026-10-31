'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlannerStore } from '../store/usePlannerStore';

export function useAuthGuard() {
  const router = useRouter();
  const { currentUser, login } = usePlannerStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check memory state first
    if (currentUser && currentUser.email === 'testuser@axion.com') {
      setIsAuthorized(true);
      return;
    }

    // Check localStorage fallback
    const saved = localStorage.getItem('axion_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email === 'testuser@axion.com') {
          login(parsed);
          setIsAuthorized(true);
          return;
        }
      } catch {
        localStorage.removeItem('axion_auth_user');
      }
    }

    // Not authenticated -> redirect to login
    setIsAuthorized(false);
    router.replace('/login');
  }, [currentUser, login, router]);

  return { isAuthorized, currentUser };
}
