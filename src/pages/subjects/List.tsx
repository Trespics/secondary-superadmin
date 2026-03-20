import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  School, 
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

import { toast } from 'sonner';

interface SubjectData {
  id: string;
  school_id: string;
  name: string;
  code: string;
  image_url: string;
  created_at: string;
  schools?: {
    name: string;
  };
}

interface SchoolData {
  id: string;
  name: string;
  address?: string;
  logo_url?: string;
}

interface GradeData {
  id: string;
  name: string;
  school_id: string;
}

interface AssignmentData {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
  subjects?: SubjectData;
}

const SubjectManagement: React.FC = () => {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<GradeData | null>(null);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);

  const [formData, setFormData] = useState({
    school_id: '',
    name: '',
    code: '',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await api.get('/superadmin/schools');
      setSchools(res.data || []);
    } catch (error) {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async (schoolId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/superadmin/classes?school_id=${schoolId}`);
      setGrades(res.data || []);
    } catch (error) {
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (gradeId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/superadmin/assignments?class_id=${gradeId}`);
      setAssignments(res.data || []);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSchoolClick = (school: SchoolData) => {
    setSelectedSchool(school);
    fetchGrades(school.id);
  };

  const handleGradeClick = (grade: GradeData) => {
    setSelectedGrade(grade);
    fetchAssignments(grade.id);
  };

  const handleBackToSchools = () => {
    setSelectedSchool(null);
    setSelectedGrade(null);
    setGrades([]);
    setAssignments([]);
    setSearchTerm('');
  };

  const handleBackToGrades = () => {
    setSelectedGrade(null);
    setAssignments([]);
    setSearchTerm('');
  };

  const handleOpenModal = (subject?: SubjectData) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        school_id: subject.school_id,
        name: subject.name,
        code: subject.code || '',
        image_url: subject.image_url || ''
      });
    } else {
      setEditingSubject(null);
      setFormData({
        school_id: selectedSchool?.id || '',
        name: '',
        code: '',
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.school_id) {
      toast.error('Please select a school');
      return;
    }
    setIsSubmitting(true);
    try {
      let subjectId = '';
      if (editingSubject) {
        await api.put(`/superadmin/subjects/${editingSubject.id}`, formData);
        subjectId = editingSubject.id;
        toast.success('Subject updated successfully');
      } else {
        const res = await api.post('/superadmin/subjects', formData);
        subjectId = res.data.id;
        
        if (selectedGrade) {
          await api.post('/superadmin/assignments', {
            class_id: selectedGrade.id,
            subject_id: subjectId,
            teacher_id: null
          });
          toast.success('Subject created and linked to grade');
        } else {
          toast.success('Subject created successfully');
        }
      }
      
      if (selectedGrade) fetchAssignments(selectedGrade.id);
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      toast.error(error.response?.data?.error || 'Failed to save subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from this grade?`)) {
      try {
        await api.delete(`/superadmin/assignments/${id}`);
        toast.success('Subject removed from grade');
        if (selectedGrade) fetchAssignments(selectedGrade.id);
      } catch (error) {
        toast.error('Failed to remove subject');
      }
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGrades = grades.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(a => 
    a.subjects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subjects?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="subject-management">
      <div className="page-header">
        <div className="page-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedSchool && (
              <button 
                onClick={selectedGrade ? handleBackToGrades : handleBackToSchools}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2>
              {!selectedSchool ? 'Subject Management' : 
               !selectedGrade ? selectedSchool.name : 
               `${selectedGrade.name} Subjects`}
            </h2>
          </div>
          <p>
            {!selectedSchool ? 'Select a school to manage its subjects' : 
             !selectedGrade ? 'Select a grade level' : 
             `Manage subjects for ${selectedGrade.name} at ${selectedSchool.name}`}
          </p>
        </div>
        {selectedGrade && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={20} />
            Add Subject
          </button>
        )}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '24px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input 
              type="text" 
              placeholder={!selectedSchool ? "Search schools..." : !selectedGrade ? "Search grades..." : "Search subjects..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', width: '100%' }}
            />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 size={40} className="animate-spin" color="#6366f1" />
            <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading content...</p>
          </div>
        ) : (
          <div>
            {!selectedSchool ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filteredSchools.map(school => (
                  <div key={school.id} className="card" style={{ cursor: 'pointer', padding: '20px' }} onClick={() => handleSchoolClick(school)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                        {school.logo_url ? <img src={school.logo_url} alt={school.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : <School size={28} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0 }}>{school.name}</h4>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{school.address || 'Global School'}</span>
                      </div>
                      <ChevronRight size={20} color="#9ca3af" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !selectedGrade ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {filteredGrades.map(grade => (
                  <div key={grade.id} className="card" style={{ cursor: 'pointer', padding: '20px' }} onClick={() => handleGradeClick(grade)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <GraduationCap size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0 }}>{grade.name}</h4>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Grade Level</span>
                      </div>
                      <ChevronRight size={20} color="#9ca3af" />
                    </div>
                  </div>
                ))}
                {filteredGrades.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: '#6b7280' }}>No grades found for this school.</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment) => (
                    <div 
                      key={assignment.id} 
                      className="card" 
                      style={{ 
                        padding: '0', 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid var(--border-color)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 20px -5px rgb(0 0 0 / 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow)';
                      }}
                    >
                      <div style={{ height: '160px', background: '#f3f4f6', position: 'relative', overflow: 'hidden' }}>
                        {assignment.subjects?.image_url ? (
                          <img 
                            src={assignment.subjects.image_url} 
                            alt={assignment.subjects.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            <BookOpen size={48} />
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-icon" 
                            style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(assignment.subjects); }}
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>{assignment.subjects?.name}</h3>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: 600, 
                              color: 'var(--primary)', 
                              background: 'rgba(99, 102, 241, 0.1)', 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}>
                              {assignment.subjects?.code || 'NO CODE'}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Added: {assignment.subjects ? new Date(assignment.subjects.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                            <Link to={`/subjects/${assignment.subject_id}`} style={{ flex: 1 }}>
                              <button className="btn btn-outline" style={{ width: '100%', fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                Manage Content <ArrowRight size={14} />
                              </button>
                            </Link>
                          </div>
                          <button 
                            className="btn-icon" 
                            style={{ color: 'var(--danger)', padding: '4px' }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteAssignment(assignment.id, assignment.subjects?.name || ''); }}
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
                    <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No subjects assigned to this grade.</p>
                    <button className="btn btn-primary" style={{ marginTop: '16px', width: 'auto', display: 'inline-flex' }} onClick={() => handleOpenModal()}>
                      <Plus size={20} /> Add First Subject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
              <button className="btn-icon" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Subject Name*</label>
                  <input 
                    id="name"
                    type="text" 
                    placeholder="e.g. Mathematics" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="code">Subject Code</label>
                  <input 
                    id="code"
                    type="text" 
                    placeholder="e.g. MATH-01" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="image">Subject Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {formData.image_url && (
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={formData.image_url} alt="Subject" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <input 
                        id="image-upload"
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setUploading(true);
                          const uploadFormData = new FormData();
                          uploadFormData.append('file', file);

                          try {
                            const { data } = await api.post('/upload', uploadFormData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            setFormData({ ...formData, image_url: data.url });
                            toast.success('Image uploaded successfully');
                          } catch (error) {
                            console.error('Upload error:', error);
                            toast.error('Failed to upload image');
                          } finally {
                            setUploading(false);
                          }
                        }}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor="image-upload" 
                        className="btn btn-ghost" 
                        style={{ 
                          width: 'auto', 
                          display: 'inline-flex', 
                          padding: '8px 16px', 
                          fontSize: '14px',
                          border: '1px dashed var(--border-color)',
                          cursor: 'pointer'
                        }}
                      >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ImageIcon size={16} />
                            Choose Image
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingSubject ? 'Update Subject' : 'Add Subject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;

