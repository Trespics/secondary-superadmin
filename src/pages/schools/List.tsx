import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { School, Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/SchoolManagement.css';

interface SchoolData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  motto: string;
  logo_url: string;
  created_at: string;
}

const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    motto: '',
    logo_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const fetchSchools = async () => {
    try {
      const { data } = await api.get('/superadmin/schools');
      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleOpenModal = (school?: SchoolData) => {
    if (school) {
      setEditingSchool(school);
      setFormData({
        name: school.name,
        email: school.email || '',
        phone: school.phone || '',
        address: school.address || '',
        motto: school.motto || '',
        logo_url: school.logo_url || ''
      });
    } else {
      setEditingSchool(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        motto: '',
        logo_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchool(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSchool) {
        await api.put(`/superadmin/schools/${editingSchool.id}`, formData);
        toast.success('School updated successfully');
      } else {
        await api.post('/superadmin/schools', formData);
        toast.success('School created successfully');
      }
      fetchSchools();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving school:', error);
      toast.error(error.response?.data?.error || 'Failed to save school');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/superadmin/schools/${id}`);
        toast.success('School deleted successfully');
        fetchSchools();
      } catch (error) {
        console.error('Error deleting school:', error);
        toast.error('Failed to delete school');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const { data } = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, logo_url: data.url });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="school-management-container">
      <div className="school-management-header">
        <div className="header-content">
          <h1>School Management</h1>
          <p>Register and manage schools across the platform</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add School
        </button>
      </div>

      <div className="schools-table-container">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search schools by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="spinner" />
            <p>Loading schools...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="schools-table">
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Contact Information</th>
                  <th>Address</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school) => (
                    <tr key={school.id}>
                      <td className="school-name-cell">
                        <div className="school-info">
                          <div className="school-icon">
                            <School size={20} />
                          </div>
                          <div>
                            <div className="school-name">{school.name}</div>
                            <div className="school-motto">{school.motto || 'No motto set'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div className="contact-item">
                            <Mail size={14} />
                            <span>{school.email || 'N/A'}</span>
                          </div>
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{school.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="address-info">
                          <MapPin size={14} />
                          <span>{school.address || 'N/A'}</span>
                        </div>
                      </td>
                      <td>{new Date(school.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit-btn" title="Edit" onClick={() => handleOpenModal(school)}>
                            <Edit2 size={18} />
                          </button>
                          <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(school.id, school.name)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No schools found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingSchool ? 'Edit School' : 'Register New School'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">School Name *</label>
                  <input 
                    id="name"
                    type="text" 
                    placeholder="Enter school name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      id="email"
                      type="email" 
                      placeholder="school@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input 
                      id="phone"
                      type="text" 
                      placeholder="+254..." 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Physical Address</label>
                  <input 
                    id="address"
                    type="text" 
                    placeholder="Location, City" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="motto">School Motto</label>
                  <input 
                    id="motto"
                    type="text" 
                    placeholder="Education for life..." 
                    value={formData.motto}
                    onChange={(e) => setFormData({...formData, motto: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>School Logo</label>
                  <div className="logo-upload-section">
                    {formData.logo_url && (
                      <div className="logo-preview">
                        <img src={formData.logo_url} alt="School Logo" />
                      </div>
                    )}
                    <div className="upload-control">
                      <input 
                        id="logo-upload"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="file-input"
                      />
                      <label 
                        htmlFor="logo-upload" 
                        className="upload-btn"
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={16} className="spinner" />
                            Uploading...
                          </>
                        ) : (
                          'Choose Image'
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      {editingSchool ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingSchool ? 'Update School' : 'Register School'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManagement;