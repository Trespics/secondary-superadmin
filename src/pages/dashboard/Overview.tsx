import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { School, Users, GraduationCap, BookOpen, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Overview.css';

interface Stats {
  totalSchools: number;
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/superadmin/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
  
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading overview...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Platform Overview</h1>
          <p>Welcome to the CBD eLearning Management Dashboard</p>
        </div>
        <div className="header-right">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-grid">
        <a href="/schools" className='stat-link'>
        <div className="stat-card">
          <div className="stat-icon school-icon">
            <School size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalSchools || 0}</div>
            <div className="stat-label">Registered Schools</div>
          </div>
        </div>
        </a>

        <a href="/users" className='stat-link'>
        <div className="stat-card">
          <div className="stat-icon student-icon">
            <GraduationCap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalStudents || 0}</div>
            <div className="stat-label">Active Students</div>
          </div>
        </div>
        </a>

        <a href="" className='stat-link'>
        <div className="stat-card">
          <div className="stat-icon teacher-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalTeachers || 0}</div>
            <div className="stat-label">Teachers</div>
          </div>
        </div>
        </a>

        <a href="" className='stat-link'>
        <div className="stat-card">
          <div className="stat-icon user-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        </a>

        <a href="" className='stat-link'>
        <div className="stat-card">
          <div className="stat-icon user-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalSubjects || 0}</div>
            <div className="stat-label">Subjects</div>
          </div>
        </div>
        </a>


        <a href="/library-management" className='stat-link'>
        <div className="stat-card">
          <div className="stat-icon user-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats?.totalSubjects || 0}</div>
            <div className="stat-label">Library</div>
          </div>
        </div>
        </a>

      </div>

      <div className="dashboard-layout">
        <div className="performance-section">
          <div className="section-header">
            <TrendingUp size={20} />
            <h3>Platform Performance</h3>
          </div>
          <div className="chart-placeholder">
            <p>Growth analytics chart will appear here</p>
          </div>
        </div>

        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="actions-list">
            <a href="/schools" className="action-button primary">
              Add New School
              <ArrowRight size={18} />
            </a>
            <a href="/users" className="action-button secondary">
              Register Admin
              <ArrowRight size={18} />
            </a>
            <a href="/contact-messages" className="action-button secondary">
              Messages
              <ArrowRight size={18} />
            </a>
            <a href="/superadmin/settings" className="action-button secondary">
              System Settings
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;