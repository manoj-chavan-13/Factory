import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, Settings, Box } from 'lucide-react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0B0F19', paper: '#1A202C' },
    primary: { main: '#3B82F6' },
    success: { main: '#10B981' },
    error: { main: '#EF4444' },
  },
});

function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-8"
    >
      <h1 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
        <Activity className="text-primary" size={32} />
        Pipeline Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mock Stats */}
        <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-400 text-sm font-medium">Total Runs</h3>
          <p className="text-4xl font-bold mt-2">1,204</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-400 text-sm font-medium">Success Rate</h3>
          <p className="text-4xl font-bold mt-2 text-success">98.2%</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-gray-400 text-sm font-medium">Active Workers</h3>
          <p className="text-4xl font-bold mt-2 text-primary">4 / 4</p>
        </div>
      </div>
    </motion.div>
  );
}

function Sidebar() {
  return (
    <div className="w-64 bg-surface h-screen border-r border-gray-800 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <Box className="text-primary" size={28} />
        <span className="text-xl font-bold tracking-wider">FACTORY</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 p-3 rounded-lg transition-colors">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/settings" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 p-3 rounded-lg transition-colors">
          <Settings size={20} /> Settings
        </Link>
      </nav>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/settings" element={<div className="p-8">Settings Page Coming Soon</div>} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
