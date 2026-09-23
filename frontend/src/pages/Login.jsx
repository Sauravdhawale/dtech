import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, clearAuthError } from '../store/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => { if (token) navigate(location.state?.from?.pathname || '/', { replace: true }); }, [token, navigate, location.state]);
  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const submit = (e) => { e.preventDefault(); dispatch(login(form)); };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><img src="/img/Arken-Logo.png" alt="Arkentech" /><div><strong>Arkentech</strong><span>Solutions</span></div></div>
        <h1>Sign in</h1>
        <p className="muted">Use your Arkentech CRM account.</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <Form onSubmit={submit}>
          <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required autoFocus /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required /></Form.Group>
          <Button className="w-100" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</Button>
        </Form>
        <div className="auth-links"><Link to="/forgot-password">Forgot password?</Link></div>
      </div>
    </div>
  );
}
