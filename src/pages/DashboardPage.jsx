import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getProjects,
  createProject,
  downloadMonitorScript,
} from "../services/apiService"; // 👈 Import createProject
import Modal from "../components/Modal"; // 👈 Import Modal
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newlyCreatedProject, setNewlyCreatedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDownload = async () => {
    if (!newlyCreatedProject) return;
    try {
      const response = await downloadMonitorScript(newlyCreatedProject._id);
      const scriptContent = response.data;

      // Create a "blob" (a file-like object) from the script text
      const blob = new Blob([scriptContent], {
        type: "application/javascript",
      });

      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "monitor.js"); // The filename for the download
      document.body.appendChild(link);

      // Programmatically click the link
      link.click();

      // Clean up by removing the link and revoking the URL
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download script:", error);
      // You could show an error message to the user here
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName) return;

    try {
      const response = await createProject({ projectName: newProjectName });
      setProjects([...projects, response.data]);
      setNewProjectName("");
      setNewlyCreatedProject(response.data);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setNewlyCreatedProject(null); // Reset on close
  };

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  return (
    <div className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <button
          onClick={logout}
          className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <main>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Your Projects</h2>
          {/* 👇 Button to open the modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            + Create New Project
          </button>
        </div>

        {/* ... (loading and project list JSX remains the same) ... */}
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project._id} to={`/project/${project._id}`}>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                  <h3 className="text-xl font-bold mb-2">
                    {project.projectName}
                  </h3>
                  <p className="text-sm text-gray-400 break-all">
                    ID: {project._id}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-800 rounded-lg">
            <p>You haven't created any projects yet.</p>
            <p className="text-gray-400 mt-2">
              Click "Create New Project" to get started!
            </p>
          </div>
        )}
      </main>

      {/* 👇 Render the Modal and the form inside it */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          newlyCreatedProject
            ? "Project Created Successfully!"
            : "Create a New Project"
        }
      >
        {newlyCreatedProject ? (
          // --- SUCCESS VIEW ---
          <div className="space-y-4">
            <p>
              Your new project has been created. Follow the steps below to start
              tracking logs.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">
                1. Download your custom script
              </label>
              <button
                onClick={handleDownload}
                className="w-full inline-block text-center py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Download monitor.js
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                2. Add the script to your website
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Place this tag just before the closing `&lt;/body&gt;` tag in
                your HTML file.
              </p>
              <pre className="bg-gray-900 p-3 rounded-md text-sm text-yellow-300 overflow-x-auto">
                <code>&lt;script src="./monitor.js"&gt;&lt;/script&gt;</code>
              </pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          // --- FORM VIEW ---
          <form onSubmit={handleCreateProject}>
            {/* The original form JSX goes here */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="My Awesome Website"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
