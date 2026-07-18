// Register account screen component with password show/hide and theme toggle controls
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, BookOpen, Star, ArrowRight, Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react';

const Register = ({ onNavigate, theme, onToggleTheme }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Split comma separated skills input into arrays of trimmed strings
    const offeredArray = skillsOffered
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');
    const neededArray = skillsNeeded
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');

    if (offeredArray.length === 0) {
      setError('Please enter at least one skill you can teach.');
      setLoading(false);
      return;
    }
    if (neededArray.length === 0) {
      setError('Please enter at least one skill you want to learn.');
      setLoading(false);
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        skillsOffered: offeredArray,
        skillsNeeded: neededArray,
        bio,
      });
      // Verification is now bypassable/automatic; AuthContext will log the user in immediately.
    } catch (err) {
      setError(err.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative transition-all duration-300">
      
      {/* Top right floating theme and back options */}
      <div className="absolute top-5 right-5 flex items-center gap-2">
        <button
          onClick={() => onNavigate('landing')}
          className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all btn-interactive"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <button
          onClick={onToggleTheme}
          title="Toggle Day/Night mode"
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all btn-interactive"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl interactive-card">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create account</h2>
          <p className="text-sm text-slate-400 mt-1">Start trading skills with other students</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alice Vance"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@university.edu"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password (Min 6 characters)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-12 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Skills Offered (Teach)
              </label>
              <span className="block text-[10px] text-slate-500 mb-1">Comma-separated (e.g. Python, CSS)</span>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Star className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={skillsOffered}
                  onChange={(e) => setSkillsOffered(e.target.value)}
                  placeholder="Python, React"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Skills Needed (Learn)
              </label>
              <span className="block text-[10px] text-slate-500 mb-1">Comma-separated (e.g. Spanish, UI/UX)</span>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <BookOpen className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={skillsNeeded}
                  onChange={(e) => setSkillsNeeded(e.target.value)}
                  placeholder="UI/UX, Spanish"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Brief Biography / Description
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what you would like to trade tutoring for..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-interactive"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
