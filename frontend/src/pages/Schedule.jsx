// Scheduling management page for swap invites and completions
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/ReviewModal';
import { Calendar, Clock, Star, MessageSquare } from 'lucide-react';

const Schedule = ({ onNavigate, setSelectChatUserId }) => {
  const { user, token, API_URL } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState('');

  // Review modal state
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewedSessionIds, setReviewedSessionIds] = useState([]);

  // Fetch swap sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews submitted by the user to prevent double review submissions
  const fetchReviewedSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const sessionIds = data.map((review) => review.session);
      setReviewedSessionIds(sessionIds);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchReviewedSessions();
  }, [token, API_URL]);

  // Handle accepting, declining, or completing sessions
  const handleUpdateStatus = async (sessionId, newStatus) => {
    setError('');
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update session');
      }

      fetchSessions(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  // Open the review popup modal
  const openReviewFlow = (session) => {
    setSelectedSessionForReview(session);
    setIsReviewOpen(true);
  };

  const handleReviewSuccess = (review) => {
    setReviewedSessionIds((prev) => [...prev, review.session]);
    fetchSessions();
  };

  const handleStartChat = (partnerId) => {
    setSelectChatUserId(partnerId);
    onNavigate('chat');
  };

  // Filter based on active tab ('upcoming' vs 'history')
  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'upcoming') {
      return s.status === 'accepted' || s.status === 'pending';
    } else {
      return s.status === 'completed' || s.status === 'rejected';
    }
  });

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          My Swap Sessions
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Manage your swap calendar and accept/decline invites.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-sm max-w-2xl">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Active & Pending ({sessions.filter((s) => s.status === 'accepted' || s.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          History ({sessions.filter((s) => s.status === 'completed' || s.status === 'rejected').length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto mt-6">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-white mb-1">No sessions listed</h3>
        </div>
      ) : (
        /* Sessions Cards list */
        <div className="space-y-4 max-w-4xl">
          {filteredSessions.map((session) => {
            const isSender = session.sender._id === user._id;
            const partner = isSender ? session.receiver : session.sender;
            const dateObj = new Date(session.sessionDate);

            return (
              <div
                key={session._id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={partner.avatar || 'https://via.placeholder.com/150'}
                    alt={partner.name}
                    className="w-11 h-11 rounded-xl border border-slate-800 object-cover mt-0.5"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white text-sm leading-snug">{partner.name}</h4>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          session.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                            : session.status === 'accepted'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                            : session.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                            : 'bg-red-500/10 text-red-400 border border-red-500/15'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs font-semibold">
                      {isSender ? (
                        <span>
                          You teach <span className="text-indigo-400">{session.offeredSkill}</span> ⟷ Learn{' '}
                          <span className="text-emerald-400">{session.receivedSkill}</span>
                        </span>
                      ) : (
                        <span>
                          Learn <span className="text-emerald-400">{session.receivedSkill}</span> ⟷ You teach{' '}
                          <span className="text-indigo-400">{session.offeredSkill}</span>
                        </span>
                      )}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>
                          {dateObj.toLocaleDateString()} at{' '}
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                          ({session.duration} min)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control Actions buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleStartChat(partner._id)}
                    className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  {session.status === 'pending' && (
                    <>
                      {isSender ? (
                        <span className="text-xs text-slate-500 italic px-2">Awaiting response</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(session._id, 'rejected')}
                            className="px-3.5 py-1.5 border border-slate-800 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-lg"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(session._id, 'accepted')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-lg"
                          >
                            Accept
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {session.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(session._id, 'completed')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Mark Completed
                    </button>
                  )}

                  {session.status === 'completed' && (
                    <>
                      {reviewedSessionIds.includes(session._id) ? (
                        <span className="text-xs text-emerald-400 font-semibold italic">
                          ✓ Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => openReviewFlow(session)}
                          className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-650/20 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-lg"
                        >
                          Review Partner
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal popup */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        session={selectedSessionForReview}
        onReviewSubmitted={handleReviewSuccess}
      />
    </div>
  );
};

export default Schedule;
