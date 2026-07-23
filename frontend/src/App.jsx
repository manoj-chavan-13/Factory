import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LayoutDashboard, Settings, Box, PlayCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PipelineVisualizer from './pages/PipelineVisualizer';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    primary: { main: '#2563EB' },
    success: { main: '#16A34A' },
    error: { main: '#DC2626' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }
});

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-surface h-screen border-r border-gray-200 flex flex-col shadow-lg z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-200">
        <Box className="text-primary" size={28} />
        <span className="text-xl font-bold tracking-widest text-gray-900">FACTORY</span>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <Link to="/" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/pipeline/demo" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/pipeline/demo') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
          <PlayCircle size={20} /> Pipeline Execution
        </Link>
        <Link to="/settings" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/settings') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
          <Settings size={20} /> Settings
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Factory CI/CD v1.1.0
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <div className="flex h-screen bg-background overflow-hidden text-gray-900">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Header */}
            <header className="h-16 border-b border-gray-200 flex items-center px-8 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>Organization</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">Production Pipeline</span>
              </div>
            </header>
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-8 relative">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pipeline/:runId" element={<PipelineVisualizer />} />
                <Route path="/settings" element={<div className="text-gray-600">Settings Page Coming Soon</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
