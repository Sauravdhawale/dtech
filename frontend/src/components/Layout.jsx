import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserCircle } from 'lucide-react';
import { logout } from '../store/authSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);

  const handleLogout = async () => {
    await dispatch(logout({ email: user?.email, token: localStorage.getItem('token') }));
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

        <div className="legacy-profile-menu">
          <NavLink to="/profile" className="legacy-avatar-link" title={user?.name || 'Profile'}>
            <UserCircle size={28} />
          </NavLink>
          <button type="button" className="legacy-logout" onClick={handleLogout}>Logout</button>
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
