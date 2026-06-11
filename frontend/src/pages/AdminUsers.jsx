import React, { useEffect, useState } from 'react';
import { getAdminUsers, toggleAdminUser } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    getAdminUsers({ search, role: roleFilter })
      .then(r => setUsers(r.data.users)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleToggle = async (id, name) => {
    try { await toggleAdminUser(id); Toast.success(`${name} status updated.`); fetchUsers(); } catch { Toast.error('Failed.'); }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-people-fill me-2" style={{ color: 'var(--p)' }}></i>Manage Users</h1>
        <p className="text-muted small">{users.length} users</p>
      </div>

      {/* Filters */}
      <div className="kc-card mb-4">
        <div className="row g-3">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input type="text" className="form-control" placeholder="Search name, email, username…" value={search}
                onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="worker">Workers</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary btn-pill w-100" onClick={fetchUsers}><i className="bi bi-search me-1"></i>Search</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '10px' }}></div>)}</div>
      ) : users.length === 0 ? (
        <div className="kc-empty"><div className="kc-empty-title">No users found</div></div>
      ) : (
        <div className="kc-card p-0">
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>City</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const name = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username;
                  const initial = (u.firstName?.[0] || u.username?.[0] || 'U').toUpperCase();
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="kc-avatar kc-avatar-sm">{u.profilePhoto ? <img src={`http://localhost:5000${u.profilePhoto}`} alt="" /> : initial}</div>
                          <div>
                            <div className="fw-700 small">{name}</div>
                            <div className="text-muted" style={{ fontSize: '.72rem' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="kc-badge badge-primary" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                      <td className="small text-muted">{u.city || '—'}</td>
                      <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td><span className={`kc-badge ${u.isActive ? 'badge-success' : 'badge-gray'}`}>{u.isActive ? 'Active' : 'Blocked'}</span></td>
                      <td>
                        <button className={`btn btn-${u.isActive ? 'danger' : 'success'} btn-sm btn-pill`}
                          onClick={() => handleToggle(u._id, name)} style={{ fontSize: '.75rem' }}>
                          {u.isActive ? <><i className="bi bi-slash-circle me-1"></i>Block</> : <><i className="bi bi-check-circle me-1"></i>Activate</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AdminUsers;
