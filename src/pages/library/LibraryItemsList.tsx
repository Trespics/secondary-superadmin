import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Plus, 
  ExternalLink,
  BookOpen,
  PlayCircle,
  Music,
  FileText
} from 'lucide-react';
import type { LibraryItemType } from './LibraryManagement';
import LibraryItemForm from '../../components/library/LibraryItemForm';
import api from '../../lib/api';
import { toast } from 'sonner';

interface LibraryItemsListProps {
  items: any[];
  type: LibraryItemType;
  categories: any[];
  onRefresh: () => void;
}

const LibraryItemsList: React.FC<LibraryItemsListProps> = ({ items, type, categories, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/library/items/${id}`);
      toast.success('Item deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const getIcon = (itemType: LibraryItemType) => {
    switch (itemType) {
      case 'Book': return <BookOpen size={18} />;
      case 'Video': return <PlayCircle size={18} />;
      case 'Audio': return <Music size={18} />;
      case 'Paper': return <FileText size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="library-items-list">
      <div className="content-header">
        <h2>{type}s List</h2>
        <button className="add-button" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
          <Plus size={18} />
          Add New {type}
        </button>
      </div>

      <div className="items-table-container">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>No {type.toLowerCase()}s found. Click "Add New" to get started.</p>
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`item-badge badge-${item.type.toLowerCase()}`}>
                        {getIcon(item.type)}
                      </span>
                      {item.title}
                    </div>
                  </td>
                  <td>{item.author || '-'}</td>
                  <td>{categories.find(c => c.id === item.category_id)?.name || 'Uncategorized'}</td>
                  <td>
                    <span className="access-level-badge">{item.access_level || 'All'}</span>
                  </td>
                  <td className="actions-cell">
                    <button className="icon-button view-btn" title="View File">
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={18} />
                      </a>
                    </button>
                    <button className="icon-button edit-btn" onClick={() => handleEdit(item)} title="Edit">
                      <Edit size={18} />
                    </button>
                    <button className="icon-button delete-btn" onClick={() => handleDelete(item.id, item.title)} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <LibraryItemForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          type={type} 
          categories={categories}
          item={editingItem}
          onSuccess={() => {
            setIsFormOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default LibraryItemsList;
