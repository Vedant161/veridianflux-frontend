import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLogs, getProjectDetails, deleteProject, updateProject, getProjectStats } from '../services/apiService';
import { socket } from '../services/socketService';
import Modal from '../components/Modal';

// Tab Button Component
const TabButton = ({ activeTab, tabName, setTab }) => (
  <button
    onClick={() => setTab(tabName)}
    className={`px-4 py-2 font-bold rounded-md transition-all duration-300 ${
      activeTab === tabName
        ? 'bg-emerald-400 text-black shadow-[0_0_15px_rgba(0,255,200,0.4)]'
        : 'bg-white/5 text-cyan-200/70 hover:bg-white/10'
    }`}
  >
    {tabName}
  </button>
);

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Component State
  const [activeTab, setActiveTab] = useState('Logs');
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Log Feed State
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  
  // Settings State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, logsRes, statsRes] = await Promise.all([
          getProjectDetails(projectId),
          getLogs(projectId),
          getProjectStats(projectId)
        ]);
        setProject(projectRes.data);
        setNewProjectName(projectRes.data.projectName);
        setLogs(logsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch project data:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    socket.connect();
    socket.on('new-log', (newLog) => {
      if (newLog.projectId === projectId && !isPaused) {
        setLogs((prevLogs) => [newLog, ...prevLogs]);
        // Simple live update for stats
        setStats(prevStats => ({
            ...prevStats,
            totalLogs24h: prevStats.totalLogs24h + 1,
            errors1h: newLog.type === 'error' ? prevStats.errors1h + 1 : prevStats.errors1h
        }));
      }
    });

    return () => {
      socket.off('new-log');
      socket.disconnect();
    };
  }, [projectId, navigate, isPaused]);

  // Memoized filtered logs for performance
  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => logTypeFilter === 'all' || log.type === logTypeFilter)
      .filter(log => log.message.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [logs, logTypeFilter, searchTerm]);

  // Handlers for settings
  const handleRenameProject = async (e) => {
    e.preventDefault();
    if (!newProjectName || newProjectName === project.projectName) return;
    try {
        const updated = await updateProject(projectId, { projectName: newProjectName });
        setProject(updated.data);
        alert('Project renamed successfully!');
    } catch (error) {
        console.error("Failed to rename project:", error);
    }
  };

  const handleDeleteProject = async () => { /* ... (same as before) ... */ };
  const getLogTypeClass = (type) => { /* ... (same as before) ... */ };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) { /* ... (loading spinner) ... */ }

  return (
    <div className="container mx-auto p-8">
      <Link to="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-8 block transition-colors">
        &larr; Return to Streams
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,255,200,0.5)]">{project?.projectName}</h1>
        <p className="text-cyan-200/70 mt-2 font-mono break-all">{projectId}</p>
      </div>

      {/* Analytics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-lg text-center border border-cyan-500/20"><div className="text-3xl font-bold text-emerald-400">{stats?.healthScore || 100}%</div><div className="text-sm text-cyan-200/70">Health Score</div></div>
        <div className="bg-white/5 p-4 rounded-lg text-center border border-cyan-500/20"><div className="text-3xl font-bold">{stats?.totalLogs24h || 0}</div><div className="text-sm text-cyan-200/70">Logs (24h)</div></div>
        <div className="bg-white/5 p-4 rounded-lg text-center border border-cyan-500/20"><div className="text-3xl font-bold text-red-400">{stats?.errors1h || 0}</div><div className="text-sm text-cyan-200/70">Errors (1h)</div></div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        <TabButton activeTab={activeTab} tabName="Logs" setTab={setActiveTab} />
        <TabButton activeTab={activeTab} tabName="Analytics" setTab={setActiveTab} />
        <TabButton activeTab={activeTab} tabName="Integration" setTab={setActiveTab} />
        <TabButton activeTab={activeTab} tabName="Settings" setTab={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="bg-black/50 p-6 rounded-lg border border-cyan-500/20 min-h-[60vh]">
        
        {activeTab === 'Logs' && (
          <div>
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <input type="text" placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow px-3 py-2 bg-black/20 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <select value={logTypeFilter} onChange={e => setLogTypeFilter(e.target.value)} className="px-3 py-2 bg-black/20 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="all">All Types</option><option value="error">Error</option><option value="event">Event</option><option value="feedback">Feedback</option>
              </select>
              <button onClick={() => setIsPaused(!isPaused)} className={`px-4 py-2 font-bold rounded-md ${isPaused ? 'bg-yellow-500 text-black' : 'bg-cyan-500/50'}`}>{isPaused ? 'Paused' : 'Pause Feed'}</button>
            </div>
            <div className="h-[50vh] overflow-y-auto font-mono text-sm pr-2">
              {filteredLogs.map((log) => (
                <div key={log._id} className="flex items-start p-2 border-b border-cyan-900/50 last:border-b-0 animate-[fadeIn_0.5s_ease-out]">
                  {/* ... log item JSX ... */}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Analytics' && (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-cyan-300">Log Type Distribution</h2>
                <div className="mt-4 text-left max-w-sm mx-auto">
                    {stats?.logTypeCounts.map(item => (
                        <div key={item._id} className="flex justify-between items-center bg-white/5 p-2 rounded mb-2">
                           <span className={`font-bold ${getLogTypeClass(item._id)}`}>{item._id.toUpperCase()}</span>
                           <span className="font-mono">{item.count}</span>
                        </div>
                    ))}
                </div>
                 <p className="mt-8 text-cyan-200/50">Advanced charts and visualizations coming soon.</p>
            </div>
        )}

        {activeTab === 'Integration' && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-cyan-300">Project ID</h3>
                    <p className="text-cyan-200/70 mt-1 mb-2">Use this ID to configure your monitor script.</p>
                    <div className="flex gap-2 font-mono bg-black/40 p-3 rounded-md text-yellow-300">
                        <span className="flex-grow">{projectId}</span>
                        <button onClick={() => copyToClipboard(projectId)} className="font-sans font-bold text-emerald-400">Copy</button>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-cyan-300">Setup Script</h3>
                    <p className="text-cyan-200/70 mt-1 mb-2">Place this tag before the closing `&lt;/body&gt;` tag in your HTML.</p>
                    <div className="flex gap-2 font-mono bg-black/40 p-3 rounded-md text-yellow-300">
                        <span className="flex-grow">{'<script src="./monitor.js"></script>'}</span>
                         <button onClick={() => copyToClipboard('<script src="./monitor.js"></script>')} className="font-sans font-bold text-emerald-400">Copy</button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'Settings' && (
            <div className="space-y-8">
                {/* Rename Project Form */}
                <div>
                    <h3 className="text-xl font-bold text-cyan-300">Rename Stream</h3>
                    <form onSubmit={handleRenameProject} className="flex gap-2 mt-2">
                        <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="flex-grow px-3 py-2 bg-black/20 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                        <button type="submit" className="px-4 py-2 font-bold text-black bg-emerald-400 rounded-md hover:bg-emerald-300">Save</button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
                    {/* ... Danger Zone JSX and Modal ... */}
                </div>
            </div>
        )}

      </div>
       <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        {/* ... Deletion Modal JSX ... */}
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;