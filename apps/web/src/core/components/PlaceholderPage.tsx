import React from 'react';

interface PlaceholderPageProps {
  title: string;
  icon?: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  icon = '🚧', 
  description = 'This feature is currently under development.' 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 'var(--space-12)',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: 'var(--space-6)',
        opacity: 0.8
      }}>
        {icon}
      </div>
      <h1 style={{
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--font-bold)',
        marginBottom: 'var(--space-4)',
        color: 'var(--color-text-primary)'
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: 'var(--text-md)',
        color: 'var(--color-text-muted)',
        maxWidth: '500px'
      }}>
        {description}
      </p>
    </div>
  );
};
