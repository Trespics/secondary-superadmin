import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Video, 
  Music, 
  FileText, 
  Search, 
  Loader2
} from 'lucide-react';
import api from '../../lib/api';
import '../styles/LibraryManagement.css';
import LibraryItemsList from './LibraryItemsList';
import { toast } from 'sonner';

export type LibraryItemType = 'Book' | 'Video' | 'Audio' | 'Paper';

const LibraryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryItemType>('Book');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');   

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/library/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/library/items?type=${activeTab}`);
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load library items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="library-management-container">
      <div className="library-header">
        <div className="header-title">
          <h1>Digital Library Management</h1>
          <p>Create, update, and manage your institution's digital resources</p>
        </div>
      </div>

      <div className="library-layout">
        <aside className="library-sidebar">
          <nav className="sidebar-nav">
            <div 
              className={`sidebar-item ${activeTab === 'Book' ? 'active' : ''}`}
              onClick={() => setActiveTab('Book')}
            >
              <Book size={20} />
              <span>Books</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'Video' ? 'active' : ''}`}
              onClick={() => setActiveTab('Video')}
            >
              <Video size={20} />
              <span>Videos</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'Audio' ? 'active' : ''}`}
              onClick={() => setActiveTab('Audio')}
            >
              <Music size={20} />
              <span>Audio</span>
            </div>
            <div 
              className={`sidebar-item ${activeTab === 'Paper' ? 'active' : ''}`}
              onClick={() => setActiveTab('Paper')}
            >
              <FileText size={20} />
              <span>Past Papers</span>
            </div>
          </nav>
        </aside>

        <main className="library-content">
          <div className="content-header">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}s...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-wrapper">
              <Loader2 className="animate-spin" size={40} color="#3b82f6" />
            </div>
          ) : (
            <LibraryItemsList 
              items={filteredItems} 
              type={activeTab} 
              categories={categories}
              onRefresh={fetchItems}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default LibraryManagement;
