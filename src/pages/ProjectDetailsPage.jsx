import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLogs, getProjectDetails, deleteProject } from '../services/apiService';
import { socket } from '../services/socketService';
import Modal from '../components/Modal';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the deletion modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, logsRes] = await Promise.all([
          getProjectDetails(projectId),
          getLogs(projectId)
        ]);
        setProject(projectRes.data);
        setLogs(logsRes.data);
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
      if (newLog.projectId === projectId) {
        setLogs((prevLogs) => [newLog, ...prevLogs]);
      }
    });

    return () => {
      socket.off('new-log');
      socket.disconnect();
    };
  }, [projectId, navigate]);

  const handleDeleteProject = async () => {
    if (confirmationText !== project?.projectName) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Error: Could not delete the project.");
      setIsDeleting(false);
    }
  };

  const getLogTypeClass = (type) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'feedback': return 'text-purple-400';
      case 'event': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Link to="/dashboard" className="text-emerald-400 hover:text-emerald-300 mb-8 block transition-colors">
        &larr; Return to Streams
      </Link>

      {/* --- HEADER --- */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,255,200,0.5)]">
          {project?.projectName}
        </h1>
        <p className="text-cyan-200/70 mt-2 font-mono break-all">{projectId}</p>
      </div>

      {/* --- LOG FEED --- */}
      <div className="relative bg-black/50 p-4 rounded-lg h-[60vh] overflow-y-auto font-mono text-sm border border-cyan-500/20 shadow-inner shadow-cyan-500/20">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-emerald-400/40 to-transparent opacity-40 animate-[scan_4s_linear_infinite]"></div>
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log._id} className="flex items-start p-2 border-b border-cyan-900/50 last:border-b-0 animate-[fadeIn_0.5s_ease-out]">
              <span className="text-cyan-400 mr-4 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
              <span className={`font-bold mr-4 ${getLogTypeClass(log.type)}`}>
                [{log.type.toUpperCase()}]
              </span>
              <span className="text-gray-200 break-all">{log.message}</span>
            </div>
          ))
        ) : (
          <p className="text-center text-cyan-200/50 pt-4">Awaiting incoming data packets...</p>
        )}
      </div>

      {/* --- DANGER ZONE --- */}
      <div className="mt-12 p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
        <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
        <p className="text-red-300/70 mt-2 mb-4">
          Deleting this stream is irreversible. All associated logs and data will be permanently removed.
        </p>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Delete this project
        </button>
      </div>

      {/* --- DELETION CONFIRMATION MODAL --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-cyan-200/70">
            This action cannot be undone. To confirm, please type the stream name{' '}
            <strong className="text-yellow-300">{project?.projectName}</strong> in the box below.
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="w-full px-3 py-2 text-white bg-black/20 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Stream Name"
          />
          <button
            onClick={handleDeleteProject}
            disabled={confirmationText !== project?.projectName || isDeleting}
            className="w-full py-2 font-bold text-white bg-red-600 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "I understand, delete this stream"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;