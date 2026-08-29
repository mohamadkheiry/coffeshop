import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';

const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading">در حال آماده‌سازی کافه صدا…</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
