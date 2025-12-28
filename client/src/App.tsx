import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Splash from './components/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import CompatibilityChat from './pages/CompatibilityChat';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { ReactNode } from 'react';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return !user ? <>{children}</> : <Navigate to="/compatibility" />;
}

function AppContent() {
  const { user, loading } = useAuth();

  return (
    <>
      {loading && <Splash />}
      {user && <Navigation />}
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <Discover />
            </PrivateRoute>
          }
        />
        <Route
          path="/compatibility"
          element={
            <PrivateRoute>
              <CompatibilityChat />
            </PrivateRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <PrivateRoute>
              <Matches />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/policy" element={<Navigate to="/privacy" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

