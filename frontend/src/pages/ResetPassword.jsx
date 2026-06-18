import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../assets/shnoor-logo.jpeg";

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/verify-reset-token/${token}`);
        if (res.data.valid) {
          setValidToken(true);
        } else {
          setError("This reset link is invalid or has expired.");
        }
      } catch (err) {
        setError("This reset link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reset-password-with-token`, { token, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-500 font-bold">
        Verifying reset link...
      </div>
    );
  }

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-white overflow-hidden font-sans">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex h-screen sticky top-0 bg-blue-950 text-white flex-col justify-between p-16 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#eab308 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white p-1.5 rounded-xl shadow-sm">
            <img src={logo} alt="SHNOOR" className="h-12 w-auto" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">SHNOOR LMS</h1>
            <p className="text-yellow-400 font-bold mt-1 text-sm tracking-wide uppercase">Professional LMS Platform</p>
          </div>
        </div>
        <div className="max-w-xl relative z-10">
          <h2 className="text-6xl font-black leading-tight">Reset Your <span className="text-yellow-400">Security Credentials.</span></h2>
          <p className="mt-8 text-xl text-blue-100 leading-relaxed font-medium">Security is our priority. Please set a strong new password to regain access to your Shnoor AI dashboard.</p>
        </div>
        <div className="text-blue-200 text-sm font-medium relative z-10">© 2026 SHNOOR International LLC</div>
      </div>

      {/* RIGHT PANEL (FORM) */}
      <div className="h-screen overflow-y-auto flex items-center justify-center px-8 lg:px-20 py-16 bg-slate-50 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
              <img src={logo} alt="SHNOOR" className="h-10 w-auto" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-blue-950">SHNOOR LMS</h1>
          </div>

          <Link to="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-950 transition-colors mb-8">
            ← Back to Login
          </Link>

          <h2 className="text-4xl lg:text-5xl font-black text-blue-950 leading-tight">Set New Password</h2>
          <p className="text-slate-600 mt-4 text-lg font-medium">Create a strong new password for your account.</p>

          {!validToken ? (
            <div className="mt-12 text-center">
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl font-medium">{error}</div>
              <Link to="/forgot-password" className="inline-block mt-6 text-blue-950 hover:text-blue-700 transition-colors font-black">
                Request New Link
              </Link>
            </div>
          ) : message ? (
            <div className="mt-12 bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center">
              <p className="font-bold text-lg mb-2">{message}</p>
              <p className="text-emerald-600 font-medium">Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 grid gap-6">
              {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl font-medium">{error}</div>}

              <div>
                <label className="font-bold text-sm text-blue-950 mb-2 block">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required
                  className="w-full border-2 border-slate-200 rounded-xl px-5 py-4 bg-white outline-none focus:border-blue-950 focus:ring-2 focus:ring-blue-900/10 transition-all font-medium text-blue-950" 
                />
              </div>

              <div>
                <label className="font-bold text-sm text-blue-950 mb-2 block">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Repeat new password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required
                  className="w-full border-2 border-slate-200 rounded-xl px-5 py-4 bg-white outline-none focus:border-blue-950 focus:ring-2 focus:ring-blue-900/10 transition-all font-medium text-blue-950" 
                />
              </div>
              
              <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 transition-colors text-blue-950 py-4 rounded-xl font-black text-lg shadow-[0_4px_20px_-4px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 mt-2">
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default ResetPassword;
