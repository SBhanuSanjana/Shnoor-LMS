import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/shnoor-logo.jpeg";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister=async(e)=>{
    e.preventDefault();
    if (password!==confirmPassword){
      alert("Passwords do not match");
      return;
    }
    let backendRole="";
    if(role==="Student"){
        backendRole="user";
    }
    else if(role==="Instructor") {
      backendRole="instructor";
    }
    else if(role==="Institute Admin") {
      backendRole="manager";
    }
    try {
      const response=await fetch(
        "http://127.0.0.1:8000/api/auth/register/",
        {
          method:"POST",
            headers:{
              "Content-Type": "application/json",
            },
            body:JSON.stringify({
              username:name,
              email:email,
              password:password,
              role:backendRole,
            }),
      }
      );
      const data=await response.json();
        if(response.ok){
          alert("Registration successful");
          navigate("/login");
        } else {
          alert(JSON.stringify(data));
        }
      }catch(error){
        alert("Server error"+error);
      }
    };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-white overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex h-screen sticky top-0 bg-blue-700 text-white flex-col justify-between p-16">

        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="SHNOOR"
            className="h-16 bg-white rounded-xl p-2"
          />

          <div>
            <h1 className="text-3xl font-extrabold">
              SHNOOR LMS
            </h1>

            <p className="text-slate-200 mt-1">
              Subscription Based LMS Platform
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <h2 className="text-6xl font-extrabold leading-tight">
            Start your learning journey today.
          </h2>

          <p className="mt-8 text-xl text-slate-200 leading-9">
            Register as a student, instructor or institute user and access
            courses, assignments, certificates and professional LMS workflows.
          </p>
        </div>

        <div className="text-slate-300 text-sm">
          © 2026 SHNOOR International LLC
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="h-screen overflow-y-auto flex justify-center px-8 lg:px-20 py-12 bg-slate-50">

        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img
              src={logo}
              alt="SHNOOR"
              className="h-14"
            />

            <h1 className="text-2xl font-extrabold text-blue-700">
              SHNOOR LMS
            </h1>
          </div>

          <h2 className="text-5xl font-extrabold mt-3 leading-tight">
            Register your account
          </h2>

          <p className="text-slate-600 mt-5 leading-8">
            Create your LMS account to access platform features.
          </p>

          <form onSubmit={handleRegister} className="mt-10 grid gap-6">

            <div>
              <label className="font-semibold text-sm">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-3 border border-slate-300 rounded-2xl px-5 py-4 bg-white outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="font-semibold text-sm">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-3 border border-slate-300 rounded-2xl px-5 py-4 bg-white outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="font-semibold text-sm">
                Select Role
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-3 border border-slate-300 rounded-2xl px-5 py-4 bg-white outline-none focus:border-blue-700"
              >
                <option>Student</option>
                <option>Instructor</option>
                <option>Institute Admin</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-sm">
                Password
              </label>

              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-3 border border-slate-300 rounded-2xl px-5 py-4 bg-white outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="font-semibold text-sm">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-3 border border-slate-300 rounded-2xl px-5 py-4 bg-white outline-none focus:border-blue-700"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 transition text-white py-4 rounded-2xl font-bold text-lg"
            >
              Register
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-700 font-bold"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;