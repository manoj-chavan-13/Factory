import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

const STAGES = ["Checkout", "Install Dependencies", "Build", "Docker Build", "Deploy"];

export default function PipelineVisualizer() {
  const [status, setStatus] = useState('PENDING'); // PENDING, RUNNING, SUCCESS, FAILED
  const [activeStage, setActiveStage] = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [gitUrl, setGitUrl] = useState('https://github.com/manoj-chavan-13/Factory-.git');
  
  // Socket reference
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('pipeline_status', (data) => {
      setStatus(data.status);
    });

    socketRef.current.on('stage_update', (data) => {
      if (data.status === 'RUNNING') {
        setActiveStage(data.stage);
      } else if (data.status === 'SUCCESS') {
        setCompletedStages(prev => [...prev, data.stage]);
        setActiveStage(null);
      } else if (data.status === 'FAILED') {
        setActiveStage(null);
      }
    });

    socketRef.current.on('pipeline_log', (data) => {
      setLogs(prev => [...prev, `[${data.stage}] ${data.message}`]);
    });

    return () => socketRef.current.disconnect();
  }, []);

  const triggerPipeline = async () => {
    setLogs([]);
    setCompletedStages([]);
    setStatus('RUNNING');
    await fetch(`http://localhost:5000/api/pipelines/run-123/trigger?git_url=${encodeURIComponent(gitUrl)}`, { method: 'POST' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface p-6 rounded-xl border border-gray-200 shadow-sm gap-4">
        <div className="w-full md:w-auto flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Real Pipeline Execution
            {status === 'SUCCESS' && <span className="bg-success/10 text-success text-sm px-3 py-1 rounded-full border border-success/20">PASSED</span>}
            {status === 'FAILED' && <span className="bg-danger/10 text-danger text-sm px-3 py-1 rounded-full border border-danger/20">FAILED</span>}
            {status === 'RUNNING' && <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full border border-primary/20 flex items-center gap-2"><Loader2 size={14} className="animate-spin"/> RUNNING</span>}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Target Git URL:</span>
            <input 
              type="text" 
              value={gitUrl} 
              onChange={e => setGitUrl(e.target.value)} 
              className="border border-gray-300 rounded px-2 py-1 text-sm flex-1 max-w-md text-gray-800 focus:outline-none focus:border-primary"
              disabled={status === 'RUNNING'}
            />
          </div>
        </div>
        <button 
          onClick={triggerPipeline}
          disabled={status === 'RUNNING'}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md w-full md:w-auto justify-center"
        >
          <Play size={18} /> Trigger Build
        </button>
      </div>

      {/* Node Graph Visualizer */}
      <div className="bg-surface p-8 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <div className="flex items-center min-w-max gap-4">
          {STAGES.map((stage, idx) => {
            const isCompleted = completedStages.includes(stage);
            const isRunning = activeStage === stage;
            const isPending = !isCompleted && !isRunning;
            const isFailed = status === 'FAILED' && isRunning; // simplified for UI
            
            return (
              <React.Fragment key={stage}>
                <div className={`relative flex flex-col items-center justify-center w-40 h-24 rounded-lg border-2 transition-all duration-300 ${isCompleted ? 'border-success bg-success/5 shadow-[0_0_15px_rgba(22,163,74,0.15)]' : isRunning ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'border-gray-200 bg-gray-50'}`}>
                  {isCompleted && <CheckCircle2 className="text-success mb-2" size={28} />}
                  {isRunning && !isFailed && <Loader2 className="text-primary animate-spin mb-2" size={28} />}
                  {isPending && <CircleDashed className="text-gray-400 mb-2" size={28} />}
                  <span className={`text-sm font-semibold text-center ${isCompleted ? 'text-success' : isRunning ? 'text-primary' : 'text-gray-500'}`}>
                    {stage}
                  </span>
                </div>
                {idx < STAGES.length - 1 && (
                  <div className={`w-12 h-1 transition-colors duration-500 rounded ${isCompleted ? 'bg-success' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Live Terminal - Stays Dark */}
      <div className="bg-[#0D1117] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-96">
        <div className="bg-gray-900 px-4 py-3 flex items-center gap-2 border-b border-gray-800">
          <Terminal size={18} className="text-gray-400" />
          <span className="text-gray-300 text-sm font-mono tracking-wide">Live Execution Logs (Real stdout/stderr)</span>
        </div>
        <div className="p-4 font-mono text-sm overflow-y-auto flex-1 space-y-1">
          {logs.map((log, i) => (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i}>
              <span className="text-gray-500 mr-4">[{new Date().toLocaleTimeString()}]</span>
              {log.includes('ERROR:') || log.includes('ERR!') || log.includes('error') ? (
                <span className="text-red-400">{log}</span>
              ) : log.includes('Success') || log.includes('✓') ? (
                <span className="text-green-400">{log}</span>
              ) : log.includes('> Executing:') ? (
                <span className="text-blue-400 font-bold">{log}</span>
              ) : (
                <span className="text-gray-300">{log}</span>
              )}
            </motion.div>
          ))}
          {status === 'RUNNING' && (
            <div className="text-gray-500 animate-pulse mt-2">_</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
