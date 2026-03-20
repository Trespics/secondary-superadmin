import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { UserPlus, Search, Shield, School, Loader2, X, Edit2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  school_id: string;
  is_active: boolean;
  created_at: string;
  schools?: {
    name: string;
  };
}

interface SchoolOption {
  id: string;
  name: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    school_id: '',
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const fetchData = async () => {
    try {
      const [usersRes, schoolsRes] = await Promise.all([
        api.get('/superadmin/admins'), 
        api.get('/superadmin/schools')
      ]);
      setUsers(usersRes.data || []);
      setSchools(schoolsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load users and schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      school_id: '',
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.school_id) {
      toast.error('Please select a school');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/superadmin/register-admin', formData);
      toast.success('School admin registered successfully');
      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error registering admin:', error);
      toast.error(error.response?.data?.error || 'Failed to register admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.role === 'admin' && (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="page-title">
          <h2>School Administrators</h2>
          <p>Manage administrative accounts for each school</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <UserPlus size={20} />
          Register Admin
        </button>
      </div>

      <div className="card-table">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input 
              type="text" 
              placeholder="Search admins by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 size={40} className="animate-spin" color="#6366f1" />
            <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading users...</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Assigned School</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Shield size={18} color="#6366f1" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>ID: {user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <School size={16} color="#6b7280" />
                        {user.schools?.name || 'Unknown School'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 13 }}>
                        <span>{user.email}</span>
                        <span style={{ color: '#6b7280' }}>{user.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-success' : ''}`}>
                        {user.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No school administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register School Admin</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="school">Select School*</label>
                  <select 
                    id="school"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    value={formData.school_id}
                    onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                    required
                  >
                    <option value="">-- Choose School --</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="adminName">Admin Name*</label>
                  <input 
                    id="adminName"
                    type="text" 
                    placeholder="Full name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adminEmail">Email Address*</label>
                  <input 
                    id="adminEmail"
                    type="email" 
                    placeholder="admin@school.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adminPhone">Phone Number</label>
                  <input 
                    id="adminPhone"
                    type="text" 
                    placeholder="+254..." 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adminPass">Initial Password*</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      id="adminPass"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required 
                      style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Register Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
