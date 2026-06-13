import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Sparkles, User, CalendarDays, Clock, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationToast from '../components/NotificationToast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  // Registration States
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [pob, setPob] = useState('');
  const [gender, setGender] = useState('male');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  const [toast, setToast] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const { login, register } = useAuth();
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

    if (isRegister) {
      if (!name) {
        setToast({ type: 'error', message: 'Please provide full name.' });
        return false;
      }
      if (!dob) {
        setToast({ type: 'error', message: 'Please provide date of birth.' });
        return false;
      }
      if (!tob) {
        setToast({ type: 'error', message: 'Please provide time of birth.' });
        return false;
      }
      if (!pob) {
        setToast({ type: 'error', message: 'Please provide place of birth.' });
        return false;
      }
      if (!mobile) {
        setToast({ type: 'error', message: 'Please provide mobile number.' });
        return false;
      }
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setBtnLoading(true);

    const result = await register({
      name,
      email,
      password,
      role: 'customer',
      dateOfBirth: dob,
      timeOfBirth: tob,
      placeOfBirth: pob,
      gender,
      mobileNumber: mobile,
      address
    });
    setBtnLoading(false);

    if (result.success) {
      setToast({ type: 'success', message: 'Registration successful! Synchronizing portal session...' });
      setTimeout(() => {
        navigate('/');
      }, 1000);
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
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-6 relative bg-cosmic-bg overflow-y-auto">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl animate-glow-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl animate-glow-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-lg relative z-10 my-auto">
        {/* Logo/Identity */}
        <div className="flex flex-col items-center gap-4 text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-white animate-float" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
              Humara Pandit
            </h2>
            <p className="text-sm text-indigo-400 font-semibold uppercase tracking-widest mt-1">Astrological Guidance Portal</p>
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
                    className="w-full form-input-cosmic pl-12 text-xs"
                    required
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
          ) : isRegister ? (
            // Customer Registration Form
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-bold text-gray-200">Customer Registration</h3>
                <p className="text-xs text-gray-400 mt-1">Create an account to browse astrologers and log birth charts.</p>
              </div>

              {/* Grid block for basic details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Abhinandan Sen"
                      className="w-full form-input-cosmic pl-12 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9999999999"
                      className="w-full form-input-cosmic pl-12 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@example.com"
                      className="w-full form-input-cosmic pl-12 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full form-input-cosmic pl-12 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/5 my-1" />

              {/* Birth parameters */}
              <div>
                <h4 className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2">Required Natal Chart Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Date of Birth</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full form-input-cosmic pl-12 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Time of Birth</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="time"
                        value={tob}
                        onChange={(e) => setTob(e.target.value)}
                        className="w-full form-input-cosmic pl-12 text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Place of Birth</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={pob}
                      onChange={(e) => setPob(e.target.value)}
                      placeholder="Delhi, India"
                      className="w-full form-input-cosmic pl-12 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full form-input-cosmic text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Non-Binary</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Current Address (Optional)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, City, State"
                  className="w-full form-input-cosmic text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={btnLoading}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 mt-2"
              >
                {btnLoading ? 'Creating Portal Account...' : 'Register as Customer'}
              </button>

              <div className="text-center mt-2 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          ) : (
            // Login Form
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-200">Sign In</h3>
                <p className="text-xs text-gray-400 mt-1">Access dashboard to view alignments or manage schedules.</p>
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
                    className="w-full form-input-cosmic pl-12 text-xs"
                    required
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
                    className="w-full form-input-cosmic pl-12 pr-12 text-xs"
                    required
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

              <div className="text-center mt-2 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  New customer? Create an Account
                </button>
              </div>
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
