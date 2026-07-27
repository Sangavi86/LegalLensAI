import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { apiClient } from '../../../core/api/apiClient';
import type { ApiResponse, Document } from '@jurismind/shared-types';
import { UploadModal } from '../components/UploadModal';
import '../../../styles/documents.css';
import '../../../styles/auth.css';

export const DocumentsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const response = await apiClient.get<ApiResponse<Document[]>>(`/documents?${params.toString()}`);
      if (response.data.success) {
        setDocuments(response.data.data);
        if (response.data.meta) {
          setTotal(response.data.meta.total || 0);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Auto-poll for updating PROCESSING / QUEUED items
  useEffect(() => {
    const hasPending = documents.some((d) => ['UPLOADED', 'QUEUED', 'PROCESSING'].includes(d.status));
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 3000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleDelete = async (docId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiClient.delete(`/documents/${docId}`);
      showToast(`Document "${title}" deleted successfully.`);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete document.');
    }
  };

  const handleRetry = async (docId: string) => {
    try {
      await apiClient.post(`/documents/${docId}/retry`);
      showToast('Document re-enqueued for ingestion processing.');
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to retry document processing.');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

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

      {/* Main Content */}
      <main className="docs-main-content">
        {toast && <div className="alert-error" style={{ backgroundColor: 'var(--color-success-bg)', borderColor: 'var(--color-success)', color: 'var(--color-success)', marginBottom: 'var(--space-4)' }}>{toast}</div>}
        {error && <div className="alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

        {/* Actions Bar */}
        <div className="docs-actions-bar">
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: '4px' }}>
              Document Workspace
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Ingest, parse, and review legal contracts and documents
            </p>
          </div>

          <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary" style={{ width: 'auto' }}>
            + Upload Document
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="docs-actions-bar" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="search-filter-group">
            <input
              type="text"
              className="docs-search-input"
              placeholder="Search documents by title or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="docs-select-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">READY</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="QUEUED">QUEUED</option>
              <option value="UPLOADED">UPLOADED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="docs-table-card">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Title / Filename</th>
                <th>Language</th>
                <th>Pages</th>
                <th>Words</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    Loading documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    No documents found. Click "Upload Document" to get started.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                        <Link to={`/documents/${doc._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {doc.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {doc.originalFilename} • {(doc.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
                        {doc.language || 'en'}
                      </span>
                    </td>
                    <td>{doc.pageCount || '-'}</td>
                    <td>{doc.wordCount ? doc.wordCount.toLocaleString() : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={`status-badge ${doc.status}`}>
                          {['PROCESSING', 'QUEUED'].includes(doc.status) && <span className="spinner-icon" />}
                          {doc.status}
                        </span>
                        {['PROCESSING', 'QUEUED'].includes(doc.status) && (
                          <div style={{ width: '80px' }}>
                            <div className="progress-bar-bg" style={{ height: '4px' }}>
                              <div className="progress-bar-fill" style={{ width: `${doc.processingProgress || 20}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                        <button
                          onClick={() => navigate(`/documents/${doc._id}`)}
                          style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'var(--color-brand-400)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}
                        >
                          View
                        </button>
                        {doc.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetry(doc._id)}
                            style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--color-warning)', borderRadius: '4px', color: 'var(--color-warning)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}
                          >
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc._id, doc.title)}
                          style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--color-error)', borderRadius: '4px', color: 'var(--color-error)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 10 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            <span>Showing {documents.length} of {total} documents</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-google"
                style={{ padding: '4px 12px', width: 'auto' }}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center' }}>Page {page}</span>
              <button
                disabled={page * 10 >= total}
                onClick={() => setPage(page + 1)}
                className="btn-google"
                style={{ padding: '4px 12px', width: 'auto' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          showToast('Document uploaded and queued for processing!');
          fetchDocuments();
        }}
      />
    </div>
  );
};
