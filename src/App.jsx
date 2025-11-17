import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AppShell from './layouts/AppShell.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import UserDetailPage from './pages/UserDetailPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route
      path="/login"
      element={
        <PrivateRoute>
          <LoginPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PrivateRoute>
          <RegisterPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/app"
      element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="users/:id" element={<UserDetailPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/app" replace />} />
  </Routes>
);

export default App;
