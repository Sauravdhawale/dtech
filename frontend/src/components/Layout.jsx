import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);
  const [open, setOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const goDashboard = () => {
    setOpen(false);
    navigate('/');
  };

  const handleLogout = async () => {
    await dispatch(logout({ email: user?.email, token: localStorage.getItem('token') }));
    setOpen(false);
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="legacy-topbar">
        <div className="legacy-brand-wrap">
          <img src="https://dtechsupreme.com/img/Arken-Logo.png" alt="Arkentech Solutions" />
        </div>

        <nav className="legacy-nav">
          <NavLink to="/" end>Home</NavLink>
          {(user?.role === 'Admin' || user?.role === 'Super') && <NavLink to="/users">Users</NavLink>}
        </nav>

        <div className="legacy-profile-menu" ref={profileRef}>
          <button
            type="button"
            className="legacy-avatar-link"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open profile menu"
          >
            <img src="https://dtechsupreme.com/img/default-profile.png" alt="Profile" />
          </button>

          {open && (
            <div className="legacy-user-dropdown">
              <div className="legacy-user-dropdown-head">
                <img src="https://dtechsupreme.com/img/default-profile.png" alt="Profile" />
                <strong title={user?.email}>{user?.email || 'user@arkentechsolutions.com'}</strong>
                <small>Member since</small>
              </div>

              <div className="legacy-user-dropdown-stats">
                <button type="button" onClick={goDashboard}>Followers</button>
                <button type="button" onClick={goDashboard}>Sales</button>
                <button type="button" onClick={goDashboard}>Friends</button>
              </div>

              <div className="legacy-user-dropdown-actions">
                <button type="button" onClick={() => { setOpen(false); navigate('/profile'); }}>Profile</button>
                <button type="button" onClick={handleLogout}>Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="page-content"><Outlet /></main>

      <footer className="footer-bar">
        <span>ArkenTech Solutions..</span>
        <span>Version 0.3.2</span>
      </footer>
    </div>
  );
}
