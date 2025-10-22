// src/pages/ProjectDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLogs, getProjectDetails, deleteProject } from '../services/apiService';
import { socket } from '../services/socketService';
import Modal from '../components/Modal'; // Assuming you have a Modal component

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null); // State for project details
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the deletion modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project details and logs concurrently
        const [projectRes, logsRes] = await Promise.all([
          getProjectDetails(projectId),
          getLogs(projectId)
        ]);
        setProject(projectRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Failed to fetch project data:', error);
        navigate('/dashboard'); // Redirect if project not found or unauthorized
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
      navigate('/dashboard'); // Redirect to dashboard after successful deletion
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Error: Could not delete the project.");
      setIsDeleting(false);
    }
  };

  const getLogTypeClass = (type) => { /* ... (same as before) ... */ };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* ... (Header and Log Feed JSX from previous futuristic theme) ... */}
      <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,255,200,0.5)]">
        {project?.projectName}
      </h1>

      {/* ... (Log Feed JSX) ... */}

      {/* --- DANGER ZONE --- */}
      <div className="mt-12 p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
        <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
        <p className="text-red-300/70 mt-2 mb-4">
          Deleting a project is an irreversible action. All associated logs and data will be permanently removed.
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
            This action cannot be undone. To confirm, please type the project name{' '}
            <strong className="text-yellow-300">{project?.projectName}</strong> in the box below.
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="w-full px-3 py-2 text-white bg-black/20 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Project Name"
          />
          <button
            onClick={handleDeleteProject}
            disabled={confirmationText !== project?.projectName || isDeleting}
            className="w-full py-2 font-bold text-white bg-red-600 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "I understand, delete this project"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;