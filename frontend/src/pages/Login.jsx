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
function Login(){
  const navigate=useNavigate();
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
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
    }else{
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("loggedInUser");
    }
  },[navigate]);
  const handleLogin=(e)=>{
    e.preventDefault();
    api.post("/api/accounts/login", {email:email,password:password})
    .then(res=>{
      const data = res.data;
      sessionStorage.setItem("access",data.token);
      sessionStorage.setItem("role",data.user.role.toLowerCase());
      sessionStorage.setItem("email",data.user.email);
      const mappedUser={
        name:data.user.fullName,
        email:data.user.email,
        role:data.user.role==="ORGANIZATION_ADMIN"?"Organization Admin":data.user.role==="LEARNER"?"Learner":data.user.role==="INSTRUCTOR"?"Instructor":"Super Admin",
        status:"Approved"
      };
      sessionStorage.setItem("loggedInUser",JSON.stringify(mappedUser));
      
      const role = data.user.role.toLowerCase();
      if(role==="admin"){
        navigate("/admin-dashboard");
      }else if(role==="learner"){
        navigate("/student-dashboard");
      }else if(role==="instructor"){
        navigate("/instructor-dashboard");
      }else{
        navigate("/institute-dashboard");
      }
    })
    .catch((err)=>{
      const errData = err.response?.data;
      if (errData) {
        alert(errData.non_field_errors||errData.detail||JSON.stringify(errData));
      } else {
        alert("Login failed");
      }
    });
  };
  return(
    <div className="h-screen grid lg:grid-cols-2 bg-white overflow-hidden">
      <div className="hidden lg:flex h-screen sticky top-0 bg-blue-950 text-white flex-col justify-between p-16">
        <div className="flex items-center gap-4">
          <img src={logo} alt="SHNOOR" className="h-16 bg-white rounded-xl p-2"/>
          <div>
            <h1 className="text-3xl font-extrabold">SHNOOR LMS</h1>
            <p className="text-blue-100 mt-1">Subscription Based LMS Platform</p>
          </div>
        </div>
        <div className="max-w-xl">
          <h2 className="text-6xl font-extrabold leading-tight">Learn. Practice. Track. Achieve.</h2>
          <p className="mt-8 text-xl text-blue-100 leading-9">Access courses, assignments, quizzes, certificates, analytics and progress tracking through a professional LMS platform.</p>
        </div>
        <div className="text-blue-200 text-sm">© 2026 SHNOOR International LLC</div>
      </div>
      <div className="h-screen overflow-y-auto flex items-center justify-center px-8 lg:px-20 py-16 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src={logo} alt="SHNOOR" className="h-14"/>
            <h1 className="text-2xl font-extrabold text-blue-700">SHNOOR LMS</h1>
          </div>
          <h2 className="text-5xl font-extrabold mt-3 leading-tight">Login to your account</h2>
          <p className="text-slate-600 mt-5 leading-8">Continue your learning experience from your LMS dashboard.</p>
          <form onSubmit={handleLogin} className="mt-10 grid gap-6">
            <div>
              <label className="font-semibold text-sm">Email Address</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full mt-3 border border-slate-300 rounded-2xl px-5 py-4 bg-white outline-none focus:border-blue-700"/>
            </div>
            <div>
              <label className="font-semibold text-sm">Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full mt-3 border border-slate-300 rounded-2xl px-5 py-4 bg-white outline-none focus:border-blue-700"/>
            </div>
            <div className="flex justify-end text-sm">
              <a href="/" className="text-blue-700 font-bold">Forgot Password?</a>
            </div>
            <button type="submit" className="bg-blue-950 hover:bg-blue-900 transition text-white py-4 rounded-2xl font-bold text-lg">Login</button>
          </form>
          <p className="mt-8 text-center text-slate-600">Don&apos;t have an account? <Link to="/register" className="text-blue-700 font-bold">Register</Link></p>
        </div>
      </div>
    </div>
  );
}
export default Login;