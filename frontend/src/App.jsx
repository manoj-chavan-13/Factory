import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LayoutDashboard, Settings, Box, PlayCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PipelineVisualizer from './pages/PipelineVisualizer';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0B0F19', paper: '#1A202C' },
    primary: { main: '#3B82F6' },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  }
});

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-surface h-screen border-r border-gray-800 flex flex-col shadow-2xl z-10">
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <Box className="text-primary" size={28} />
        <span className="text-xl font-bold tracking-widest text-white">FACTORY</span>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <Link to="/" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/pipeline/demo" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/pipeline/demo') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <PlayCircle size={20} /> Pipeline Simulator
        </Link>
        <Link to="/settings" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/settings') ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <Settings size={20} /> Settings
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        Factory CI/CD v1.0.0
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <div className="flex h-screen bg-background overflow-hidden text-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Header */}
            <header className="h-16 border-b border-gray-800 flex items-center px-8 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span>Organization</span>
                <span className="text-gray-600">/</span>
                <span className="text-white font-medium">Default Project</span>
              </div>
            </header>
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-8 relative">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pipeline/:runId" element={<PipelineVisualizer />} />
                <Route path="/settings" element={<div className="text-gray-400">Settings Page Coming Soon</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
