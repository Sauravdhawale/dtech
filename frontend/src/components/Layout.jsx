import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, UserCircle } from 'lucide-react';
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
      <header className="topbar">
        <div className="brand-wrap">
          <img src="/img/Arken-Logo.png" className="brand-logo" alt="Arkentech" />
          <div className="brand-text"><strong>Arkentech</strong><span>Solutions</span></div>
        </div>
        <nav className="main-nav">
          <NavLink to="/" end>Home</NavLink>
          {(user?.role === 'Admin' || user?.role === 'Super') && <NavLink to="/users">Users</NavLink>}
        </nav>
        <div className="profile-menu">
          <NavLink to="/profile" className="profile-link" title={user?.name || 'Profile'}><UserCircle size={28} /></NavLink>
          <button className="icon-button" onClick={handleLogout} title="Logout"><LogOut size={19} /></button>
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="footer-bar"><span>ArkenTech Solutions..</span><span>Version 0.3.2</span></footer>
    </div>
  );
}
