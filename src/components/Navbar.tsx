import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, School, Users, LayoutDashboard, User, BookOpen, MessageSquare } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="superadmin-navbar">
      <div className="nav-brand">
        <School className="brand-icon" size={24} />
        <span>SuperAdmin Portal</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/schools" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <School size={20} />
          <span>Schools</span>
        </NavLink>
        <NavLink to="/subjects" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <BookOpen size={20} />
          <span>Subjects</span>
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Users size={20} />
          <span>Users</span>
        </NavLink>
        <NavLink to="/contact-messages" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <MessageSquare size={20} />
          <span>Messages</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </div>
      <div className="nav-user">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">System Root</span>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
