import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Brand from '../components/Brand';
import { api } from '../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: '' });
  const alreadyAuthenticated = sessionStorage.getItem('cafe-seda-auth') === '1';
  if (alreadyAuthenticated) return <Navigate to="/admin" replace />;

  async function submit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      await api('/api/auth/login', { method: 'POST', body: JSON.stringify(form) });
      sessionStorage.setItem('cafe-seda-auth', '1');
      navigate('/admin', { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <main className="admin-login">
      <Helmet><title>ورود به مدیریت | کافه صدا</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="admin-login__visual"><a href="/" className="admin-login__back">بازگشت به سایت</a><div><Brand /><h1>صدای کافه را<br />شما می‌سازید.</h1><p>منو، رسانه‌ها و محتوای سایت را از یک‌جا مدیریت کنید.</p></div></div>
      <form className="admin-login__form" onSubmit={submit}>
        <div className="admin-login__form-inner">
          <h2>ورود به پنل مدیریت</h2><p>اطلاعات حساب مدیر را وارد کنید.</p>
          <label>نام کاربری<div className="input-with-icon"><UserRound /><input autoFocus autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div></label>
          <label>رمز عبور<div className="input-with-icon"><LockKeyhole /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="نمایش رمز عبور">{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
          {status.error && <p className="form-error" role="alert">{status.error}</p>}
          <button className="admin-primary-button" disabled={status.loading}>{status.loading ? 'در حال ورود…' : 'ورود به مدیریت'}</button>
        </div>
      </form>
    </main>
  );
}

