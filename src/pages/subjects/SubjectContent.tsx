import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  ArrowLeft,
  ChevronRight,
  BookOpen,
  LayoutGrid,
  ListTree,
  Target
} from 'lucide-react';

import { toast } from 'sonner';

interface Strand {
  id: string;
  name: string;
}

interface SubStrand {
  id: string;
  strand_id: string;
  name: string;
}

interface LearningOutcome {
  id: string;
  sub_strand_id: string;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

type ViewLevel = 'strands' | 'sub-strands' | 'learning-outcomes';

const SubjectContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('strands');
  
  const [strands, setStrands] = useState<Strand[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<Strand | null>(null);
  
  const [subStrands, setSubStrands] = useState<SubStrand[]>([]);
  const [selectedSubStrand, setSelectedSubStrand] = useState<SubStrand | null>(null);
  
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'strand' | 'sub-strand' | 'lo'>('strand');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const fetchSubject = async () => {
    try {
      const { data } = await api.get(`/superadmin/subjects`);
      const current = (data || []).find((s: any) => s.id === id);
      setSubject(current);
    } catch (err) {
      console.error("Error fetching subject:", err);
    }
  };

  const fetchStrands = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cbc/strands?subject_id=${id}`);
      setStrands(data || []);
    } catch (err) {
      toast.error("Failed to load strands");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubStrands = async (strandId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cbc/sub-strands?strand_id=${strandId}`);
      setSubStrands(data || []);
    } catch (err) {
      toast.error("Failed to load sub-strands");
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningOutcomes = async (subStrandId: string) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cbc/learning-outcomes?sub_strand_id=${subStrandId}`);
      setLearningOutcomes(data || []);
    } catch (err) {
      toast.error("Failed to load learning outcomes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubject();
    fetchStrands();
  }, [id]);

  const handleStrandClick = (strand: Strand) => {
    setSelectedStrand(strand);
    setViewLevel('sub-strands');
    fetchSubStrands(strand.id);
  };

  const handleSubStrandClick = (subStrand: SubStrand) => {
    setSelectedSubStrand(subStrand);
    setViewLevel('learning-outcomes');
    fetchLearningOutcomes(subStrand.id);
  };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    if (level === 'strands') {
      setSelectedStrand(null);
      setSelectedSubStrand(null);
      setViewLevel('strands');
      fetchStrands();
    } else if (level === 'sub-strands') {
      setSelectedSubStrand(null);
      setViewLevel('sub-strands');
      if (selectedStrand) fetchSubStrands(selectedStrand.id);
    }
  };

  const handleOpenModal = (type: 'strand' | 'sub-strand' | 'lo', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setFormData({
      name: item?.name || "",
      description: type === 'lo' ? (item?.description || "") : ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let endpoint = '';
      if (modalType === 'strand') endpoint = '/cbc/strands';
      else if (modalType === 'sub-strand') endpoint = '/cbc/sub-strands';
      else endpoint = '/cbc/learning-outcomes';

      const payload: any = { ...formData };
      if (modalType === 'strand') payload.subject_id = id;
      else if (modalType === 'sub-strand') payload.strand_id = selectedStrand?.id;
      else if (modalType === 'lo') payload.sub_strand_id = selectedSubStrand?.id;

      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, payload);
        toast.success("Updated successfully");
      } else {
        await api.post(endpoint, payload);
        toast.success("Created successfully");
      }

      if (viewLevel === 'strands') fetchStrands();
      else if (viewLevel === 'sub-strands') fetchSubStrands(selectedStrand!.id);
      else fetchLearningOutcomes(selectedSubStrand!.id);

      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Are you sure? This will delete all child items as well.")) return;
    
    try {
      let endpoint = '';
      if (viewLevel === 'strands') endpoint = '/cbc/strands';
      else if (viewLevel === 'sub-strands') endpoint = '/cbc/sub-strands';
      else endpoint = '/cbc/learning-outcomes';

      await api.delete(`${endpoint}/${itemId}`);
      toast.success("Deleted successfully");
      
      if (viewLevel === 'strands') fetchStrands();
      else if (viewLevel === 'sub-strands') fetchSubStrands(selectedStrand!.id);
      else fetchLearningOutcomes(selectedSubStrand!.id);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="subject-content" style={{ padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate("/subjects")} className="btn-icon" style={{ background: 'var(--bg-card)' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ margin: 0 }}>{subject?.name || 'Subject'} Content</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span style={{ cursor: 'pointer', color: viewLevel === 'strands' ? 'var(--primary)' : 'inherit' }} onClick={() => handleBreadcrumbClick('strands')}>Strands</span>
              {selectedStrand && (
                <>
                  <ChevronRight size={14} />
                  <span style={{ cursor: 'pointer', color: viewLevel === 'sub-strands' ? 'var(--primary)' : 'inherit' }} onClick={() => handleBreadcrumbClick('sub-strands')}>{selectedStrand.name}</span>
                </>
              )}
              {selectedSubStrand && (
                <>
                  <ChevronRight size={14} />
                  <span style={{ color: 'var(--primary)' }}>{selectedSubStrand.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0 }}>
            {viewLevel === 'strands' && "Strands"}
            {viewLevel === 'sub-strands' && "Sub-strands"}
            {viewLevel === 'learning-outcomes' && "Learning Outcomes"}
          </h3>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal(viewLevel === 'strands' ? 'strand' : viewLevel === 'sub-strands' ? 'sub-strand' : 'lo')}>
          <Plus size={20} />
          Add {viewLevel === 'strands' ? 'Strand' : viewLevel === 'sub-strands' ? 'Sub-strand' : 'Outcome'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {viewLevel === 'strands' && strands.map(strand => (
            <div key={strand.id} className="card" style={{ padding: '20px', cursor: 'pointer', position: 'relative' }} onClick={() => handleStrandClick(strand)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', marginBottom: '16px' }}>
                  <LayoutGrid size={24} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-icon" style={{ padding: '4px' }} onClick={(e) => { e.stopPropagation(); handleOpenModal('strand', strand); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon" style={{ padding: '4px', color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); handleDelete(strand.id); }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 style={{ margin: '0 0 8px 0' }}>{strand.name}</h4>
              <div style={{ marginTop: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                View Sub-strands <ChevronRight size={14} style={{ marginLeft: '4px' }} />
              </div>
            </div>
          ))}

          {viewLevel === 'sub-strands' && subStrands.map(sub => (
            <div key={sub.id} className="card" style={{ padding: '20px', cursor: 'pointer', position: 'relative' }} onClick={() => handleSubStrandClick(sub)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', marginBottom: '16px' }}>
                  <ListTree size={24} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-icon" style={{ padding: '4px' }} onClick={(e) => { e.stopPropagation(); handleOpenModal('sub-strand', sub); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon" style={{ padding: '4px', color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 style={{ margin: '0 0 8px 0' }}>{sub.name}</h4>
              <div style={{ marginTop: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                View Learning Outcomes <ChevronRight size={14} style={{ marginLeft: '4px' }} />
              </div>
            </div>
          ))}

          {viewLevel === 'learning-outcomes' && learningOutcomes.map(lo => (
            <div key={lo.id} className="card" style={{ padding: '20px', borderLeft: '4px solid #22c55e' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', flexShrink: 0 }}>
                  <Target size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>{lo.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-icon" style={{ padding: '4px' }} onClick={() => handleOpenModal('lo', lo)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon" style={{ padding: '4px', color: 'var(--danger)' }} onClick={() => handleDelete(lo.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {((viewLevel === 'strands' && strands.length === 0) || 
            (viewLevel === 'sub-strands' && subStrands.length === 0) || 
            (viewLevel === 'learning-outcomes' && learningOutcomes.length === 0)) && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
              <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ color: 'var(--text-muted)' }}>No items found here.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>
                {editingItem ? 'Edit ' : 'Add New '}
                {modalType === 'strand' ? 'Strand' : modalType === 'sub-strand' ? 'Sub-strand' : 'Learning Outcome'}
              </h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {modalType !== 'lo' ? (
                  <div className="form-group">
                    <label>Name*</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={modalType === 'strand' ? "e.g. Numbers" : "e.g. Fractions"}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Outcome Description*</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="e.g. By the end of this sub-strand, the learner should be able to..."
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '120px' }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectContent;
