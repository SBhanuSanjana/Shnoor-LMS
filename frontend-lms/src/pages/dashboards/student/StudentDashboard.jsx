import{useEffect}from"react";
import{useNavigate,Link,Outlet,useLocation}from"react-router-dom";
import logo from"../../../assets/shnoor-logo.jpeg";
import{LayoutDashboard,BookOpen,ClipboardList,FileText,Target,Award,CreditCard,LogOut}from"lucide-react";
const isTokenValid=(t)=>{
  if(!t)return false;
  try{
    const p=JSON.parse(atob(t.split(".")[1]));
    return p.exp*1000>Date.now();
  }catch(e){
    return false;
  }
};
function StudentDashboard(){
  const navigate=useNavigate();
  const location=useLocation();
  const menuItems=[
    {name:"Overview",path:"/student-dashboard",icon:<LayoutDashboard size={20}/>},
    {name:"My Courses",path:"/student-dashboard/courses",icon:<BookOpen size={20}/>},
    {name:"Quizzes",path:"/student-dashboard/quizzes",icon:<ClipboardList size={20}/>},
    {name:"Assignments",path:"/student-dashboard/assignments",icon:<FileText size={20}/>},
    {name:"Progress Tracker",path:"/student-dashboard/progress",icon:<Target size={20}/>},
    {name:"Certificates",path:"/student-dashboard/certificates",icon:<Award size={20}/>},
    {name:"Subscription",path:"/student-dashboard/subscription",icon:<CreditCard size={20}/>},
  ];
  useEffect(()=>{
    const token=sessionStorage.getItem("access");
    const role=sessionStorage.getItem("role");
    if(!isTokenValid(token)){
      sessionStorage.clear();
      navigate("/login");
    }else if(role!=="learner"){
      if(role==="admin"){
        navigate("/admin-dashboard");
      }else if(role==="organization_admin"||role==="manager"){
        navigate("/institute-dashboard");
      }else if(role==="instructor"){
        navigate("/instructor-dashboard");
      }
    }
  },[navigate]);
  const handleLogout=()=>{
    sessionStorage.clear();
    navigate("/login");
  };
  const getPageTitle=()=>{
    const item=menuItems.find(m=>m.path===location.pathname);
    if(item)return item.name;
    return"Learner Portal";
  };
  return(
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      <aside className="w-60 bg-blue-950 text-white min-h-screen fixed left-0 top-0 flex flex-col justify-between shadow-lg">
        <div>
          <div className="px-6 py-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-12 w-12 rounded-xl bg-white p-1 object-contain"/>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">SHNOOR LMS</h1>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Learner Portal</p>
              </div>
            </div>
          </div>
          <nav className="px-3 py-6 space-y-1.5">
            {menuItems.map((item,index)=>{
              const isActive=location.pathname===item.path||(location.pathname.startsWith(item.path)&&item.path!=="/student-dashboard");
              return(
                <Link key={index} to={item.path} className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${isActive?"bg-white text-blue-950":"text-blue-50 hover:bg-blue-900"}`}>
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-blue-900 hover:bg-red-600 text-blue-50 hover:text-white py-2.5 px-4 rounded-xl text-[12px] font-bold transition flex items-center justify-center gap-2">
            <LogOut size={18}/>
            Logout
          </button>
        </div>
      </aside>
      <main className="ml-60 flex-1 flex flex-col min-h-screen">
        <header className="bg-white px-8 py-3 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{getPageTitle()}</h2>
            <p className="text-sm text-slate-500 mt-1">Control panel for tracking your learning progress.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-full text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all w-64"/>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors">
              <img src="https://ui-avatars.com/api/?name=Learner&background=1e3a8a&color=fff" alt="Learner" className="w-8 h-8 rounded-full border border-white shadow-sm"/>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{sessionStorage.getItem("username")||"Learner"}</p>
                <p className="text-[10px] text-slate-500 font-medium">Learner</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </header>
        <div className="p-8 flex-1">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}
export default StudentDashboard;