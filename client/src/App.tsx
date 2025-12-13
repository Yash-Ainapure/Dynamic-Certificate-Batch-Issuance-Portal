import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProjectNew from './pages/ProjectNew';
import ProjectDetail from './pages/ProjectDetail';
import BatchDetail from './pages/BatchDetail';
import VerifyPage from './pages/VerifyPage';
import Navbar from './components/layout/Navbar';
import { ToastProvider } from './components/common/toast';
import { ThemeProvider } from './theme/ThemeProvider';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/new" element={<ProjectNew />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/batches/:batchId" element={<BatchDetail />} />
            <Route path="/verify/:certId" element={<VerifyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App
