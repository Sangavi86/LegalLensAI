import React, { useState, useRef } from 'react';
import { apiClient } from '../../../core/api/apiClient';
import type { ApiResponse, Document } from '@jurismind/shared-types';
import '../../../styles/documents.css';
import '../../../styles/auth.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (document: Document) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateFile = (selectedFile: File): boolean => {
    setError(null);
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Unsupported file type. Only PDF, DOCX, and TXT files are allowed.');
      return false;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20 MB limit.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
        if (!title) {
          setTitle(selected.name);
        }
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
        if (!title) {
          setTitle(selected.name);
        }
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(10);

      const formData = new FormData();
      formData.append('file', file);
      if (title.trim()) formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());

      const response = await apiClient.post<ApiResponse<Document>>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      if (response.data.success) {
        setProgress(100);
        onUploadSuccess(response.data.data);
        onClose();
        setFile(null);
        setTitle('');
        setDescription('');
      } else {
        setError(response.data.error.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)' }}>Upload Document</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
            ✕
          </button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

        <form onSubmit={handleUpload}>
          <div
            className={`dropzone ${isDragActive ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {file ? (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📄</div>
                <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{file.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>☁️</div>
                <p style={{ fontWeight: 'var(--font-medium)', marginBottom: '4px' }}>
                  Drag & Drop contract or click to browse
                </p>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Supports PDF, DOCX, TXT (Max 20 MB)
                </span>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
            <label className="form-label">Document Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Master Services Agreement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label">Description (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brief description or notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {uploading && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                <span>Uploading & Queueing Ingestion...</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-google" style={{ width: 'auto' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!file || uploading} style={{ width: 'auto' }}>
              {uploading ? 'Processing...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
