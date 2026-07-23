import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';

function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/projects/')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error("Failed to fetch projects", err));
  }, []);

  const columns = [
    { field: 'name', headerName: 'Project Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    { 
      field: 'status', 
      headerName: 'Last Run Status', 
      width: 180,
      renderCell: (params) => {
        if(params.value === 'SUCCESS') return <span className="flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-full text-xs font-bold border border-success/20"><CheckCircle2 size={14}/> SUCCESS</span>;
        if(params.value === 'FAILED') return <span className="flex items-center gap-2 text-danger bg-danger/10 px-3 py-1 rounded-full text-xs font-bold border border-danger/20"><XCircle size={14}/> FAILED</span>;
        if(params.value === 'RUNNING') return <span className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full text-xs font-bold border border-primary/20"><Activity size={14} className="animate-pulse"/> RUNNING</span>;
        return <span className="text-gray-400">{params.value}</span>;
      }
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Command Center</h1>
          <p className="text-gray-400">Overview of your infrastructure and recent pipelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={projects.length} icon={<Box size={20} className="text-primary"/>} />
        <StatCard title="Success Rate" value="98.2%" icon={<CheckCircle2 size={20} className="text-success"/>} />
        <StatCard title="Active Workers" value="4 / 4" icon={<Activity size={20} className="text-primary"/>} />
        <StatCard title="Avg Build Time" value="2m 14s" icon={<Clock size={20} className="text-gray-400"/>} />
      </div>

      <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 bg-surface/50">
          <h2 className="text-xl font-semibold text-white">Active Projects</h2>
        </div>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={projects}
            columns={columns}
            getRowId={(row) => row._id}
            sx={{
              border: 'none',
              color: 'white',
              '& .MuiDataGrid-cell': { borderColor: '#1F2937' },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#111827', borderColor: '#1F2937', color: '#9CA3AF' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #1F2937' }
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group hover:border-gray-600 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        {icon}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-white">{value}</p>
    </div>
  );
}

import { Box } from 'lucide-react';
export default Dashboard;
