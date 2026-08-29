import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import InmueblesPage from './pages/InmueblesPage.js';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/inmuebles"
            element={
              <ProtectedRoute>
                <InmueblesPage />
              </ProtectedRoute>
            }
          />
          {/* Default fallback redirects to /inmuebles */}
          <Route path="*" element={<Navigate to="/inmuebles" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
