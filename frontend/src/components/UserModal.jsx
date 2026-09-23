import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { createUser, updateUser } from '../services/users';

const emptyUser = {
  name: '', email: '', username: '', password: '', role: 'Client', userStatus: 1,
  campaignCount: 0, totalAccepted: 0, totalRejected: 0, totalUnderReview: 0,
  totalLeads: 0, loginStatus: 0,
};

export default function UserModal({ show, mode, user, onClose, onSaved }) {
  const [form, setForm] = useState(emptyUser);
  const readOnly = mode === 'view';

  useEffect(() => {
    if (show) setForm(user ? { ...emptyUser, ...user, password: '' } : emptyUser);
  }, [show, user]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (!form.name || !form.email || !form.username || !form.role || (mode === 'add' && !form.password)) {
        toast.error('Please complete all required fields');
        return;
      }
      if (mode === 'add') {
        await createUser(form);
        toast.success('User added successfully');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await updateUser(form._id, payload);
        toast.success('User updated successfully');
      }
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Unable to save user');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>User Details</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="form-grid four">
            <Form.Group><Form.Label>Name</Form.Label><Form.Control value={form.name} onChange={set('name')} disabled={readOnly} required /></Form.Group>
            <Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={set('email')} disabled={readOnly} required /></Form.Group>
            <Form.Group><Form.Label>Username</Form.Label><Form.Control value={form.username} onChange={set('username')} disabled={readOnly} required /></Form.Group>
            {mode === 'add' && <Form.Group><Form.Label>Password</Form.Label><Form.Control type="password" value={form.password} onChange={set('password')} required /></Form.Group>}
            <Form.Group><Form.Label>Role</Form.Label><Form.Select value={form.role} onChange={set('role')} disabled={readOnly}><option value="Super">Super Admin</option><option value="Admin">Admin</option><option value="Client">Client</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Accepted Leads</Form.Label><Form.Control type="number" value={form.totalAccepted || 0} disabled /></Form.Group>
            <Form.Group><Form.Label>Under Review Leads</Form.Label><Form.Control type="number" value={form.totalUnderReview || 0} disabled /></Form.Group>
            <Form.Group><Form.Label>Rejected Leads</Form.Label><Form.Control type="number" value={form.totalRejected || 0} disabled /></Form.Group>
            <Form.Group><Form.Label>Total Leads</Form.Label><Form.Control type="number" value={form.totalLeads || 0} disabled /></Form.Group>
            <Form.Group><Form.Label>Campaign Count</Form.Label><Form.Control type="number" value={form.campaignCount || 0} disabled /></Form.Group>
            <Form.Group><Form.Label>User Status</Form.Label><Form.Select value={String(form.userStatus ?? 0)} onChange={set('userStatus')} disabled={readOnly}><option value="1">Active</option><option value="0">Inactive</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Login Status</Form.Label><Form.Select value={String(form.loginStatus ?? 0)} disabled><option value="1">Online</option><option value="0">Offline</option></Form.Select></Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>{mode !== 'view' && <Button type="submit">{mode === 'add' ? 'Add' : 'Update'}</Button>}<Button variant="secondary" onClick={onClose}>Close</Button></Modal.Footer>
      </Form>
    </Modal>
  );
}
