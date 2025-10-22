import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLogs } from '../services/apiService';
import { socket } from '../services/socketService';

const ProjectDetailsPage = () => {
  const { projectId } = useParams(); // Get the project ID from the URL
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial logs when the component mounts
    const fetchInitialLogs = async () => {
      try {
        const response = await getLogs(projectId);
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialLogs();

    // 2. Connect to the socket server
    socket.connect();

    // 3. Listen for incoming 'new-log' events
    socket.on('new-log', (newLog) => {
      // Only add the log if it belongs to the current project
      if (newLog.projectId === projectId) {
        // Add the new log to the top of the list
        setLogs((prevLogs) => [newLog, ...prevLogs]);
      }
    });

    // 4. Clean up on component unmount
    return () => {
      socket.off('new-log'); // Stop listening for this event
      socket.disconnect(); // Disconnect from the server
    };
  }, [projectId]); // Re-run the effect if the projectId changes

  return (
    <div className="container mx-auto p-8">
      <Link to="/dashboard" className="text-indigo-400 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-2">Real-time Log Feed</h1>
      <p className="text-gray-400 mb-6">Project ID: {projectId}</p>

      <div className="bg-gray-900 rounded-lg shadow-inner p-4 h-[60vh] overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-400">Loading initial logs...</p>
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <div key={log._id} className="font-mono text-sm p-2 border-b border-gray-700">
              <span className="text-green-400">{new Date(log.createdAt).toLocaleString()}</span>
              <span className={`ml-4 font-bold ${log.type === 'error' ? 'text-red-500' : 'text-blue-400'}`}>
                [{log.type.toUpperCase()}]
              </span>
              <span className="ml-4 text-gray-200">{log.message}</span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No logs received yet. Waiting for data...</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;