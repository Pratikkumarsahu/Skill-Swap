// Product Landing / Introduction page for new users
import React from 'react';
import {
  Sparkles,
  Users,
  MessageSquare,
  Calendar,
  Star,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';

const Landing = ({ onNavigate, theme, onToggleTheme }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-300 relative overflow-hidden transition-all duration-300">
      
      {/* Top Banner Header with Theme Switch */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-wide">SkillSwap</span>
        </div>
        
        {/* Sun / Moon Theme toggle button */}
        <button
          onClick={onToggleTheme}
          title="Toggle Day/Night mode"
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all btn-interactive"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Hero Copwriting Section */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 z-10">
        
        {/* Left Side: Copywriting */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> 100% Free Peer Tutoring Network
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Swap skills with other <span className="text-indigo-500">students</span>.
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Trade what you know for what you need to learn. Connect with peers at your university, trade tutoring slots, and grow your portfolio without spending a single dollar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 btn-interactive"
            >
              Sign In to Account
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 btn-interactive"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Right Side: Features Highlight Cards list */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {/* Card 1: Matchmaking */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 interactive-card">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Tag Matchmaking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find classmates who teach exactly what you want to learn using double coincidence of wants matching.
            </p>
          </div>

          {/* Card 2: Chatting */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 interactive-card">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Real-Time Messaging</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Communicate instantly with peers in clean chat channels with live typing indicators.
            </p>
          </div>

          {/* Card 3: Scheduling */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 interactive-card">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Swap Calendar</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Propose session timings, log exchange durations, and manage pending invites.
            </p>
          </div>

          {/* Card 4: Reviewing */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 interactive-card">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Student Grading</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Grade exchange partners out of 5 stars and submit reviews to update user trust ratings.
            </p>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 border-t border-slate-900 text-xs text-slate-650 z-10 bg-slate-950/40">
        &copy; {new Date().getFullYear()} SkillSwap Network. Developed for student portfolios.
      </footer>
    </div>
  );
};

export default Landing;
