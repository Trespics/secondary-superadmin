import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Lock, Mail, Loader2, ShieldCheck, User, ArrowRight, Eye, EyeOff, Phone } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Login.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    setIsCheckingSetup(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/superadmin/setup', { name, email, phone, password });
      toast.success('System setup successfully! Please login.');
      navigate('/login');
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.response?.data?.error || 'Failed to setup system');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSetup) {
    return (
      <div className="auth-container">
        <Loader2 className="animate-spin" size={48} color="#6366f1" />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', 
            padding: '16px', 
            borderRadius: '16px',
            margin: '0 auto 16px',
            width: 'fit-content',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <ShieldCheck size={56} color="#06b6d4" strokeWidth={1.5} />
          </div>
          <h1>Superadmin Registration</h1>
          <p>Register a new system administrator account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} 
              />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} 
              />
              <input
                id="email"
                type="email"
                placeholder="master@cbcelearning.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} 
              />
              <input
                id="phone"
                type="tel"
                placeholder="+254 700 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} 
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  zIndex: 2
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} 
              />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  zIndex: 2
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Register Superadmin <ArrowRight size={18} />
              </>
            )}
          </button>

          <br />
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/login')}>
            Login
          </button>
        </form>

        <div className="security-badge">
          <span>This setup page is only available for first-time use.</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
