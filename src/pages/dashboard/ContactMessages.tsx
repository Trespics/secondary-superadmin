import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { 
  Search, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  User, 
  Info,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied';
  reply_message: string | null;
  replied_at: string | null;
  created_at: string;
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/superadmin/contact-messages');
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenReply = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplyText(msg.reply_message || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
    setReplyText('');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/superadmin/contact-messages/${selectedMessage.id}/reply`, {
        reply_message: replyText
      });
      toast.success('Reply sent successfully');
      fetchMessages();
      handleCloseModal();
    } catch (error: any) {
      console.error('Reply error:', error);
      toast.error(error.response?.data?.error || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="contact-messages-page">
      <div className="page-header">
        <div className="page-title">
          <h2>Contact Messages</h2>
          <p>View and respond to inquiries from users</p>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '24px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 size={40} className="animate-spin" color="#6366f1" />
            <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading messages...</p>
          </div>
        ) : (
          <div className="card-table">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Sender</th>
                  <th style={{ padding: '16px' }}>Subject</th>
                  <th style={{ padding: '16px' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr key={msg.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px' }}>
                      {msg.status === 'replied' ? (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          background: '#ecfdf5', 
                          color: '#059669' 
                        }}>
                          <CheckCircle2 size={14} /> Replied
                        </span>
                      ) : (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 600, 
                          background: '#fff7ed', 
                          color: '#d97706' 
                        }}>
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{msg.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{msg.email}</div>
                    </td>
                    <td style={{ padding: '16px', maxWidth: '300px' }}>
                      <div style={{ fontWeight: 500 }}>{msg.subject}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {msg.message}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                        onClick={() => handleOpenReply(msg)}
                      >
                        {msg.status === 'replied' ? 'View/Edit' : 'Reply'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMessages.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                      No messages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedMessage && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{selectedMessage.status === 'replied' ? 'Review Message' : 'Reply to Message'}</h3>
              <button 
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{selectedMessage.name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{selectedMessage.email}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>Subject: {selectedMessage.subject}</div>
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>{selectedMessage.message}</div>
              </div>

              <form onSubmit={handleSendReply}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Your Reply
                  </label>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    style={{ 
                      width: '100%', minHeight: '150px', padding: '12px', 
                      borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none',
                      fontFamily: 'inherit', resize: 'vertical'
                    }}
                    required
                    readOnly={selectedMessage.status === 'replied' && !replyText}
                  />
                </div>
                {selectedMessage.status === 'replied' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    <Info size={16} />
                    This message was replied to on {new Date(selectedMessage.replied_at!).toLocaleDateString()}.
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : (
                      selectedMessage.status === 'replied' ? 'Update Reply' : 'Send Reply'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
