// Admin Dashboard for managing users, warnings, reports, and auditing chats
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Flag,
  MessageSquare,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  Star,
  CheckCircle,
  Eye,
} from 'lucide-react';

const AdminPanel = () => {
  const { token, API_URL } = useAuth();

  // Tab navigation states
  const [activeTab, setActiveTab] = useState('users');

  // Lists state
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Loaders
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Warning modal controls
  const [warningTargetUser, setWarningTargetUser] = useState(null);
  const [warningReason, setWarningReason] = useState('');
  const [warningSending, setWarningSending] = useState(false);

  // Chat auditing logs viewer controls
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // General error/success banner state
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('success'); // 'success' or 'error'

  const showBanner = (msg, type = 'success') => {
    setBannerMessage(msg);
    setBannerType(type);
    setTimeout(() => setBannerMessage(''), 3000);
  };

  // Fetch all users list
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch all user reports
  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch conversation auditing list
  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/chats/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setConversations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchReports();
      fetchConversations();
    }
  }, [token, API_URL]);

  // Handle Account Deletion
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This will erase all their chats, sessions, and reviews.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      showBanner(data.message || 'User deleted successfully.');
      fetchUsers(); // Refresh listings
      fetchReports();
      fetchConversations();
    } catch (err) {
      showBanner(err.message, 'error');
    }
  };

  // Submit Warning Message
  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningReason.trim() || !warningTargetUser) return;
    setWarningSending(true);

    try {
      const response = await fetch(`${API_URL}/admin/users/${warningTargetUser._id}/warning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: warningReason.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to warn user');
      }

      showBanner(`Warning sent successfully to ${warningTargetUser.name}.`);
      setWarningTargetUser(null);
      setWarningReason('');
      fetchUsers(); // Refresh listings to see warning count update
    } catch (err) {
      showBanner(err.message, 'error');
    } finally {
      setWarningSending(false);
    }
  };

  // Dismiss user report
  const handleDismissReport = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to dismiss report');
      }

      showBanner('Report dismissed successfully.');
      fetchReports();
    } catch (err) {
      showBanner(err.message, 'error');
    }
  };

  // Audited message log retriever
  const handleAuditConversation = async (conv) => {
    setActiveConversation(conv);
    setLoadingMessages(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/chats/messages/${conv.user1._id}/${conv.user2._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setChatMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-slate-300">
      {/* Header Panel */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-indigo-500" />
          Admin Management Panel
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Perform administrative moderation, warn users, inspect chat logs, and review reports.
        </p>
      </div>

      {bannerMessage && (
        <div
          className={`mb-6 p-4 rounded-xl border text-xs font-semibold ${
            bannerType === 'error'
              ? 'bg-red-950/20 border-red-900/30 text-red-400'
              : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
          }`}
        >
          {bannerMessage}
        </div>
      )}

      {/* Tabs list controls */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => {
            setActiveTab('users');
            setActiveConversation(null);
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          User Accounts ({users.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('reports');
            setActiveConversation(null);
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Flag className="w-4 h-4" />
          Report Logs ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${
            activeTab === 'chats'
              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Audit Chats ({conversations.length})
        </button>
      </div>

      {/* Directory Tab */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loadingUsers ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/40">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Average Rating</th>
                    <th className="p-4 text-center">Warnings</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-850/40">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://via.placeholder.com/150'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-750"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {u.name}
                            {u.isAdmin && (
                              <span className="bg-indigo-600 text-white text-[8px] px-1 py-0.2 rounded uppercase font-bold">Admin</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4 text-center font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {u.averageRating > 0 ? u.averageRating : '0'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`font-extrabold px-2 py-0.5 rounded ${
                            u.warnings.length > 0
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'text-slate-500'
                          }`}
                        >
                          {u.warnings.length}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {!u.isAdmin && (
                          <>
                            <button
                              onClick={() => setWarningTargetUser(u)}
                              className="px-2.5 py-1 border border-amber-500/20 hover:bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-semibold transition-colors"
                            >
                              Warn User
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-lg inline-flex items-center transition-colors align-middle"
                              title="Delete account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {loadingReports ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-indigo-500"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-50" />
              <h3 className="text-white font-bold mb-1">Clear Ledger</h3>
              <p className="text-xs text-slate-500">No member reports filed at this time.</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep._id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      Reporter: {rep.reporter?.name || 'Deleted User'}
                    </span>
                    <span>⟶</span>
                    <span className="font-bold text-red-400 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded">
                      Reported: {rep.reportedUser?.name || 'Deleted User'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({new Date(rep.createdAt).toLocaleString()})
                    </span>
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed italic">
                    Reason: "{rep.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleDismissReport(rep._id)}
                    className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-lg"
                  >
                    Dismiss
                  </button>
                  {rep.reportedUser && (
                    <>
                      <button
                        onClick={() => setWarningTargetUser(rep.reportedUser)}
                        className="px-3 py-1.5 border border-amber-500/20 hover:bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-lg"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleDeleteUser(rep.reportedUser._id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                      >
                        Delete User
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Chats Auditing Tab */}
      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Conversation list (Left panel) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Message Channels</h3>
            {loadingConversations ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active chat channels found.</p>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {conversations.map((conv) => {
                  const isSelected =
                    activeConversation &&
                    ((activeConversation.user1._id === conv.user1._id &&
                      activeConversation.user2._id === conv.user2._id) ||
                      (activeConversation.user1._id === conv.user2._id &&
                        activeConversation.user2._id === conv.user1._id));

                  return (
                    <button
                      key={conv.lastMessage._id}
                      onClick={() => handleAuditConversation(conv)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                          : 'bg-slate-950/40 border-transparent hover:bg-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {conv.user1.name} ⟷ {conv.user2.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Last: "{conv.lastMessage.content}"
                        </p>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-slate-500 ml-2" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active audited chat log viewer (Right panel) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[300px]">
            {activeConversation ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">
                    Auditing Logs: {activeConversation.user1.name} & {activeConversation.user2.name}
                  </h3>
                  <span className="text-[10px] bg-red-950/20 border border-red-900/30 text-red-400 font-semibold px-2 py-0.5 rounded">
                    Audit Mode
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {loadingMessages ? (
                    <div className="py-20 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-10">No messages in this chat room log.</p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg._id} className="flex gap-2.5 items-start text-xs max-w-[85%]">
                        <img
                          src={msg.sender.avatar || 'https://via.placeholder.com/150'}
                          alt={msg.sender.name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-800"
                        />
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-white text-[10px]">
                              {msg.sender.name}
                            </span>
                            <span className="text-[8px] text-slate-500">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col justify-center items-center text-center space-y-2 opacity-50">
                <AlertTriangle className="w-8 h-8 text-slate-650" />
                <h4 className="text-white text-xs font-bold">Select a message channel</h4>
                <p className="text-[11px] text-slate-500">Select a conversation to read the message log history.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning popup Dialog Modal */}
      {warningTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setWarningTargetUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Issue Indisciplinary Warning
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Send a warning message directly to <span className="text-indigo-400 font-semibold">{warningTargetUser.name}</span>.
            </p>

            <form onSubmit={handleSendWarning} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Reason / Warning Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="Specify violation (e.g. offensive language, fake rating exchange...)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setWarningTargetUser(null)}
                  className="px-4 py-2 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={warningSending}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
                >
                  {warningSending ? 'Sending...' : 'Send Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
