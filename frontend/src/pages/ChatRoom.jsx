import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChatRoom, sendMessage as sendMsg, pollMessages } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';
import { io } from 'socket.io-client';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const lastMsgId = useRef(null);
  const typingTimer = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Load initial data
  useEffect(() => {
    setLoading(true);
    getChatRoom(id)
      .then(r => {
        setData(r.data);
        setMessages(r.data.messages || []);
        setAllRooms(r.data.allRooms || []);
        if (r.data.messages?.length) lastMsgId.current = r.data.messages[r.data.messages.length - 1]._id;
        setTimeout(scrollToBottom, 100);
      })
      .catch(() => navigate('/chat'))
      .finally(() => setLoading(false));
  }, [id]);

  // Socket.io
  useEffect(() => {
    if (!token) return;
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('join-room', id));

    socket.on('new-message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id?.toString() === msg.id?.toString())) return prev;
        lastMsgId.current = msg.id;
        return [...prev, {
          _id: msg.id,
          text: msg.text,
          mine: msg.senderId?.toString() === user?._id?.toString(),
          initial: msg.initial,
          time: msg.time,
          isRead: msg.isRead,
        }];
      });
      setTimeout(scrollToBottom, 50);
    });

    socket.on('user-typing', ({ username }) => {
      setTypingUser(username);
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 2500);
    });

    return () => { socket.disconnect(); clearTimeout(typingTimer.current); };
  }, [id, token]);

  // Polling fallback (for when socket is not connected)
  useEffect(() => {
    const poll = () => {
      pollMessages(id, lastMsgId.current).then(r => {
        if (r.data.messages?.length > 0) {
          setMessages(prev => {
            const ids = new Set(prev.map(m => m._id?.toString()));
            const newMsgs = r.data.messages.filter(m => !ids.has(m.id?.toString())).map(m => ({
              _id: m.id, text: m.text, mine: m.mine, initial: m.initial, time: m.time, isRead: m.isRead,
            }));
            if (newMsgs.length) {
              lastMsgId.current = r.data.messages[r.data.messages.length - 1].id;
              setTimeout(scrollToBottom, 50);
              return [...prev, ...newMsgs];
            }
            return prev;
          });
        }
      }).catch(() => {});
    };
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send-message', { roomId: id, text: msgText });
      } else {
        await sendMsg(id, { text: msgText });
      }
    } catch { Toast.error('Failed to send message.'); } finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (socketRef.current?.connected) socketRef.current.emit('typing', { roomId: id });
  };

  const filteredRooms = allRooms.filter(r =>
    r.otherUser?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.otherUser?.username?.toLowerCase().includes(search.toLowerCase())
  );

  const timeStr = (ts) => ts ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <MainLayout showSidebar={false}>
      <div className="kc-chat-layout" style={{ height: 'calc(100vh - 130px)', minHeight: '500px' }}>
        {/* Contacts sidebar */}
        <div className="kc-chat-sidebar" id="chatSidebar">
          <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input type="text" className="form-control" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto flex-grow-1">
            {filteredRooms.map(room => {
              const u = room.otherUser;
              const initial = (u?.fullName?.[0] || '?').toUpperCase();
              return (
                <div key={room._id} className={`d-flex align-items-center gap-3 p-3 notif-item ${room._id === id ? 'unread' : ''}`}
                  style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)', background: room._id === id ? 'var(--p)10' : undefined }}
                  onClick={() => navigate(`/chat/${room._id}`)}>
                  <div className="kc-avatar kc-avatar-sm flex-shrink-0">
                    {u?.profilePhoto ? <img src={`http://localhost:5000${u.profilePhoto}`} alt="" /> : initial}
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-700" style={{ fontSize: '.88rem' }}>{u?.fullName || u?.username}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: '.74rem' }}>{room.lastMessage?.text || 'Start chatting'}</div>
                  </div>
                  {room.unreadCount > 0 && <span className="badge rounded-pill" style={{ background: 'var(--p)', fontSize: '.68rem' }}>{room.unreadCount}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat main */}
        <div className="kc-chat-main d-flex flex-column" id="chatMain">
          {/* Header */}
          {data?.otherUser && (
            <div className="kc-chat-header d-flex align-items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm d-lg-none me-1" onClick={() => navigate('/chat')}><i className="bi bi-arrow-left"></i></button>
              <div className="kc-avatar kc-avatar-sm">
                {data.otherUser.profilePhoto ? <img src={`http://localhost:5000${data.otherUser.profilePhoto}`} alt="" /> : (data.otherUser.firstName?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <div className="fw-700 small">{data.otherUser.firstName ? `${data.otherUser.firstName} ${data.otherUser.lastName || ''}`.trim() : data.otherUser.username}</div>
                <div className="text-muted" style={{ fontSize: '.72rem', textTransform: 'capitalize' }}>{data.otherUser.role} · {data.otherUser.city || 'N/A'}</div>
              </div>
              <div className="ms-auto d-flex gap-2">
                <Link to={`/${data.otherUser.role === 'worker' ? 'workers' : 'workers'}/${data.otherUser._id}`} className="btn btn-ghost btn-sm"><i className="bi bi-person"></i></Link>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="kc-chat-messages flex-grow-1 p-3 overflow-y-auto">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="kc-empty h-100">
                <i className="bi bi-chat-dots kc-empty-icon"></i>
                <div className="kc-empty-title">No messages yet</div>
                <div className="kc-empty-sub">Say hello! 👋</div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={msg._id || i} className={`kc-msg ${msg.mine ? 'mine' : 'theirs'} mb-2`}>
                    {!msg.mine && (
                      <div className="kc-msg-avatar">{msg.initial}</div>
                    )}
                    <div>
                      <div className="kc-msg-bubble">{msg.text}</div>
                      <div className="kc-msg-time">
                        {timeStr(msg.time)}
                        {msg.mine && <i className={`bi bi-check2${msg.isRead ? '-all' : ''} ms-1 ${msg.isRead ? 'text-info' : ''}`}></i>}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="kc-msg theirs mb-2">
                    <div className="kc-msg-avatar">…</div>
                    <div className="kc-msg-bubble kc-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-3" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <form onSubmit={handleSend} className="d-flex gap-2">
              <input
                id="messageInput"
                type="text"
                className="form-control"
                placeholder="Type a message…"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <button id="sendMsgBtn" type="submit" className="btn btn-primary btn-pill px-3" disabled={!text.trim() || sending}>
                {sending ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-send-fill"></i>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatRoom;
