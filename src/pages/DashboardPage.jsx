import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, downloadMonitorScript } from '../services/apiService';
import Modal from '../components/Modal';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newlyCreatedProject, setNewlyCreatedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const response = await createProject({ projectName: newProjectName });
      setProjects([...projects, response.data]);
      setNewProjectName('');
      setNewlyCreatedProject(response.data); 
    } catch (error)      {
      console.error('Failed to create project:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewProjectName('');
    setNewlyCreatedProject(null);
  };

  const handleDownload = async () => {
    if (!newlyCreatedProject) return;
    try {
      const response = await downloadMonitorScript(newlyCreatedProject._id);
      const scriptContent = response.data;
      const blob = new Blob([scriptContent], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'monitor.js');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download script:", error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">
          Data Streams
        </h1>
        <button
          onClick={logout}
          className="px-4 py-2 font-semibold text-red-400 bg-red-500/10 border border-red-500/30 rounded-md hover:bg-red-500/20 hover:text-red-300 transition-colors"
        >
          Terminate Session
        </button>
      </header>

      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-cyan-300">Active Projects</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 font-bold text-black bg-emerald-400 rounded-md hover:bg-emerald-300 shadow-[0_0_15px_rgba(0,255,200,0.4)] hover:shadow-[0_0_20px_rgba(0,255,200,0.6)] transition-all"
          >
            + New Stream
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Syncing with network...</p>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project._id} to={`/project/${project._id}`}>
                <div className="group relative bg-white/5 p-6 rounded-lg backdrop-blur-md border border-cyan-500/20 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20">
                  <div className="absolute -top-2 -left-2 w-1/3 h-1/3 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -bottom-2 -right-2 w-1/3 h-1/3 border-b-2 border-r-2 border-emerald-500 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h3 className="text-xl font-bold text-white mb-2 truncate">{project.projectName}</h3>
                  <p className="text-sm font-mono text-cyan-200/50 break-all">{project._id}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-lg border-2 border-dashed border-cyan-500/20">
            <p className="text-lg text-cyan-200/70">No active data streams found.</p>
            <p className="text-gray-400 mt-2">Initialize a "New Stream" to begin monitoring.</p>
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={newlyCreatedProject ? "Stream Initialized" : "Initialize New Data Stream"}
      >
        {newlyCreatedProject ? (
          <div className="space-y-4">
            <p className="text-cyan-200/70">Your new data stream is ready. Integrate the monitor script to begin receiving data packets.</p>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">1. Download Monitor Script</label>
              <button onClick={handleDownload} className="w-full text-center py-2 font-bold text-black bg-emerald-400 rounded-md hover:bg-emerald-300 shadow-[0_0_15px_rgba(0,255,200,0.4)] transition-all">
                Download monitor.js
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">2. Integrate Script</label>
              <p className="text-xs text-gray-400 mb-2">Insert this tag just before the closing `&lt;/body&gt;` tag in your target application's HTML.</p>
              <pre className="bg-black/40 p-3 rounded-md text-sm text-yellow-300 overflow-x-auto"><code>&lt;script src="./monitor.js"&gt;&lt;/script&gt;</code></pre>
            </div>
            <div className="flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateProject}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stream Name</label>
                <input
                  type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-white bg-black/20 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Production API" required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 font-semibold text-gray-300 bg-gray-600/50 rounded-md hover:bg-gray-500/50">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700">Initialize</button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;