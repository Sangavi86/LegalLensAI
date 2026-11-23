import React from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import '../../../styles/auth.css';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary, #090d16)',
        color: 'var(--color-text-primary, #f8fafc)',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          height: 'var(--topnav-height, 64px)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 var(--space-8)',
          backgroundColor: 'var(--color-bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.5rem' }}>⚖️</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--font-bold)',
              fontSize: 'var(--text-lg)',
            }}
          >
            JurisMind AI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {user?.fullName} ({user?.email})
          </span>
          <button
            onClick={() => logout()}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8)' }}>
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                user?.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: '4px' }}>
                Welcome, {user?.fullName}!
              </h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Authenticated User Workspace — Milestone 2 Active
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                ACCOUNT EMAIL
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{user?.email}</div>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                PREFERRED LANGUAGE
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                {user?.preferredLanguage ? user.preferredLanguage.toUpperCase() : 'EN'}
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                MEMBER SINCE
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
