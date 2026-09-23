import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { Lock, Mail } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { clearAuthError, login } from '../store/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { token, loading, error } = useSelector((state) => state.auth);
  const [remember, setRemember] = useState(true);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (token) navigate(location.state?.from?.pathname || '/', { replace: true });
  }, [token, navigate, location.state]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    if (!remember) localStorage.removeItem('remember_email');
    else localStorage.setItem('remember_email', form.email);
    dispatch(login(form));
  };

  useEffect(() => {
    const saved = localStorage.getItem('remember_email');
    if (saved) setForm((p) => ({ ...p, email: saved }));
  }, []);

  return (
    <div className="legacy-login-page">
      <div className="legacy-login-card">
        <div className="legacy-login-brand">
          <img src="https://dtechsupreme.com/img/Arken-Logo.png" alt="Arkentech Solutions" />
        </div>

        {params.get('reason') === 'session_expired' && (
          <div className="legacy-alert">Your session expired. Please sign in again.</div>
        )}
        {error && <div className="legacy-alert">{error}</div>}

        <Form onSubmit={submit}>
          <InputGroup className="mb-2">
            <Form.Control
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              autoFocus
              placeholder="Email"
            />
            <InputGroup.Text><Mail size={16} /></InputGroup.Text>
          </InputGroup>

          <InputGroup className="mb-3">
            <Form.Control
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              placeholder="Password"
            />
            <InputGroup.Text><Lock size={16} /></InputGroup.Text>
          </InputGroup>

          <div className="legacy-login-actions">
            <Form.Check
              type="checkbox"
              label="Remember Me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>
        </Form>

        <Link className="legacy-forgot" to="/forgot-password">I forgot my password</Link>
      </div>
    </div>
  );
}
