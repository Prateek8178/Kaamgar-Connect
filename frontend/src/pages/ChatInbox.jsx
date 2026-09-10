import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatInbox } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const ChatInbox = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getChatInbox().then(r => setRooms(r.data.rooms)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = rooms.filter(r =>
    r.otherUser?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.otherUser?.username?.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(ts).toLocaleDateString('en-IN');
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-chat-dots-fill me-2" style={{ color: 'var(--p)' }}></i>Messages</h1>
        <p className="text-muted small">{rooms.length} conversation{rooms.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="kc-card" style={{ maxWidth: '700px' }}>
        {/* Search */}
        <div className="input-group mb-4">
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input type="text" className="form-control" placeholder="Search conversations…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="d-flex flex-column gap-3">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '70px', borderRadius: '12px' }}></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="kc-empty py-4">
            <i className="bi bi-chat kc-empty-icon"></i>
            <div className="kc-empty-title">{search ? 'No results found' : 'No messages yet'}</div>
            {!search && <div className="kc-empty-sub">Start a conversation from a worker or job profile</div>}
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {filtered.map(room => {
              const u = room.otherUser;
              const initial = (u?.fullName?.[0] || u?.username?.[0] || '?').toUpperCase();
              return (
                <div key={room._id} className={`d-flex align-items-center gap-3 p-3 rounded-3 notif-item ${room.unreadCount > 0 ? 'unread' : ''}`}
                  style={{ cursor: 'pointer', transition: 'background .15s' }}
                  onClick={() => navigate(`/chat/${room._id}`)}>
                  <div className="kc-avatar kc-avatar-md flex-shrink-0">
                    {u?.profilePhoto ? <img src={`http://localhost:5000${u.profilePhoto}`} alt="" /> : initial}
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between">
                      <div className="fw-700 small">{u?.fullName || u?.username}</div>
                      <div className="text-muted" style={{ fontSize: '.72rem', flexShrink: 0 }}>{timeAgo(room.lastMessage?.createdAt)}</div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <div className="text-muted text-truncate small">{room.lastMessage?.text || 'No messages yet'}</div>
                      {room.unreadCount > 0 && <span className="badge rounded-pill ms-2" style={{ background: 'var(--p)', fontSize: '.7rem' }}>{room.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ChatInbox;
