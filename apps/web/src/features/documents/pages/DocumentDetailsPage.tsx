import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { apiClient } from '../../../core/api/apiClient';
import type { ApiResponse, DocumentDetailResponse } from '@jurismind/shared-types';
import '../../../styles/documents.css';
import '../../../styles/auth.css';

export const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<DocumentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [textSearch, setTextSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'logs'>('text');

  const fetchDocumentDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ApiResponse<DocumentDetailResponse>>(`/documents/${id}`);
      if (response.data.success) {
        setDetail(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch document details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocumentDetail();
  }, [fetchDocumentDetail]);

  const handleDelete = async () => {
    if (!detail || !window.confirm(`Are you sure you want to delete "${detail.document.title}"?`)) return;
    try {
      await apiClient.delete(`/documents/${id}`);
      navigate('/documents');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete document.');
    }
  };

  const handleCopyText = () => {
    if (detail?.content?.rawText) {
      navigator.clipboard.writeText(detail.content.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="docs-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading document details...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="docs-page-container">
        <main className="docs-main-content">
          <div className="alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error || 'Document not found.'}</div>
          <button onClick={() => navigate('/documents')} className="btn-primary" style={{ width: 'auto' }}>
            ← Back to Documents
          </button>
        </main>
      </div>
    );
  }

  const { document: doc, content, logs } = detail;

  return (
    <div className="docs-page-container">
      {/* Top Navbar */}
      <header className="docs-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.5rem' }}>⚖️</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>
              JurisMind AI
            </span>
          </Link>
          <span style={{ color: 'var(--color-border)', margin: '0 8px' }}>|</span>
          <nav style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            <Link to="/dashboard" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/documents" style={{ color: 'var(--color-brand-400)', fontWeight: 'bold', textDecoration: 'none' }}>Documents</Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {user?.fullName}
          </span>
          <button onClick={() => logout()} style={{ padding: '4px 12px', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="docs-main-content">
        {/* Navigation & Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <button onClick={() => navigate('/documents')} style={{ background: 'none', border: 'none', color: 'var(--color-brand-400)', cursor: 'pointer', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            ← Back to Documents Workspace
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '4px' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>{doc.title}</h1>
                <span className={`status-badge ${doc.status}`}>{doc.status}</span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {doc.originalFilename} • {doc.mimeType}
              </p>
            </div>

            <button onClick={handleDelete} style={{ padding: '8px 16px', backgroundColor: 'var(--color-error-bg)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 'var(--font-medium)' }}>
              Delete Document
            </button>
          </div>
        </div>

        {/* Metadata Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>FILE SIZE</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold' }}>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</div>
          </div>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>PAGES</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold' }}>{doc.pageCount}</div>
          </div>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>WORD COUNT</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold' }}>{doc.wordCount.toLocaleString()}</div>
          </div>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>CHARACTERS</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold' }}>{doc.characterCount.toLocaleString()}</div>
          </div>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>LANGUAGE</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', textTransform: 'uppercase' }}>{doc.language || 'en'}</div>
          </div>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>PARSER USED</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold' }}>{doc.parserUsed || 'N/A'}</div>
          </div>
        </div>

        {/* SHA-256 Hash Banner */}
        <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          SHA-256 CONTENT HASH: <span style={{ color: 'var(--color-text-primary)' }}>{doc.fileHash}</span>
        </div>

        {/* Tabs Header */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
          <button
            onClick={() => setActiveTab('text')}
            style={{ padding: 'var(--space-2) var(--space-4)', background: 'none', border: 'none', borderBottom: activeTab === 'text' ? '2px solid var(--color-brand-400)' : 'none', color: activeTab === 'text' ? 'var(--color-brand-400)' : 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Extracted Raw Text ({content?.rawText ? content.rawText.length.toLocaleString() : 0} chars)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{ padding: 'var(--space-2) var(--space-4)', background: 'none', border: 'none', borderBottom: activeTab === 'logs' ? '2px solid var(--color-brand-400)' : 'none', color: activeTab === 'logs' ? 'var(--color-brand-400)' : 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Processing Audit Logs ({logs.length})
          </button>
        </div>

        {/* Tab 1: Extracted Text Viewer */}
        {activeTab === 'text' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <input
                type="text"
                className="docs-search-input"
                placeholder="Filter extracted text..."
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                style={{ maxWidth: '300px' }}
              />

              <button onClick={handleCopyText} className="btn-google" style={{ width: 'auto', padding: '4px 12px' }}>
                {copied ? '✓ Copied!' : 'Copy Raw Text'}
              </button>
            </div>

            <div className="text-viewer-box">
              {content?.rawText ? (
                textSearch.trim() ? (
                  content.rawText
                    .split('\n')
                    .filter((line) => line.toLowerCase().includes(textSearch.toLowerCase()))
                    .join('\n') || 'No matching lines found.'
                ) : (
                  content.rawText
                )
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {doc.status === 'PROCESSING' || doc.status === 'QUEUED'
                    ? 'Processing in progress... Check back in a few seconds.'
                    : 'No text extracted for this document.'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Processing Audit Logs */}
        {activeTab === 'logs' && (
          <div style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
            {logs.map((log) => (
              <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--text-xs)' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-brand-400)', marginRight: '8px' }}>[{log.step}]</span>
                  <span style={{ color: log.status === 'FAILED' ? 'var(--color-error)' : 'var(--color-text-primary)' }}>{log.message}</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
