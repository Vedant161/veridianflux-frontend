import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import ProjectDetailsPage from './pages/ProjectDetailsPage';

function App() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
            path="/project/:projectId"
            element={
              <PrivateRoute>
                <ProjectDetailsPage />
              </PrivateRoute>
            }
          />

        <Route path="/" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;