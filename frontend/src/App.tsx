import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import LoginPage from './pages/LoginPage.js';
import AddUser from './pages/AddUser.js';
import InmuebleList from './pages/InmuebleList.js';
import UserList from './pages/UserList.js';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<AddUser />} />
          <Route
            path="/inmuebles"
            element={
              <ProtectedRoute>
                <InmuebleList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            }
          />
          {/* Por defecto redirige a /inmuebles */}
          <Route path="*" element={<Navigate to="/inmuebles" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
