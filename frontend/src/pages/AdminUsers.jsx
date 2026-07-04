import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, AlertTriangle, X, Trash2, Ban, CheckCircle, Shield
} from 'lucide-react';

const AdminUsers = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load registered users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await api.patch(`/users/${userId}/block`);
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? res.data.data : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to block user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await api.patch(`/users/${userId}/unblock`);
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? res.data.data : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unblock user.');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteModal = (targetUser) => {
    setUserToDelete(targetUser);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setActionLoading(userToDelete._id);
    try {
      const res = await api.delete(`/users/${userToDelete._id}`);
      if (res.data.success) {
        setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
        closeDeleteModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const canManage = (targetUser) => {
    if (targetUser._id === user?._id) return false;
    if (targetUser.role === 'admin') return false;
    return true;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Manage Users</h1>
            <p className="text-slate-400 text-sm mt-1">Admin Dashboard for viewing and managing registered users.</p>
          </div>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-10 w-full text-sm max-w-md"
            placeholder="Search by name, email, or role..."
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center space-x-1.5">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-semibold">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border-slate-800">
            <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No users found</h3>
            <p className="text-slate-500 text-sm">No registered users match your search.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Registered</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-medium text-slate-200">{u.name}</td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border ${
                          u.role === 'admin'
                            ? 'text-brand-400 border-brand-500/20 bg-brand-500/5'
                            : 'text-slate-400 border-slate-600/20 bg-slate-600/5'
                        }`}>
                          {u.role === 'admin' && <Shield className="h-3 w-3" />}
                          <span>{u.role.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isBlocked ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border text-red-400 border-red-500/20 bg-red-500/5">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="p-4 text-right">
                        {canManage(u) ? (
                          <div className="flex justify-end items-center space-x-2">
                            {u.isBlocked ? (
                              <button
                                onClick={() => handleUnblock(u._id)}
                                disabled={actionLoading === u._id}
                                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                                title="Unblock user"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Unblock</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlock(u._id)}
                                disabled={actionLoading === u._id}
                                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                                title="Block user"
                              >
                                <Ban className="h-4 w-4" />
                                <span>Block</span>
                              </button>
                            )}
                            <button
                              onClick={() => openDeleteModal(u)}
                              disabled={actionLoading === u._id}
                              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Delete user"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-900/40 border-t border-slate-800 text-xs text-slate-500 font-medium">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        )}

        {deleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
              <div className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-slate-800">
                <h3 className="font-bold text-white text-lg">Confirm Delete</h3>
                <button
                  onClick={closeDeleteModal}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-red-500/10">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">
                      Are you sure you want to remove this user?
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      <strong className="text-slate-300">{userToDelete.name}</strong> ({userToDelete.email}) will be permanently deleted along with their test attempts.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="px-4 py-2 border border-slate-850 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={actionLoading === userToDelete._id}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-all disabled:opacity-50"
                  >
                    {actionLoading === userToDelete._id ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminUsers;
