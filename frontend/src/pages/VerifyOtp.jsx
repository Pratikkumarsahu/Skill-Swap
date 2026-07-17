// OTP verification screen component
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Key, ArrowRight, RefreshCw, ArrowLeft } from 'lucide-react';

const VerifyOtp = ({ email, onNavigate, theme, onToggleTheme }) => {
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (otp.length !== 6 || isNaN(otp)) {
      setError('Please enter a valid 6-digit code.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      setSuccess('Email verified successfully! Logging you in...');
      
      // Complete login trigger in AuthContext
      setTimeout(() => {
        verifyOtp(data);
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle code resend
  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code.');
      }

      setSuccess('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative transition-all duration-300">
      
      {/* Back button top left */}
      <div className="absolute top-5 left-5">
        <button
          onClick={() => onNavigate('login')}
          className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all btn-interactive"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl interactive-card">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-3">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Enter OTP</h2>
          <p className="text-sm text-slate-400 mt-1.5 text-center">
            Verification code sent to:<br />
            <span className="text-indigo-400 font-semibold text-xs">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only numbers allowed
              placeholder="000000"
              className="w-full tracking-[8px] text-center py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-2xl placeholder-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <span className="block text-[10px] text-slate-500 mt-2 text-center">
              (For testing, check your server console log or Render deployment logs)
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-interactive"
          >
            {loading ? 'Verifying...' : 'Verify & Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400 flex flex-col gap-2">
          <span>Didn't receive the code?</span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none flex items-center gap-1.5 justify-center mx-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending code...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
