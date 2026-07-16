// Student Dashboard Page showing profile stats, match search, and pending invites
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Calendar,
  Hourglass,
  Star,
  Users,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Search,
  X,
  ChevronRight,
} from 'lucide-react';

const Dashboard = ({ onNavigate, setSelectChatUserId }) => {
  const { user, token, API_URL } = useAuth();
  const [matches, setMatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Fetch all matches and sessions on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch potential matches
        const matchesRes = await fetch(`${API_URL}/users/match/explore`, { headers });
        const matchesData = await matchesRes.json();
        setMatches(matchesData || []);

        // 2. Fetch swap sessions history/schedule
        const sessionsRes = await fetch(`${API_URL}/sessions`, { headers });
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, API_URL]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  // Calculate quick stats from sessions
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const hoursSwapped = completedSessions.reduce((acc, curr) => acc + curr.duration, 0) / 60;
  const rating = user?.averageRating || 0;

  const upcomingSessions = sessions.filter(
    (s) => s.status === 'accepted' && new Date(s.sessionDate) > new Date()
  );
  const pendingRequests = sessions.filter(
    (s) => s.status === 'pending' && s.receiver._id === user._id
  );

  // Filter users matching search query for the Quick Skill Finder
  const searchResults = skillSearchQuery
    ? matches.filter((match) =>
        match.user.skillsOffered.some((s) =>
          s.toLowerCase().includes(skillSearchQuery.toLowerCase())
        )
      )
    : [];

  // Helper to open chat window
  const handleStartChat = (partnerId) => {
    setSelectChatUserId(partnerId);
    onNavigate('chat');
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
      {/* Warnings Banner Alert */}
      {user?.warnings && user.warnings.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs space-y-2">
          <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-red-450">
            <span>⚠️</span> Indisciplinary Warning(s) from Administrator
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-slate-350">
            {user.warnings.map((warn, idx) => (
              <li key={idx}>
                {warn.reason} <span className="text-[10px] text-slate-500">({new Date(warn.date).toLocaleDateString()})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-indigo-900/40 p-8 border border-indigo-500/20 mb-8">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Welcome back, Peer
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Grow your skills, {user?.name}!
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            You have <span className="text-white font-semibold">{pendingRequests.length} pending swap requests</span> waiting for your response. Explore matches to find perfect coincidences of wants!
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            Find Match Partners
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Skill Finder (Search Bar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Quick Skill Finder
        </h3>
        <p className="text-slate-400 text-xs mb-4">
          Type a skill you want to learn. Click on any provider below to chat and connect with them instantly!
        </p>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={skillSearchQuery}
            onChange={(e) => setSkillSearchQuery(e.target.value)}
            placeholder="What do you want to learn? (e.g. Python, Spanish, Figma...)"
            className="w-full pl-11 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {skillSearchQuery && (
            <button
              onClick={() => setSkillSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Results list */}
        {skillSearchQuery && (
          <div className="mt-4 border border-slate-800 rounded-xl bg-slate-950 overflow-hidden divide-y divide-slate-800 max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs">
                No users found who teach "{skillSearchQuery}".
              </div>
            ) : (
              searchResults.map((match) => (
                <div
                  key={match.user._id}
                  onClick={() => handleStartChat(match.user._id)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={match.user.avatar || 'https://via.placeholder.com/150'}
                      alt={match.user.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-850"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {match.user.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-slate-300">
                          {match.user.averageRating > 0 ? match.user.averageRating : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Teaches</span>
                      <div className="flex gap-1 mt-0.5">
                        {match.user.skillsOffered
                          .filter(s => s.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                          .map(s => (
                            <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {s}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Stat 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Hourglass className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Hours Swapped</span>
            <span className="text-2xl font-bold text-white mt-0.5">{hoursSwapped.toFixed(1)}h</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Star className="w-6 h-6 fill-amber-500/10" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Average Rating</span>
            <span className="text-2xl font-bold text-white mt-0.5">
              {rating > 0 ? `${rating} ★` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Perfect Matches</span>
            <span className="text-2xl font-bold text-white mt-0.5">
              {matches.filter((m) => m.matchType === 'perfect').length}
            </span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Completed Swaps</span>
            <span className="text-2xl font-bold text-white mt-0.5">{completedSessions.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Matches column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Recommended Swaps
            </h3>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              See All Matches ({matches.length})
            </button>
          </div>

          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <p className="text-slate-400 text-sm">No matches found yet.</p>
              </div>
            ) : (
              matches.slice(0, 3).map((match) => (
                <div
                  key={match.user._id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={match.user.avatar || 'https://via.placeholder.com/150'}
                      alt={match.user.name}
                      className="w-12 h-12 rounded-xl border border-slate-800 object-cover mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base leading-snug">
                          {match.user.name}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            match.matchType === 'perfect'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {match.matchType === 'perfect' ? 'Double Match' : 'Skill Match'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1.5 line-clamp-1">
                        {match.user.bio || 'No bio.'}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                        <div>
                          <span className="text-slate-500 font-medium">Offers:</span>{' '}
                          {match.user.skillsOffered.map((s) => (
                            <span
                              key={s}
                              className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium ml-1"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleStartChat(match.user._id)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNavigate('explore')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl"
                    >
                      Propose Swap
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sessions list column */}
        <div className="space-y-6">
          {/* Swap requests received */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Swap Invites
            </h3>
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                  <p className="text-slate-500 text-xs">No pending invites.</p>
                </div>
              ) : (
                pendingRequests.slice(0, 3).map((req) => (
                  <div
                    key={req._id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.sender.avatar || 'https://via.placeholder.com/150'}
                        alt={req.sender.name}
                        className="w-9 h-9 rounded-full border border-slate-800 object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs">{req.sender.name}</h4>
                        <span className="text-[10px] text-slate-500">
                          wants to learn {req.receivedSkill}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                      <div>Offers: <span className="text-indigo-400 font-semibold">{req.offeredSkill}</span></div>
                    </div>
                    <button
                      onClick={() => onNavigate('schedule')}
                      className="w-full text-center bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-semibold text-xs py-2 rounded-lg border border-indigo-500/10"
                    >
                      Manage Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Accepted Sessions */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
              Upcoming Swaps
            </h3>
            <div className="space-y-3">
              {upcomingSessions.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                  <p className="text-slate-500 text-xs">No upcoming swaps scheduled.</p>
                </div>
              ) : (
                upcomingSessions.slice(0, 3).map((session) => {
                  const partner = session.sender._id === user._id ? session.receiver : session.sender;
                  return (
                    <div
                      key={session._id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={partner.avatar || 'https://via.placeholder.com/150'}
                          alt={partner.name}
                          className="w-9 h-9 rounded-full border border-slate-800 object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-white text-xs leading-snug">{partner.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Swap {session.offeredSkill} ⟷ {session.receivedSkill}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-indigo-400 block">
                          {new Date(session.sessionDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
