import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAllRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const NOTIF_ICONS = { application: 'file-earmark-text', status: 'arrow-repeat', message: 'chat-dots', review: 'star', job: 'briefcase' };
const NOTIF_COLORS = { application: 'blue', status: 'green', message: 'purple', review: 'amber', job: 'teal' };

const NotificationList = () => {
  const { fetchUnread } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then(r => { setNotifs(r.data.notifications); setUnread(r.data.unread); fetchUnread(); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifs(n => n.map(x => ({ ...x, isRead: true })));
      setUnread(0);
      fetchUnread();
      Toast.success('All notifications marked as read.');
    } catch { Toast.error('Failed.'); }
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <MainLayout>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-bell-fill me-2" style={{ color: 'var(--p)' }}></i>Notifications</h1>
          <p className="text-muted small">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll} className="btn btn-ghost btn-sm">
            <i className="bi bi-check2-all me-1"></i>Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '12px' }}></div>)}</div>
      ) : notifs.length === 0 ? (
        <div className="kc-empty">
          <i className="bi bi-bell-slash kc-empty-icon"></i>
          <div className="kc-empty-title">No notifications</div>
          <div className="kc-empty-sub">You're all caught up!</div>
        </div>
      ) : (
        <div className="kc-card p-0" style={{ overflow: 'hidden' }}>
          {notifs.map((n, i) => (
            <div key={n._id} className={`notif-item d-flex align-items-start gap-3 p-3 ${!n.isRead ? 'unread' : ''}`}
              style={{ borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className={`kc-stat-icon stat-${NOTIF_COLORS[n.ntype] || 'blue'}`}
                style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`bi bi-${NOTIF_ICONS[n.ntype] || 'bell'}`}></i>
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div className={`fw-${n.isRead ? '500' : '700'} small`}>{n.title}</div>
                  <div className="text-muted flex-shrink-0" style={{ fontSize: '.72rem' }}>{timeAgo(n.createdAt)}</div>
                </div>
                {n.body && <div className="text-muted small text-truncate">{n.body}</div>}
                {n.link && (
                  <Link to={n.link} className="btn btn-ghost btn-sm p-0 mt-1" style={{ fontSize: '.78rem' }}>
                    View <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                )}
              </div>
              {!n.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--p)', flexShrink: 0, marginTop: '6px' }}></div>}
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default NotificationList;
