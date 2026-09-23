import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../services/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { const result = await forgotPassword(email); toast.success(result.message || 'Reset email sent'); }
    catch (error) { toast.error(error.message || 'Unable to send reset email'); }
    finally { setLoading(false); }
  };
  return <div className="auth-page"><div className="auth-card"><div className="auth-brand"><img src="/img/Arken-Logo.png" alt="Arkentech" /><div><strong>Arkentech</strong><span>Solutions</span></div></div><h1>Forgot password</h1><p className="muted">Enter the email address linked to your account.</p><Form onSubmit={submit}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Form.Group><Button className="w-100" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button></Form><div className="auth-links"><Link to="/login">Back to login</Link></div></div></div>;
}
