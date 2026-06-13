import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationToast from '../components/NotificationToast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [toast, setToast] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Basic Form Validation
  const validateForm = () => {
    if (!email) {
      setToast({ type: 'error', message: 'Please provide email address.' });
      return false;
    }
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      setToast({ type: 'error', message: 'Please enter a valid email format.' });
      return false;
    }
    if (!isForgot && !password) {
      setToast({ type: 'error', message: 'Please provide password.' });
      return false;
    }
    if (!isForgot && password.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters.' });
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setBtnLoading(true);

    const result = await login(email, password);
    setBtnLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setToast({ type: 'error', message: result.message });
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setBtnLoading(true);

    try {
      const response = await api.post('/auth/forgotpassword', { email });
      setBtnLoading(false);
      if (response.data.success) {
        setToast({ type: 'success', message: response.data.message });
        setIsForgot(false);
      }
    } catch (error) {
      setBtnLoading(false);
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error executing request. Try again.' 
      });
    }
  };

  return (
    <div className="min-screen w-full flex items-center justify-center py-12 px-6 relative bg-cosmic-bg">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Identity */}
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-white animate-float" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
              Humara Pandit
            </h2>
            <p className="text-sm text-indigo-400 font-semibold uppercase tracking-widest mt-1">Astrologer Portal Login</p>
          </div>
        </div>

        {/* Card Panel */}
        <div className="glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl">
          {isForgot ? (
            // Forgot Password Screen
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-200">Reset Password</h3>
                <p className="text-xs text-gray-400 mt-1">Enter your registered email and we will simulate password recovery details.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full form-input-cosmic pl-12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={btnLoading}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                {btnLoading ? 'Sending...' : 'Send Recovery Email'}
              </button>

              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer text-center"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            // Login Form
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-200">Sign In</h3>
                <p className="text-xs text-gray-400 mt-1">Access dashboard to log charts and schedule consultations.</p>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full form-input-cosmic pl-12"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full form-input-cosmic pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={btnLoading}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                {btnLoading ? 'Verifying Session...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
        
        {/* Sample Credentials Card helper for testing */}
        <div className="mt-6 glass-panel border border-white/5 rounded-2xl p-4 text-[11px] text-gray-400 flex flex-col gap-1.5">
          <span className="font-bold text-gray-300 uppercase tracking-widest text-[9px] mb-1">Development Demo Access:</span>
          <div>• <strong className="text-indigo-400">Admin Account:</strong> admin@astrocrm.com / admin123</div>
          <div>• <strong className="text-indigo-400">Astrologer 1:</strong> pandit.sharma@astrocrm.com / pandit123</div>
          <div>• <strong className="text-indigo-400">Astrologer 2:</strong> ananya.sen@astrocrm.com / ananya123</div>
        </div>
      </div>

      {toast && (
        <NotificationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;
