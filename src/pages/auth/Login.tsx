import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Loader2, ShieldCheck, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Login.css'; // Import the CSS file

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();   
  const navigate = useNavigate();

  useEffect(() => {
    // Normal login flow, no setup check needed
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
   
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.user.role !== 'superadmin') {
        toast.error('Access denied. This portal is for superadmins only.');
        return;
      }

      login(data.token, data.user);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Failed to login. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', 
              padding: '16px', 
              borderRadius: '16px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <ShieldCheck size={56} color="#6366f1" strokeWidth={1.5} />
            </div>
          </div>
          <h1>System Root Access</h1>
          <p>Secure portal for super administrators</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              {/* <Mail 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} 
              /> */}
              <input
                id="email"
                type="email"
                placeholder="admin@cbcelearning.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              {/* <Lock 
                size={18} 
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} 
              /> */}
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

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>

          <br />
          
          <button type="button"
           className="btn btn-secondary"
           style={{marginTop: "10px"}}
           onClick={() => navigate('/register')}>
            Register
          </button>
        </form>

        <div className="security-badge">
          <Fingerprint size={16} />
          <span>Secured with 256-bit encryption</span>
          <ShieldCheck size={16} />
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
          <p>© 2024 CBC eLearning Platform. All rights reserved.</p>
          <p style={{ marginTop: '4px' }}>Version 2.0.0 | Superadmin Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;