import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import './styles/global.css';
import './styles/animations.css';

/**
 * Root application component.
 * Router is defined here. Feature routes will be added in future milestones.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Milestone 1: Landing page scaffold */}
        <Route path="/" element={<LandingPage />} />

        {/* Future routes — placeholders, will be replaced in Milestone 2 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
