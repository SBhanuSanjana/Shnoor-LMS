import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/shnoor-logo.jpeg";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-6xl font-black leading-tight">Forgot Password? <span className="text-yellow-400">No worries.</span></h2>
          <p className="mt-8 text-xl text-blue-100 leading-relaxed font-medium">We'll help you get back to your account. Enter your registered email to receive a password reset link.</p>
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

          <h2 className="text-4xl lg:text-5xl font-black text-blue-950 leading-tight">Reset Password</h2>
          <p className="text-slate-600 mt-4 text-lg font-medium">Enter your email to receive a link.</p>

          <form onSubmit={handleSubmit} className="mt-12 grid gap-6">
            {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl font-medium">{error}</div>}
            {message && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl font-medium">{message}</div>}

            {!message && (
              <>
                <div>
                  <label className="font-bold text-sm text-blue-950 mb-2 block">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                    disabled={loading}
                    className="w-full border-2 border-slate-200 rounded-xl px-5 py-4 bg-white outline-none focus:border-blue-950 focus:ring-2 focus:ring-blue-900/10 transition-all font-medium text-blue-950 disabled:opacity-50" 
                  />
                </div>
                
                <button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-400 transition-colors text-blue-950 py-4 rounded-xl font-black text-lg shadow-[0_4px_20px_-4px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:hover:-translate-y-0">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </>
            )}
          </form>
          <p className="mt-10 text-center text-slate-600 font-medium">Remember your password? <Link to="/login" className="text-blue-950 hover:text-blue-700 transition-colors font-black ml-1">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
export default ForgotPassword;
