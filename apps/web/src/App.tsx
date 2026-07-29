import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import { AuthProvider } from './core/auth/AuthContext';
import { ProtectedRoute } from './core/components/ProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { GoogleCallbackPage } from './features/auth/pages/GoogleCallbackPage';
import { DashboardPage } from './features/auth/pages/DashboardPage';
import { DocumentsPage } from './features/documents/pages/DocumentsPage';
import { DocumentDetailsPage } from './features/documents/pages/DocumentDetailsPage';
import { UploadPage } from './features/documents/pages/UploadPage';
import { ProcessingPage } from './features/documents/pages/ProcessingPage';
import { AnalysisPage } from './features/documents/pages/AnalysisPage';
import { WorkspaceLayout } from './core/components/WorkspaceLayout';
import { PlaceholderPage } from './core/components/PlaceholderPage';
import './styles/global.css';
import './styles/animations.css';

/**
 * Root application component with AuthProvider and Router.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<GoogleCallbackPage />} />

          {/* Protected routes wrapped in WorkspaceLayout */}
          <Route
            element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentDetailsPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/processing/:id" element={<ProcessingPage />} />
            <Route path="/analysis/:id" element={<AnalysisPage />} />
            
            {/* New Placeholder Routes */}
            <Route path="/recent" element={<PlaceholderPage title="Recent Analyses" icon="⏱️" />} />
            <Route path="/chat" element={<PlaceholderPage title="AI Chat" icon="💬" description="Select a document from your library to start a chat." />} />
            <Route path="/compare" element={<PlaceholderPage title="Compare Documents" icon="⚖️" />} />
            <Route path="/clause-library" element={<PlaceholderPage title="Clause Library" icon="📚" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" icon="⚙️" />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
