import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { apiClient } from '../../../core/api/apiClient';
import type { ApiResponse, UserPublic } from '@jurismind/shared-types';

export const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      if (!accessToken) {
        navigate('/login?error=oauth_failed', { replace: true });
        return;
      }

      try {
        const response = await apiClient.get<ApiResponse<{ user: UserPublic }>>('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setSession(response.data.data.user, accessToken);
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login?error=oauth_failed', { replace: true });
        }
      } catch {
        navigate('/login?error=oauth_failed', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, setSession, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--color-bg-primary, #090d16)',
        color: 'var(--color-text-primary, #f8fafc)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
          Completing Google Sign In...
        </p>
      </div>
    </div>
  );
};
