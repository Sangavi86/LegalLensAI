import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../styles/documents.css';
import '../../../styles/analysis.css';

const PROCESSING_STEPS = [
  'Upload Complete',
  'Reading Document',
  'Extracting Text',
  'Detecting Clauses',
  'Risk Analysis',
  'Simplifying Legal Language',
  'Preparing Final Report'
];

export const ProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!id) return;

    // We simulate the detailed AI steps for the UI since the backend 
    // only has coarse status (PROCESSING -> READY) in Milestone 3.
    // The startAnalysis endpoint is marked as TODO on backend.
    const stepDuration = 1200; // 1.2s per step
    const totalDuration = stepDuration * PROCESSING_STEPS.length;
    
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, totalDuration / 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStepIndex(PROCESSING_STEPS.length - 1);
      
      // Navigate to analysis page when complete
      setTimeout(() => navigate(`/analysis/${id}`), 500);
    }, totalDuration);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [id, navigate]);

  const circleRadius = 90;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progress / 100) * circleCircumference;

  return (
    <div className="processing-container">
      
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          AI Processing
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Our AI is reading and analyzing your legal document...
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        <div className="circular-progress-container">
          <svg className="circular-progress-svg" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-brand-500)" />
                <stop offset="100%" stopColor="var(--color-brand-300)" />
              </linearGradient>
            </defs>
            <circle
              className="circular-progress-circle-bg"
              cx="100" cy="100" r={circleRadius}
            />
            <circle
              className="circular-progress-circle"
              cx="100" cy="100" r={circleRadius}
              style={{ strokeDashoffset }}
            />
          </svg>
          <div className="circular-progress-text">
            {progress}%
          </div>
        </div>

        <div className="steps-list">
          {PROCESSING_STEPS.map((step, index) => {
            let statusClass = 'pending';
            let icon = '⏱️';
            
            if (index < currentStepIndex) {
              statusClass = 'completed';
              icon = '✓';
            } else if (index === currentStepIndex) {
              statusClass = 'active';
              icon = '⚙️';
            }

            return (
              <div key={step} className={`step-item ${statusClass}`}>
                <div className="step-icon">{icon}</div>
                <span style={{ 
                  fontWeight: statusClass === 'active' ? 'bold' : 'normal',
                  color: statusClass === 'pending' ? 'var(--color-text-muted)' : 'var(--color-text-primary)'
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
