import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import '../../pages/styles/LibraryManagement.css'; // Reuse styles or add specifically

interface LibraryItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  categories: any[];
  item?: any;
  onSuccess: () => void;
}

const LibraryItemForm: React.FC<LibraryItemFormProps> = ({ isOpen, onClose, type, categories, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category_id: '',
    file_url: '',
    cover_image_url: '',
    type: type,
    access_level: 'All',
    is_free: true,
    price: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        author: item.author || '',
        description: item.description || '',
        category_id: item.category_id || '',
        file_url: item.file_url || '',
        cover_image_url: item.cover_image_url || '',
        type: item.type || type,
        access_level: item.access_level || 'All',
        is_free: item.is_free !== undefined ? item.is_free : true,
        price: item.price || 0
      });
    } else {
      setFormData(prev => ({ ...prev, type }));
    }
  }, [item, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type: fieldType } = e.target;
    const val = fieldType === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await api.put(`/library/items/${item.id}`, formData);
        toast.success(`${type} updated successfully`);
      } else {
        await api.post('/library/items', formData);
        toast.success(`${type} created successfully`);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving library item:', error);
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{item ? 'Edit' : 'Add New'} {type}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-group">
            <label>Title *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              placeholder="Enter title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Author / Publisher</label>
              <input 
                type="text" 
                name="author" 
                value={formData.author} 
                onChange={handleChange} 
                placeholder="Author name"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select 
                name="category_id" 
                value={formData.category_id} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={3}
              placeholder="Short description..."
            />
          </div>

          <div className="form-group">
            <label>File URL *</label>
            <div className="input-with-icon">
              <input 
                type="text" 
                name="file_url" 
                value={formData.file_url} 
                onChange={handleChange} 
                required 
                placeholder="https://example.com/file.pdf"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Cover Image URL (Optional)</label>
            <input 
              type="text" 
              name="cover_image_url" 
              value={formData.cover_image_url} 
              onChange={handleChange} 
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Access Level</label>
              <select name="access_level" value={formData.access_level} onChange={handleChange}>
                <option value="All">All Users</option>
                <option value="Student">Students Only</option>
                <option value="Teacher">Teachers Only</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price (Set 0 for free)</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryItemForm;
