import { useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import logo from "../../../assets/shnoor-logo.jpeg";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Users,
  LogOut,
} from "lucide-react";

const isTokenValid = (t) => {
  if (!t) return false;

  try {
    const p = JSON.parse(atob(t.split(".")[1]));
    return p.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

function InstructorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Overview", path: "/instructor-dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "My Courses", path: "/instructor-dashboard/courses", icon: <BookOpen size={20} /> },
    { name: "Assignments", path: "/instructor-dashboard/assignments", icon: <FileText size={20} /> },
    { name: "Quizzes", path: "/instructor-dashboard/quizzes", icon: <ClipboardList size={20} /> },
    { name: "Students List", path: "/instructor-dashboard/students", icon: <Users size={20} /> },
  ];

  useEffect(() => {
    const token = sessionStorage.getItem("access");
    const role = sessionStorage.getItem("role");

    if (!isTokenValid(token)) {
      sessionStorage.clear();
      navigate("/login");
    } else if (role !== "instructor") {
      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "organization_admin" || role === "manager") navigate("/institute-dashboard");
      else navigate("/student-dashboard");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const getPageTitle = () => {
    const item = menuItems.find((m) => m.path === location.pathname);

    if (item) return item.name;
    if (location.pathname.includes("/build")) return "Course Builder";

    return "Instructor Portal";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-60 bg-blue-950 text-white min-h-screen fixed left-0 top-0 flex flex-col justify-between shadow-xl z-20">
        
          <div>
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-10 w-10 rounded-lg bg-white p-1"
                />
                <div>
                  <h1 className="text-sm font-extrabold tracking-tight text-white">
                    SHNOOR LMS
                  </h1>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                    Instructor
                  </p>
                </div>
              </div>
            </div>

            <nav className="px-3 py-3 space-y-1">
              {menuItems.map((item, index) => {
                const isActive =
                  location.pathname === item.path ||
                  (location.pathname.startsWith(item.path) &&
                    item.path !== "/instructor-dashboard");

                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-[12px] font-semibold transition ${isActive
                        ? "bg-white text-blue-950"
                        : "text-blue-50 hover:bg-blue-900"
                      }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full bg-blue-900 hover:bg-red-600 text-blue-50 hover:text-white py-2.5 px-4 rounded-xl text-[12px] font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        
      </aside>
      <main className="ml-60 flex-1 flex flex-col min-h-screen">
        <header className="bg-white px-8 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all w-64" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center font-bold text-sm">
                {(sessionStorage.getItem("username") || "Instructor")[0].toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{sessionStorage.getItem("username") || "Instructor"}</p>
                <p className="text-xs text-slate-500">Instructor</p>
              </div>
            </div>
          </div>
        </header>
        <section className="p-8 flex-1">

      <Outlet />
    </section>
      </main>
    </div>
  );
}

export default InstructorDashboard;