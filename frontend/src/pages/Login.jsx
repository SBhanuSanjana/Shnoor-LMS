import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/shnoor-logo.jpeg";
import api from '../api';

const isTokenValid = (t) => {
  if (!t) return false;
  try {
    const p = JSON.parse(atob(t.split(".")[1]));
    return p.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("access");
    const roleVal = sessionStorage.getItem("role");
    if (isTokenValid(token) && roleVal) {
      if (roleVal === "admin") {
        navigate("/admin-dashboard");
      } else if (roleVal === "organization_admin" || roleVal === "manager") {
        navigate("/institute-dashboard");
      } else if (roleVal === "instructor") {
        navigate("/instructor-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } else {
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("loggedInUser");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    api.post("/api/accounts/login", { email: email, password: password })
      .then(res => {
        const data = res.data;
        sessionStorage.setItem("access", data.token);
        sessionStorage.setItem("role", data.user.role.toLowerCase());
        sessionStorage.setItem("email", data.user.email);
        sessionStorage.setItem("username", data.user.fullName);
        if (data.user.profilePic) {
          sessionStorage.setItem("profile_pic", data.user.profilePic);
        } else {
          sessionStorage.removeItem("profile_pic");
        }
        if (data.user.learnerType) {
          sessionStorage.setItem("learnerType", data.user.learnerType);
        }
        const mappedUser = {
          name: data.user.fullName,
          email: data.user.email,
          role: data.user.role === "ORGANIZATION_ADMIN" ? "Organization Admin" : data.user.role === "LEARNER" ? "Learner" : data.user.role === "INSTRUCTOR" ? "Instructor" : "Super Admin",
          status: "Approved"
        };
        sessionStorage.setItem("loggedInUser", JSON.stringify(mappedUser));

        const role = data.user.role.toLowerCase();
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "learner") {
          navigate("/student-dashboard");
        } else if (role === "instructor") {
          navigate("/instructor-dashboard");
        } else {
          navigate("/institute-dashboard");
        }
      })
      .catch((err) => {
        const errData = err.response?.data;
        if (errData) {
          alert(errData.non_field_errors || errData.detail || JSON.stringify(errData));
        } else {
          alert("Login failed");
        }
      });
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
          <h2 className="text-6xl font-black leading-tight">Learn. Practice. <span className="text-yellow-400">Achieve.</span></h2>
          <p className="mt-8 text-xl text-blue-100 leading-relaxed font-medium">Access courses, assignments, quizzes, certificates, analytics and progress tracking through a professional centralized hub.</p>
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

          <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-950 transition-colors mb-8">
            ← Back to Home
          </Link>

          <h2 className="text-4xl lg:text-5xl font-black text-blue-950 leading-tight">Welcome back</h2>
          <p className="text-slate-600 mt-4 text-lg font-medium">Continue your learning experience.</p>

          <form onSubmit={handleLogin} className="mt-12 grid gap-6">
            <div>
              <label className="font-bold text-sm text-blue-950 mb-2 block">Email Address</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-5 py-4 bg-white outline-none focus:border-blue-950 focus:ring-2 focus:ring-blue-900/10 transition-all font-medium text-blue-950" />
            </div>
            <div>
              <label className="font-bold text-sm text-blue-950 mb-2 block">Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-5 py-4 bg-white outline-none focus:border-blue-950 focus:ring-2 focus:ring-blue-900/10 transition-all font-medium text-blue-950" />
            </div>
            <div className="flex justify-end text-sm mt-2">
              <Link to="/forgot-password" className="text-blue-950 hover:text-blue-700 transition-colors font-black">Forgot Password?</Link>
            </div>
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 transition-colors text-blue-950 py-4 rounded-xl font-black text-lg shadow-[0_4px_20px_-4px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 mt-2">Login to Dashboard</button>
          </form>
          <p className="mt-10 text-center text-slate-600 font-medium">Don&apos;t have an account? <Link to="/register" className="text-blue-950 hover:text-blue-700 transition-colors font-black ml-1">Register now</Link></p>
        </div>
      </div>
    </div>
  );
}
export default Login;