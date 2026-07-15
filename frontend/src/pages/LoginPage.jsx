import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Mail, Lock, User, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hospitalService } from '../services/hospital';

export default function LoginPage() {
  const { login, register, error, setError, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: true for registration, false for login
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PHC_STAFF'); // Default role
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Handle URL parameters for redirecting to register or expired sessions
  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }

    if (searchParams.get('expired') === 'true') {
      setError("Your session has expired. Please log in again.");
    } else {
      setError(null);
    }
  }, [searchParams, setError]);

  // Load hospitals dynamically when in registration mode
  useEffect(() => {
    if (isRegister) {
      hospitalService.getAllHospitals({ limit: 100 })
        .then((res) => {
          if (res.success && res.data) {
            const list = res.data.items || [];
            setHospitals(list);
            if (list.length > 0) {
              setSelectedHospital(list[0].id);
            }
          }
        })
        .catch((err) => {
          console.error("Error loading hospitals dropdown", err);
        });
    }
  }, [isRegister]);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    if (isRegister && !name) {
      setError("Please provide your name.");
      return;
    }

    if (isRegister && role === 'PHC_STAFF' && !selectedHospital) {
      setError("Please select an assigned facility.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Register user with optional hospitalId
        const hospitalId = role === 'PHC_STAFF' ? selectedHospital : null;
        await register(name, email, password, role, hospitalId);
        setSuccessMsg("Registration successful! You can now log in.");
        setIsRegister(false); // Switch to login form
        // Pre-fill registered email
        setPassword('');
      } else {
        // Login user
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is set in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center gradient-mesh px-4 py-8 relative overflow-hidden">
      {/* Decorative backlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Landing Page
      </Link>

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-xl shadow-teal-500/20 mb-3 border border-white/20">
            <Activity className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">SmartHealth Nexus Gateway</h2>
          <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-extrabold">
            District Command Authorization
          </p>
        </div>

        {/* Auth Box */}
        <div className="glass-card card-glow-teal rounded-3xl p-8 border-slate-200/80 shadow-2xl relative overflow-hidden bg-white/75">
          {/* Top line decoration */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600"></div>

          <h3 className="text-lg font-bold text-slate-800 mb-6">
            {isRegister ? "Create Command Credentials" : "Sign In to Command Center"}
          </h3>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Feedback Alerts */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Name Input - Only for Register */}
            {isRegister && (
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Rajesh Kumar"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 text-sm transition"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Authorized Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@district-health.gov"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 text-sm transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Secret Key (Password)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 text-sm transition"
                  required
                />
              </div>
            </div>

            {/* Role Selector Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">System Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 text-sm transition"
              >
                <option value="DISTRICT_ADMIN">District Admin (District Overseer)</option>
                <option value="PHC_STAFF">PHC/CHC Staff (Facility Operator)</option>
                <option value="GOV_HEALTH_OFFICER">Government Health Officer (Audit/Insights)</option>
              </select>
            </div>

            {/* Hospital Selection dropdown - Only visible for PHC_STAFF registration */}
            {isRegister && role === 'PHC_STAFF' && (
              <div className="space-y-1.5 text-left animate-fade-in-up">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Assigned Facility (PHC/CHC)</label>
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 text-sm transition"
                  required
                >
                  {hospitals.length === 0 ? (
                    <option value="" disabled>No active facilities registered...</option>
                  ) : (
                    hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.hospital_name} ({h.hospital_type} - {h.district})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold text-sm hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-600/10 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                isRegister ? "Register Credentials" : "Authorize Session"
              )}
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {isRegister ? (
              <p>
                Already have credentials?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-teal-600 hover:text-teal-700 transition"
                >
                  Log In
                </button>
              </p>
            ) : (
              <p>
                Need to register your facility?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-teal-600 hover:text-teal-700 transition"
                >
                  Request Credentials
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
