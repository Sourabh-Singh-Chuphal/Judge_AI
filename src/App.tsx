import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import About from './pages/About';
import Features from './pages/Features';
import Dashboard from './pages/Dashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import AuditLog from './pages/AuditLog';
import Upload from './pages/Upload';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages that use full-screen layout (no footer)
const FULL_SCREEN = ['/login'];
// Pages that don't need navbar
const NO_NAV = ['/login'];

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function DashboardRoute({ children }: { children: ReactElement }) {
  const { user, isPdfReady } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isPdfReady) return <Navigate to="/upload" replace />;
  return children;
}

function Layout() {
  const { pathname } = useLocation();
  const noNav = NO_NAV.includes(pathname);
  const noFooter = FULL_SCREEN.includes(pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!noNav && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/resources" element={<Features />} />
          <Route path="/dashboard" element={<DashboardRoute><Dashboard /></DashboardRoute>} />
          <Route path="/dashboard/review" element={<ProtectedRoute><ReviewerDashboard /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
