import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, Plus, Trash2, BookOpen, FileText, Video, Music, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import '../../pages/styles/LibraryItemForm.css'; 

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
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  

  const [formData, setFormData] = useState<any>({
    title: '',
    author: '',
    description: '',
    category_id: '',
    file_url: '',
    cover_image_url: '',
    type: type,
    access_level: 'All',
    is_free: true,
    price: 0,
    book_metadata: {
      isbn: '',
      publication_year: new Date().getFullYear(),
      edition: '',
      language: 'English',
      book_type: 'oer',
      access_type: 'full_hosted',
      source_url: '',
      download_url: '',
      section_url: '',
      publisher: '',
      license: ''
    },
    author_ids: [],
    sections: [],
    citations: []
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
        price: item.price || 0,
        book_metadata: item.library_books?.[0] || {
          isbn: '',
          publication_year: new Date().getFullYear(),
          edition: '',
          language: 'English',
          book_type: 'oer',
          access_type: 'full_hosted',
          source_url: '',
          download_url: '',
          section_url: '',
          publisher: item.library_books?.[0]?.library_publishers?.name || '',
          license: item.library_books?.[0]?.library_licenses?.name || ''
        },
        author_ids: item.library_book_authors?.map((ba: any) => ba.author_id) || [],
        sections: item.library_book_sections || [],
        citations: item.library_book_citations || []
      });
    } else {
      setFormData((prev: any) => ({ ...prev, type }));
    }
  }, [item, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type: fieldType } = e.target;
    const val = fieldType === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (name.startsWith('book_metadata.')) {
      const field = name.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        book_metadata: { ...prev.book_metadata, [field]: val }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: val }));
    }
  };

  const handleSectionChange = (index: number, field: string, value: string) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, sections: newSections }));
  };

  const addSection = () => {
    setFormData((prev: any) => ({
      ...prev,
      sections: [...prev.sections, { section_title: '', section_url: '', content_body: '', attribution_text: '', order_index: prev.sections.length }]
    }));
  };

  const removeSection = (index: number) => {
    const newSections = formData.sections.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, sections: newSections }));
  };

  const handleCitationChange = (index: number, field: string, value: string) => {
    const newCitations = [...formData.citations];
    newCitations[index] = { ...newCitations[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, citations: newCitations }));
  };

  const addCitation = () => {
    setFormData((prev: any) => ({
      ...prev,
      citations: [...prev.citations, { format: 'APA', citation_text: '' }]
    }));
  };

  const removeCitation = (index: number) => {
    const newCitations = formData.citations.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, citations: newCitations }));
  };


  const getFileAcceptType = (itemType: string) => {
    switch (itemType) {
      case 'Book': return '.pdf';
      case 'Video': return 'video/*';
      case 'Audio': return 'audio/*';
      case 'Paper': return '.pdf,.doc,.docx';
      case 'image': return 'image/*';
      default: return '*/*';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'Book': return <BookOpen size={24} />;
      case 'Video': return <Video size={24} />;
      case 'Audio': return <Music size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'file_url' | 'cover_image_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const { data } = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((prev: any) => ({ ...prev, [field]: data.url }));
      toast.success(`${field === 'file_url' ? 'File' : 'Cover image'} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.type === 'Book') {
      if (formData.book_metadata.book_type === 'licensed' && !formData.book_metadata.license) {
        toast.error('A license must be specified for licensed content');
        return;
      }
      if (formData.book_metadata.book_type === 'oer' && !formData.book_metadata.license) {
        toast.error('OER content requires a license and attribution rules');
        return;
      }
    }

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
      onClose();
    } catch (error: any) {
      console.error('Error saving library item:', error);
      toast.error(error.response?.data?.error || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content wide-modal">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon">
              {getTypeIcon()}
            </div>
            <div>
              <h2 className="modal-title">{item ? 'Edit' : 'Add New'} {type}</h2>
              <p className="modal-subtitle">Fill in the details to {item ? 'update' : 'create'} this {type.toLowerCase()}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-scrollable">
            {/* Basic Information Section */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">📝</div>
                <h3 className="section-title">Basic Information</h3>
              </div>
              
              <div className="form-group">
                <label className="form-label required">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter the title of the content"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Category</label>
                  <select 
                    name="category_id" 
                    value={formData.category_id} 
                    onChange={handleChange} 
                    required
                    className="form-select"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Access Level</label>
                  <select 
                    name="access_level" 
                    value={formData.access_level} 
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="All">All Users</option>
                    <option value="Student">Students Only</option>
                    <option value="Teacher">Teachers Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Write a brief description of the content..."
                  className="form-textarea"
                />
              </div>
            </div>

            {/* Book Metadata Section */}
            {formData.type === 'Book' && (
              <>
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">📚</div>
                    <h3 className="section-title">Book Metadata & Compliance</h3>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">ISBN</label>
                      <input 
                        type="text" 
                        name="book_metadata.isbn" 
                        value={formData.book_metadata.isbn} 
                        onChange={handleChange} 
                        placeholder="ISBN-13 (e.g., 978-3-16-148410-0)"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Publication Year</label>
                      <input 
                        type="number" 
                        name="book_metadata.publication_year" 
                        value={formData.book_metadata.publication_year} 
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label required">Book Type</label>
                      <select 
                        name="book_metadata.book_type" 
                        value={formData.book_metadata.book_type} 
                        onChange={handleChange} 
                        required
                        className="form-select"
                      >
                        <option value="public_domain">Public Domain</option>
                        <option value="oer">OER (Open Educational Resource)</option>
                        <option value="licensed">Licensed Content</option>
                        <option value="external_reference">External Reference (Copyrighted)</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label required">Access Type</label>
                      <select 
                        name="book_metadata.access_type" 
                        value={formData.book_metadata.access_type} 
                        onChange={handleChange} 
                        required
                        className="form-select"
                      >
                        <option value="full_hosted">Full Hosted (Content on Server)</option>
                        <option value="link_only">Link Only (External Reading)</option>
                        <option value="restricted">Restricted (License Limited)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Publisher</label>
                      <input 
                        type="text" 
                        name="book_metadata.publisher" 
                        value={formData.book_metadata.publisher} 
                        onChange={handleChange}
                        placeholder="Enter publisher name"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label required">License</label>
                      <input 
                        type="text" 
                        name="book_metadata.license" 
                        value={formData.book_metadata.license} 
                        onChange={handleChange}
                        placeholder="e.g., CC BY-SA 4.0, MIT, etc."
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Author(s)</label>
                    <input 
                      type="text" 
                      name="author" 
                      value={formData.author} 
                      onChange={handleChange}
                      placeholder="Enter author name(s)"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Files Section */}
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">📁</div>
                    <h3 className="section-title">Files & Media</h3>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label required">
                      Content {formData.book_metadata.access_type === 'link_only' ? 'URL' : 'File'}
                    </label>
                    <div className="input-with-upload">
                      <input 
                        type="text" 
                        name="file_url" 
                        value={formData.file_url} 
                        onChange={handleChange} 
                        required 
                        placeholder={formData.book_metadata.access_type === 'full_hosted' ? "Upload a file or enter URL" : "Enter external URL"}
                        className="form-input"
                      />
                      {formData.book_metadata.access_type === 'full_hosted' && (
                        <>
                          <button 
                            type="button" 
                            className="upload-btn"
                            onClick={() => document.getElementById('lib-file')?.click()}
                            disabled={uploadingField === 'file_url'}
                          >
                            {uploadingField === 'file_url' ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Upload size={18} />
                            )}
                            <span>Upload</span>
                          </button>
                          <input 
                            id="lib-file" 
                            type="file" 
                            hidden 
                            onChange={(e) => handleFileChange(e, 'file_url')} 
                            accept={getFileAcceptType(type)} 
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cover Image</label>
                    <div className="input-with-upload">
                      <input 
                        type="text" 
                        name="cover_image_url" 
                        value={formData.cover_image_url} 
                        onChange={handleChange} 
                        placeholder="Enter image URL or upload"
                        className="form-input"
                      />
                      <button 
                        type="button" 
                        className="upload-btn"
                        onClick={() => document.getElementById('lib-cover')?.click()}
                        disabled={uploadingField === 'cover_image_url'}
                      >
                        {uploadingField === 'cover_image_url' ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Upload size={18} />
                        )}
                        <span>Upload</span>
                      </button>
                      <input 
                        id="lib-cover" 
                        type="file" 
                        hidden 
                        onChange={(e) => handleFileChange(e, 'cover_image_url')} 
                        accept="image/*" 
                      />
                    </div>
                    {formData.cover_image_url && (
                      <div className="image-preview">
                        <img src={formData.cover_image_url} alt="Cover preview" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sections Section */}
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">📑</div>
                    <h3 className="section-title">Sections (OER / Page Level)</h3>
                    <button type="button" onClick={addSection} className="add-btn">
                      <Plus size={16} />
                      <span>Add Section</span>
                    </button>
                  </div>
                  
                  {formData.sections.length === 0 && (
                    <div className="empty-sections">
                      <p>No sections added yet. Click "Add Section" to organize your content.</p>
                    </div>
                  )}
                  
                  {formData.sections.map((sec: any, idx: number) => (
                    <div key={idx} className="section-item">
                      <div className="section-item-header">
                        <span className="section-number">Section {idx + 1}</span>
                        <button type="button" onClick={() => removeSection(idx)} className="remove-btn">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="section-item-content">
                        <input 
                          className="form-input"
                          value={sec.section_title} 
                          onChange={(e) => handleSectionChange(idx, 'section_title', e.target.value)} 
                          placeholder="Section Title"
                        />
                        <input 
                          className="form-input mt-2"
                          value={sec.section_url} 
                          onChange={(e) => handleSectionChange(idx, 'section_url', e.target.value)} 
                          placeholder="Section URL (for attribution)"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Citations Section */}
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">📖</div>
                    <h3 className="section-title">Citations</h3>
                    <button type="button" onClick={addCitation} className="add-btn">
                      <Plus size={16} />
                      <span>Add Citation</span>
                    </button>
                  </div>
                  
                  {formData.citations.length === 0 && (
                    <div className="empty-sections">
                      <p>No citations added yet. Add citations for proper attribution.</p>
                    </div>
                  )}
                  
                  {formData.citations.map((cit: any, idx: number) => (
                    <div key={idx} className="citation-item">
                      <div className="citation-item-header">
                        <select 
                          value={cit.format} 
                          onChange={(e) => handleCitationChange(idx, 'format', e.target.value)}
                          className="citation-format-select"
                        >
                          <option value="APA">APA</option>
                          <option value="MLA">MLA</option>
                          <option value="Custom">Custom</option>
                        </select>
                        <button type="button" onClick={() => removeCitation(idx)} className="remove-btn">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea 
                        value={cit.citation_text} 
                        onChange={(e) => handleCitationChange(idx, 'citation_text', e.target.value)} 
                        placeholder="Enter full citation text..."
                        rows={2}
                        className="form-textarea mt-2"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Non-book type files section */}
            {formData.type !== 'Book' && (
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">📁</div>
                  <h3 className="section-title">Files & Media</h3>
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Content File / URL</label>
                  <div className="input-with-upload">
                    <input 
                      type="text" 
                      name="file_url" 
                      value={formData.file_url} 
                      onChange={handleChange} 
                      required 
                      placeholder="Enter URL or upload file"
                      className="form-input"
                    />
                    <button 
                      type="button" 
                      className="upload-btn"
                      onClick={() => document.getElementById('lib-file')?.click()}
                      disabled={uploadingField === 'file_url'}
                    >
                      {uploadingField === 'file_url' ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Upload size={18} />
                      )}
                      <span>Upload</span>
                    </button>
                    <input 
                      id="lib-file" 
                      type="file" 
                      hidden 
                      onChange={(e) => handleFileChange(e, 'file_url')} 
                      accept={getFileAcceptType(type)} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <div className="input-with-upload">
                    <input 
                      type="text" 
                      name="cover_image_url" 
                      value={formData.cover_image_url} 
                      onChange={handleChange} 
                      placeholder="Enter image URL or upload"
                      className="form-input"
                    />
                    <button 
                      type="button" 
                      className="upload-btn"
                      onClick={() => document.getElementById('lib-cover')?.click()}
                      disabled={uploadingField === 'cover_image_url'}
                    >
                      {uploadingField === 'cover_image_url' ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Upload size={18} />
                      )}
                      <span>Upload</span>
                    </button>
                    <input 
                      id="lib-cover" 
                      type="file" 
                      hidden 
                      onChange={(e) => handleFileChange(e, 'cover_image_url')} 
                      accept="image/*" 
                    />
                  </div>
                  {formData.cover_image_url && (
                    <div className="image-preview">
                      <img src={formData.cover_image_url} alt="Cover preview" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>{item ? 'Update Item' : 'Create Item'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryItemForm;