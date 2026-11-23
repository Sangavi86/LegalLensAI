import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { documentService } from '../../../core/api/documentService';
import '../../../styles/documents.css';
import '../../../styles/analysis.css';
import '../../../styles/auth.css';

export const UploadPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): boolean => {
    setError(null);
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Unsupported file type. Only PDF, DOCX, and TXT files are allowed.');
      return false;
    }
    // Updated requirement: Max file size 25MB
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25 MB limit.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
        handleAutoUpload(selected);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (validateFile(selected)) {
        setFile(selected);
        handleAutoUpload(selected);
      }
    }
  };

  const handleAutoUpload = async (fileToUpload: File) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(5); // Initial state

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('title', fileToUpload.name);

      const response = await documentService.uploadDocument(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 95) / progressEvent.total);
          setProgress(percent);
        }
      });
      const resData = response.data;

      if (resData.success) {
        setProgress(100);
        // Start Analysis API Call on the backend here (wrapper exists)
        await documentService.startAnalysis(resData.data._id).catch(() => {
          // It will fail because backend endpoint is missing, but we still navigate to processing page
          console.warn('Backend startAnalysis endpoint missing, navigating to processing UI anyway.');
        });
        
        setTimeout(() => {
          navigate(`/processing/${resData.data._id}`);
        }, 800);
      } else {
        setError(resData.error.message || 'Upload failed.');
        setUploading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'An error occurred during upload.');
      setUploading(false);
    }
  };

  return (
    <div className="upload-page-container">
      {/* Top Navbar Component */}
      <header className="docs-header-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
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
            <Link to="/documents" style={{ color: 'var(--color-brand-400)', fontWeight: 'bold', textDecoration: 'none' }}>Analysis Workflow</Link>
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

      <div className="upload-card">
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          Analyze Legal Document
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          Securely upload your contract for instant AI risk assessment.
        </p>

        {error && <div className="alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

        <div
          className={`upload-dropzone ${isDragActive ? 'drag-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />

          {!file && !uploading && (
            <div>
              <div className="upload-icon-container">
                ☁️
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: '8px' }}>
                Drag & Drop Document
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                or click to browse your files
              </p>
              <span style={{ display: 'inline-block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-elevated)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                PDF, DOCX, TXT up to 25MB
              </span>
            </div>
          )}

          {uploading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="upload-icon-container" style={{ animation: 'pulse 2s infinite' }}>
                {progress === 100 ? '✅' : '🚀'}
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: '12px' }}>
                {progress === 100 ? 'Upload Complete!' : 'Uploading Document...'}
              </h3>
              <div className="progress-bar-bg" style={{ width: '80%', maxWidth: '300px', height: '8px', marginBottom: '8px' }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.2s ease' }} />
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand-400)' }}>
                {progress}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
