import{Link,useNavigate}from"react-router-dom";
import{useState,useEffect}from"react";
import logo from"../assets/shnoor-logo.jpeg";
import api from '../api';

const isTokenValid=(t)=>{
  if(!t)return false;
  try{
    const p=JSON.parse(atob(t.split(".")[1]));
    return p.exp*1000>Date.now();
  }catch(e){
    return false;
  }
};

function Register(){
  const navigate=useNavigate();
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[role,setRole]=useState("Learner");
  const[learnerType,setLearnerType]=useState("Independent Learner");
  const[organizationCode,setOrganizationCode]=useState("");
  const[rollNumber,setRollNumber]=useState("");
  const[employeeId,setEmployeeId]=useState("");
  const[organizationType,setOrganizationType]=useState("Company");
  const[organizationName,setOrganizationName]=useState("");
  const[organizationLocation,setOrganizationLocation]=useState("");
  const[website,setWebsite]=useState("");
  const[password,setPassword]=useState("");
  const[confirmPassword,setConfirmPassword]=useState("");
  
  useEffect(()=>{
    const token=sessionStorage.getItem("access");
    const roleVal=sessionStorage.getItem("role");
    if(isTokenValid(token)&&roleVal){
      if(roleVal==="admin"){
        navigate("/admin-dashboard");
      }else if(roleVal==="organization_admin"||roleVal==="manager"){
        navigate("/institute-dashboard");
      }else if(roleVal==="instructor"){
        navigate("/instructor-dashboard");
      }else{
        navigate("/student-dashboard");
      }
    }
  },[navigate]);
  
  const inputClass="w-full mt-2 border-2 border-slate-200 rounded-xl px-5 py-4 bg-white outline-none focus:border-blue-950 focus:ring-2 focus:ring-blue-900/10 transition-all font-medium text-blue-950";
  const labelClass="font-bold text-sm text-blue-950 block";

  const handleRegister=(e)=>{
    e.preventDefault();
    if(password!==confirmPassword){
      alert("Passwords do not match");
      return;
    }
    const payload={
      email:email,
      full_name:name,
      password:password,
      confirm_password:confirmPassword,
      role:role==="Learner"?"learner":role==="Instructor"?"instructor":"organization_admin"
    };
    if(payload.role==="learner"){
      payload.learner_type=learnerType==="Independent Learner"?"independent":learnerType==="Student"?"student":"employee";
      if(organizationCode)payload.organization_code=organizationCode;
      if(rollNumber)payload.roll_number=rollNumber;
      if(employeeId)payload.employee_id=employeeId;
    }else if(payload.role==="instructor"){
      if(organizationCode)payload.organization_code=organizationCode;
      if(employeeId)payload.employee_id=employeeId;
    }else if(payload.role==="organization_admin"){
      payload.organization_type=organizationType==="Company"?"company":"institute";
      payload.organization_name=organizationName;
      payload.location=organizationLocation;
      if(website)payload.website=website;
      payload.organization_code=organizationCode;
    }
    api.post("/api/accounts/register", payload)
    .then(res=>{
      alert("Registration successful. Please login.");
      navigate("/login");
    })
    .catch((err)=>{
      const errData = err.response?.data;
      if (errData && errData.error) {
        alert(`Error: ${errData.error}`);
      } else {
        alert("Registration failed. Please try again.");
      }
    });
  };

  return(
    <div className="h-screen grid lg:grid-cols-2 bg-white overflow-hidden font-sans">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex h-screen sticky top-0 bg-blue-950 text-white flex-col justify-between p-16 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#eab308 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white p-1.5 rounded-xl shadow-sm">
            <img src={logo} alt="SHNOOR" className="h-12 w-auto"/>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">SHNOOR LMS</h1>
            <p className="text-yellow-400 font-bold mt-1 text-sm tracking-wide uppercase">Professional LMS Platform</p>
          </div>
        </div>
        <div className="max-w-xl relative z-10">
          <h2 className="text-6xl font-black leading-tight">Join our learning <span className="text-yellow-400">community.</span></h2>
          <p className="mt-8 text-xl text-blue-100 leading-relaxed font-medium">Create a learner, instructor or organization account to experience a professional LMS.</p>
        </div>
        <div className="text-blue-200 text-sm font-medium relative z-10">© 2026 SHNOOR International LLC</div>
      </div>
      
      {/* RIGHT PANEL (FORM) */}
      <div className="h-screen overflow-y-auto flex justify-center px-8 lg:px-20 py-12 bg-slate-50 relative">
        <div className="w-full max-w-md relative z-10 pb-16">
          <div className="lg:hidden flex items-center gap-3 mb-12 mt-4">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
              <img src={logo} alt="SHNOOR" className="h-10 w-auto"/>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-blue-950">SHNOOR LMS</h1>
          </div>
          
          <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-950 transition-colors mb-8">
            ← Back to Home
          </Link>

          <h2 className="text-4xl lg:text-5xl font-black text-blue-950 leading-tight">Create account</h2>
          <p className="text-slate-600 mt-4 text-lg font-medium">Join us and start your journey today.</p>
          
          <form onSubmit={handleRegister} className="mt-10 grid gap-6">
            <div>
              <label className={labelClass}>Select Role</label>
              <select value={role} onChange={(e)=>setRole(e.target.value)} className={inputClass}>
                <option>Learner</option>
                <option>Instructor</option>
                <option>Organization Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" placeholder="Enter your full name" value={name} onChange={(e)=>setName(e.target.value)} className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} className={inputClass}/>
            </div>
            {role==="Learner"&&(
              <>
                <div className="pt-2 border-t border-slate-200">
                  <label className={labelClass}>Learner Type</label>
                  <select value={learnerType} onChange={(e)=>setLearnerType(e.target.value)} className={inputClass}>
                    <option>Independent Learner</option>
                    <option>Student</option>
                    <option>Employee</option>
                  </select>
                </div>
                {learnerType==="Student"&&(
                  <div className="grid gap-6 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <div>
                      <label className={labelClass}>Organization Code <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input type="text" placeholder="Enter organization code" value={organizationCode} onChange={(e)=>setOrganizationCode(e.target.value)} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Roll Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input type="text" placeholder="Enter roll number" value={rollNumber} onChange={(e)=>setRollNumber(e.target.value)} className={inputClass}/>
                    </div>
                  </div>
                )}
                {learnerType==="Employee"&&(
                  <div className="grid gap-6 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <div>
                      <label className={labelClass}>Organization Code <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input type="text" placeholder="Enter organization code" value={organizationCode} onChange={(e)=>setOrganizationCode(e.target.value)} className={inputClass}/>
                    </div>
                    <div>
                      <label className={labelClass}>Employee ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input type="text" placeholder="Enter employee ID" value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} className={inputClass}/>
                    </div>
                  </div>
                )}
              </>
            )}
            {role==="Instructor"&&(
              <div className="grid gap-6 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <div>
                  <label className={labelClass}>Organization Code <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="text" placeholder="Enter organization code" value={organizationCode} onChange={(e)=>setOrganizationCode(e.target.value)} className={inputClass}/>
                </div>
                <div>
                  <label className={labelClass}>Employee ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="text" placeholder="Enter employee ID" value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} className={inputClass}/>
                </div>
              </div>
            )}
            {role==="Organization Admin"&&(
              <div className="grid gap-6 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <div>
                  <label className={labelClass}>Organization Type</label>
                  <select value={organizationType} onChange={(e)=>setOrganizationType(e.target.value)} className={inputClass}>
                    <option>Company</option>
                    <option>Institute</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Organization Name</label>
                  <input type="text" placeholder="Enter organization name" value={organizationName} onChange={(e)=>setOrganizationName(e.target.value)} className={inputClass}/>
                </div>
                <div>
                  <label className={labelClass}>Organization Code</label>
                  <input type="text" placeholder="Enter organization code" value={organizationCode} onChange={(e)=>setOrganizationCode(e.target.value)} className={inputClass}/>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" placeholder="Enter location" value={organizationLocation} onChange={(e)=>setOrganizationLocation(e.target.value)} className={inputClass}/>
                </div>
                <div>
                  <label className={labelClass}>Website <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="text" placeholder="Enter website URL" value={website} onChange={(e)=>setWebsite(e.target.value)} className={inputClass}/>
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200">
              <label className={labelClass}>Password</label>
              <input type="password" placeholder="Create password" value={password} onChange={(e)=>setPassword(e.target.value)} className={inputClass}/>
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className={inputClass}/>
            </div>
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 transition-colors text-blue-950 py-4 rounded-xl font-black text-lg shadow-[0_4px_20px_-4px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 mt-4">Complete Registration</button>
          </form>
          <p className="mt-10 text-center text-slate-600 font-medium">Already have an account? <Link to="/login" className="text-blue-950 hover:text-blue-700 transition-colors font-black ml-1">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}
export default Register;