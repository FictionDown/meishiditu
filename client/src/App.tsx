import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import SharePage from './pages/SharePage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<MainPage />} />
          <Route path="/share/:shareId" element={<SharePage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
