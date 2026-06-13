import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Views / Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientProfile from './pages/ClientProfile';
import Appointments from './pages/Appointments';
import Consultations from './pages/Consultations';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Astrologers from './pages/Astrologers';

// Import Customer Views
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerAstrologers from './pages/CustomerAstrologers';
import CustomerBook from './pages/CustomerBook';
import CustomerRemedies from './pages/CustomerRemedies';

// Import Layout Components
import Sidebar from './components/Sidebar';
import CustomerSidebar from './components/CustomerSidebar';
import Header from './components/Header';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow shadow-indigo-500/10 flex items-center justify-center text-white font-extrabold text-xl">
            🔮
          </div>
          <span className="text-xs text-gray-500 font-semibold tracking-widest uppercase">Synchronizing Portal Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main Layout Frame containing Sidebar, Header, Content Scroll area (For Admin/Astrologer)
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen w-full bg-[#090d16] text-gray-100 font-sans selection:bg-[#6366f1] selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Scrollable View Area */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

// Customer Layout Frame containing CustomerSidebar, Header, Content Scroll area (For Customer)
const CustomerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen w-full bg-[#090d16] text-gray-100 font-sans selection:bg-[#6366f1] selection:text-white">
      {/* Navigation Sidebar */}
      <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Scrollable View Area */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

// Component to handle inner routes so we have access to useAuth hook
const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  // If unauthenticated, they can only view the public landing page or the login/register screen
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        {/* Redirect everything else to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If authenticated as customer
  if (user?.role === 'customer') {
    return (
      <Routes>
        {/* If logged in, redirect auth routes to home dashboard */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <CustomerDashboard />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/find-astrologer"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <CustomerAstrologers />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/book"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <CustomerBook />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/remedies"
          element={
            <ProtectedRoute>
              <CustomerLayout>
                <CustomerRemedies />
              </CustomerLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Admin / Astrologer CRM Routes
  return (
    <Routes>
      {/* If logged in, redirect auth routes to home dashboard */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* Protected CRM Dashboard routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Clients />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ClientProfile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Appointments />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultations"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Consultations />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Payments />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/astrologers"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Astrologers />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
