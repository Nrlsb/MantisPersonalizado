import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CreateIssue from './pages/CreateIssue';
import IssueDetail from './pages/IssueDetail';
import Issues from './pages/Issues';

// Dashboard Placeholder - could redirect to projects or be its own thing
const Dashboard = () => <div className="p-4"><h1>Bienvenido al Panel de Control</h1><p>Selecciona un proyecto desde la barra lateral.</p></div>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/projects/:projectId/create-issue" element={<CreateIssue />} />
                  <Route path="/issues" element={<Issues />} />
                  <Route path="/issues/:id" element={<IssueDetail />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
