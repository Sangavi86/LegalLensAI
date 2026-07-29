import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { documentService, AIAnalysisResult } from '../../../core/api/documentService';
import { AIChatSidebar } from '../components/AIChatSidebar';
import '../../../styles/documents.css';
import '../../../styles/analysis.css';

export const AnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        // Attempt to fetch analysis from backend
        const response = await documentService.getAnalysis(id);
        if (response.data.success) {
          setAnalysis(response.data.data);
        }
      } catch (err: any) {
        // Backend endpoint is marked as TODO, so this will likely fail
        setError(
          err.response?.data?.error?.message || 
          'Analysis endpoint not implemented on backend yet. (TODO: GET /api/v1/documents/:id/analysis)'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      const response = await documentService.downloadPdfReport(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('PDF generation endpoint not implemented on backend yet.');
    }
  };

  const getRiskColor = (level: string) => {
    if (level === 'High') return 'var(--color-error)';
    if (level === 'Medium') return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  return (
    <div className="docs-page-container">
      {/* Top Navbar Component */}
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
            <Link to="/documents" style={{ color: 'var(--color-brand-400)', fontWeight: 'bold', textDecoration: 'none' }}>Analysis Result</Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {user?.fullName}
          </span>
          <button 
            className="btn-google" 
            style={{ width: 'auto', padding: '6px 12px' }}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            {isChatOpen ? 'Close AI Chat' : 'Open AI Chat'}
          </button>
        </div>
      </header>

      <div className="analysis-layout">
        <main className="analysis-main">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: '4px' }}>
                Legal Analysis Report
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Comprehensive AI review of your document.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn-google" style={{ width: 'auto' }} onClick={() => alert('Translation endpoint pending.')}>
                🌐 Translate
              </button>
              <button className="btn-google" style={{ width: 'auto' }} onClick={() => alert('Share feature pending.')}>
                🔗 Share
              </button>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={handleDownloadPdf}>
                ⬇ Download PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <div className="spinner-icon" style={{ width: '40px', height: '40px', color: 'var(--color-brand-500)', marginBottom: '16px' }} />
              <p>Loading analysis...</p>
            </div>
          ) : error && !analysis ? (
            <div className="alert-error">
              <h3>Backend Connection Error</h3>
              <p>{error}</p>
              <p style={{ marginTop: '8px', fontSize: 'var(--text-sm)' }}>
                The UI is ready, but the API endpoint <code>GET /api/v1/documents/:id/analysis</code> needs to be implemented.
              </p>
            </div>
          ) : analysis && (
            <>
              {/* Executive Summary & Risk Score */}
              <div className="metrics-grid">
                <div className="metric-card" style={{ gridColumn: 'span 2' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>EXECUTIVE SUMMARY</h3>
                  <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.6 }}>{analysis.executiveSummary}</p>
                </div>
                
                <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>OVERALL RISK SCORE</h3>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: analysis.riskScore > 70 ? 'var(--color-error)' : analysis.riskScore > 40 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {analysis.riskScore}/100
                  </div>
                  <div className="risk-meter" style={{ width: '100%', maxWidth: '200px' }}>
                    <div 
                      className={`risk-meter-fill ${analysis.riskScore > 70 ? 'High' : analysis.riskScore > 40 ? 'Medium' : 'Low'}`}
                      style={{ width: `${analysis.riskScore}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Data Lists Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                
                <div className="metric-card">
                  <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>IMPORTANT DATES</h3>
                  <ul style={{ paddingLeft: 'var(--space-4)' }}>
                    {analysis.importantDates.map((date, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{date}</li>)}
                  </ul>
                </div>

                <div className="metric-card">
                  <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>FINANCIAL OBLIGATIONS</h3>
                  <ul style={{ paddingLeft: 'var(--space-4)' }}>
                    {analysis.financialObligations.map((fin, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{fin}</li>)}
                  </ul>
                </div>

                <div className="metric-card">
                  <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>TERMINATION CLAUSES</h3>
                  <ul style={{ paddingLeft: 'var(--space-4)' }}>
                    {analysis.terminationClauses.map((term, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{term}</li>)}
                  </ul>
                </div>

                <div className="metric-card">
                  <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>RESPONSIBILITIES</h3>
                  <ul style={{ paddingLeft: 'var(--space-4)' }}>
                    {analysis.responsibilities.map((resp, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{resp}</li>)}
                  </ul>
                </div>
              </div>

              {/* Clause Cards */}
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
                Clause Analysis
              </h2>
              
              {analysis.clauses.map((clause) => (
                <div key={clause.id} className="clause-card">
                  <div className="clause-card-header">
                    <span style={{ fontWeight: 'bold' }}>Clause {clause.id}</span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: 'var(--text-xs)', 
                      fontWeight: 'bold',
                      backgroundColor: `${getRiskColor(clause.riskLevel)}20`,
                      color: getRiskColor(clause.riskLevel)
                    }}>
                      {clause.riskLevel} Risk
                    </span>
                  </div>
                  <div className="clause-card-content">
                    <div className="clause-section">
                      <div className="clause-section-title">Original Clause</div>
                      <p style={{ fontStyle: 'italic', padding: 'var(--space-3)', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                        "{clause.originalText}"
                      </p>
                    </div>
                    
                    <div className="clause-section">
                      <div className="clause-section-title">Simplified Explanation</div>
                      <p>{clause.simplifiedExplanation}</p>
                    </div>

                    <div className="clause-section">
                      <div className="clause-section-title" style={{ color: 'var(--color-brand-400)' }}>Recommendation</div>
                      <p>{clause.recommendation}</p>
                    </div>

                    {clause.suggestedRewrite && (
                      <div className="clause-section">
                        <div className="clause-section-title" style={{ color: 'var(--color-success)' }}>Suggested Rewrite</div>
                        <p style={{ padding: 'var(--space-3)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
                          {clause.suggestedRewrite}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Negotiation Suggestions */}
              <div className="metric-card" style={{ marginTop: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-brand-400)', marginBottom: 'var(--space-4)' }}>NEGOTIATION SUGGESTIONS</h3>
                <ul style={{ paddingLeft: 'var(--space-4)' }}>
                  {analysis.negotiationSuggestions.map((sug, idx) => <li key={idx} style={{ marginBottom: '8px' }}>{sug}</li>)}
                </ul>
              </div>

            </>
          )}

        </main>

        {/* ChatGPT-style Sidebar */}
        {isChatOpen && id && (
          <aside className="analysis-sidebar">
            <AIChatSidebar documentId={id} />
          </aside>
        )}

      </div>
    </div>
  );
};
