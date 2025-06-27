// hooks/useAuth.js
import jwt from 'jsonwebtoken'; // or your JWT library
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('loginToken');
      const publicAuthPages = [
        '/auth/login',
        '/signup/signup',
        '/forgot-password',
        "/auth/verify-otp",
        "/auth/reset-password",
        "/auth/forgot-password-otp"
      ];

      const isPublicPage = publicAuthPages.includes(router.pathname);

      // Strong validation function
      const validateToken = (token) => {
        if (!token) return false;

        try {
          // Verify token signature and expiration
          const decoded = jwt.decode(token);
          if (!decoded) return false;

          // Additional checks (customize based on your token structure)
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            localStorage.removeItem('loginToken');
            return false;
          }

          // Check for required token fields
          if (!decoded.id || !decoded.role || !decoded.email) {
            return false;
          }

          return true;
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('loginToken');
          return false;
        }
      };

      const isValidToken = validateToken(token);

      // Redirect logic
      if (!isValidToken && !isPublicPage) {
        localStorage.removeItem('loginToken');
        router.push('/auth/login');
        return;
      }

      if (isValidToken && isPublicPage) {
        router.push('/');
        return;
      }

      // Optional: Token refresh logic could be added here
    }
  }, [router.pathname]);
}
