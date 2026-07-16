// Explore page for searching matching skill swap partners
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Sparkles, Star, MessageSquare, Calendar, X, Clock, Flag } from 'lucide-react';

const Explore = ({ onNavigate, setSelectChatUserId }) => {
  const { user, token, API_URL } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerfect, setFilterPerfect] = useState(false);

  // Booking/Proposal Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState('');
  const [receivedSkill, setReceivedSkill] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTargetUser, setReportTargetUser] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  // Fetch match explore list on load
  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/users/match/explore`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMatches(data || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [token, API_URL]);

  // Open Chat Room
  const handleStartChat = (partnerId) => {
    setSelectChatUserId(partnerId);
    onNavigate('chat');
  };

  // Open proposal modal and set initial values
  const openBookingModal = (partnerMatch) => {
    setSelectedPartner(partnerMatch.user);
    setOfferedSkill(user.skillsOffered[0] || '');
    setReceivedSkill(partnerMatch.givesToCurrent[0] || partnerMatch.user.skillsOffered[0] || '');
    setSessionDate('');
    setSessionTime('');
    setDuration(60);
    setBookingSuccess(false);
    setBookingError('');
    setIsBookingOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
    setSelectedPartner(null);
  };

  const openReportModal = (partner) => {
    setReportTargetUser(partner);
    setReportReason('');
    setReportSuccess(false);
    setReportError('');
    setIsReportOpen(true);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
    setReportTargetUser(null);
  };

  // Submit user report to backend API
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportLoading(true);

    if (!reportReason.trim()) {
      setReportError('Please write a reason for the report.');
      setReportLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportedUserId: reportTargetUser._id,
          reason: reportReason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      setReportSuccess(true);
      setTimeout(() => {
        closeReportModal();
      }, 1500);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  // Submit swap session proposal
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);

    if (!sessionDate || !sessionTime) {
      setBookingError('Please enter date and time.');
      setBookingLoading(false);
      return;
    }

    try {
      const combinedDate = new Date(`${sessionDate}T${sessionTime}`);
      
      const response = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: selectedPartner._id,
          offeredSkill,
          receivedSkill,
          sessionDate: combinedDate.toISOString(),
          duration: Number(duration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit proposal');
      }

      setBookingSuccess(true);
      setTimeout(() => {
        closeBookingModal();
      }, 1500);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Filter local matches list based on search queries
  const filteredMatches = matches.filter((match) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesName = match.user.name.toLowerCase().includes(searchLower);
    const matchesBio = match.user.bio.toLowerCase().includes(searchLower);
    const matchesSkillsOffered = match.user.skillsOffered.some((s) =>
      s.toLowerCase().includes(searchLower)
    );
    const matchesSkillsNeeded = match.user.skillsNeeded.some((s) =>
      s.toLowerCase().includes(searchLower)
    );

    const matchesSearch =
      matchesName || matchesBio || matchesSkillsOffered || matchesSkillsNeeded;

    if (filterPerfect) {
      return matchesSearch && match.matchType === 'perfect';
    }
    return matchesSearch;
  });

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Explore Peer Matches
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Browse other students and find skill trades.
          </p>
        </div>

        {/* Search input field and filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, names..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setFilterPerfect(!filterPerfect)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              filterPerfect
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Double Match Only
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto mt-8">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-2">No Matching Peers Found</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Try expanding your search query or updating your profile tags.
          </p>
        </div>
      ) : (
        /* Matching cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match.user._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* User avatar and name info */}
                <div className="flex items-start gap-4">
                  <img
                    src={match.user.avatar || 'https://via.placeholder.com/150'}
                    alt={match.user.name}
                    className="w-14 h-14 rounded-2xl border border-slate-800 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-white text-base leading-snug truncate">
                      {match.user.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-300 font-semibold">
                        {match.user.averageRating > 0 ? match.user.averageRating : 'New'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({match.user.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                  {/* Report Peer Flag button */}
                  <button
                    onClick={() => openReportModal(match.user)}
                    title="Report user"
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {match.user.bio || 'No bio.'}
                </p>

                {/* Match Strength bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold">MATCH TYPE</span>
                    <span
                      className={`font-bold uppercase ${
                        match.matchType === 'perfect' ? 'text-emerald-400' : 'text-indigo-400'
                      }`}
                    >
                      {match.matchType === 'perfect' ? 'Double Swap' : 'Partial Swap'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className={`h-full rounded-full ${
                        match.matchType === 'perfect' ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${match.score}%` }}
                    />
                  </div>
                </div>

                {/* Overlapping skills list */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  {match.givesToCurrent.length > 0 && (
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-500 font-semibold">THEY TEACH ⟶ YOU LEARN</span>
                      <div className="flex flex-wrap gap-1">
                        {match.givesToCurrent.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.receivesFromCurrent.length > 0 && (
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-500 font-semibold">YOU TEACH ⟶ THEY LEARN</span>
                      <div className="flex flex-wrap gap-1">
                        {match.receivesFromCurrent.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleStartChat(match.user._id)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Message
                </button>
                <button
                  onClick={() => openBookingModal(match)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  <Calendar className="w-4 h-4 text-indigo-200" />
                  Propose Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking proposal modal popup */}
      {isBookingOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={closeBookingModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h3 className="text-lg font-bold text-white">Proposal Sent!</h3>
                <p className="text-sm text-slate-400">
                  Proposal has been sent to {selectedPartner.name}.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white mb-1">Propose Swap Session</h3>
                <p className="text-sm text-slate-400 mb-5">
                  Schedule an exchange session with <span className="text-indigo-400 font-semibold">{selectedPartner.name}</span>.
                </p>

                {bookingError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
                    {bookingError}
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                        You Teach (Offer)
                      </label>
                      <select
                        value={offeredSkill}
                        onChange={(e) => setOfferedSkill(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      >
                        {user.skillsOffered.map((skill) => (
                          <option key={skill} value={skill} className="bg-slate-900">
                            {skill}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                        They Teach (Learn)
                      </label>
                      <select
                        value={receivedSkill}
                        onChange={(e) => setReceivedSkill(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      >
                        {selectedPartner.skillsOffered.map((skill) => (
                          <option key={skill} value={skill} className="bg-slate-900">
                            {skill}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        required
                        value={sessionTime}
                        onChange={(e) => setSessionTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                      Duration
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Clock className="w-4 h-4" />
                      </span>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      type="button"
                      onClick={closeBookingModal}
                      className="px-4 py-2 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-xl"
                    >
                      {bookingLoading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Report User Modal popup */}
      {isReportOpen && reportTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={closeReportModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {reportSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h3 className="text-lg font-bold text-white">Report Submitted</h3>
                <p className="text-sm text-slate-400">
                  Your report against {reportTargetUser.name} has been sent to the Admin.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white mb-1">Report User Account</h3>
                <p className="text-sm text-slate-400 mb-5">
                  Explain the reason for reporting <span className="text-red-400 font-semibold">{reportTargetUser.name}</span>.
                </p>

                {reportError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
                    {reportError}
                  </div>
                )}

                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                      Reason for Report
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Specify the reason (e.g. inappropriate behavior, fake skills...)"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      type="button"
                      onClick={closeReportModal}
                      className="px-4 py-2 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reportLoading}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl"
                    >
                      {reportLoading ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
