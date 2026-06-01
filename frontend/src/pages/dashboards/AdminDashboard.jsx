import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/shnoor-logo.jpeg";
import api from '../../api';
const isTokenValid=(t)=>{
  if(!t)return false;
  try{
    const p=JSON.parse(atob(t.split(".")[1]));
    return p.exp*1000>Date.now();
  }catch(e){
    return false;
  }
};
function AdminDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("Overview");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [pendingCertificates, setPendingCertificates] = useState([]);

  const loadUsers = () => {
    api.get(`/api/auth/admin/users`)
    .then(res => {
      if (res.status >= 200 && res.status < 300) {
        const data = res.data;
          const mapped = data.map(u => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: u.role === "learner" ? "Learner" : u.role === "instructor" ? "Instructor" : "Organization Admin",
            learnerType: u.learner_type === "independent" ? "Independent Learner" : u.learner_type === "student" ? "Student" : u.learner_type === "employee" ? "Employee" : "",
            organizationCode: u.organization_code,
            organizationName: u.organization_name,
            organizationType: u.organization_type,
            rollNumber: u.roll_number,
            employeeId: u.employee_id,
            location: u.location,
            website: u.website,
            created_at: u.created_at,
            is_approved: u.is_approved
          }));
          setPendingUsers(mapped.filter(u => !u.is_approved));
          setApprovedUsers(mapped.filter(u => u.is_approved));
      }
    })
    .catch(() => {});
  };
  const loadPendingCourses = () => {
    api.get(`/api/admin/pending-courses`)
    .then(res => {
      if (res.status >= 200 && res.status < 300) setPendingCourses(res.data);
    })
    .catch(() => {});
  };
  const loadApprovedCourses = () => {
    api.get(`/api/courses/`)
    .then(res => {
      if (res.status >= 200 && res.status < 300) setApprovedCourses(res.data);
    })
    .catch(() => {});
  };
  const loadPendingCertificates = () => {
    api.get(`/api/admin/pending-certificates`)
    .then(res => {
      if (res.status >= 200 && res.status < 300) setPendingCertificates(res.data);
    })
    .catch(() => {});
  };
  useEffect(() => {
    const token=sessionStorage.getItem("access");
    const role=sessionStorage.getItem("role");
    if(!isTokenValid(token)){
      sessionStorage.clear();
      navigate("/login");
    } else if (role !== "admin") {
      if (role === "learner") {
        navigate("/student-dashboard");
      } else if (role === "organization_admin" || role === "manager") {
        navigate("/institute-dashboard");
      } else if (role === "instructor") {
        navigate("/instructor-dashboard");
      }
    } else {
      loadUsers();
      loadPendingCourses();
      loadApprovedCourses();
      loadPendingCertificates();
    }
  }, [navigate, activePage]);
  const approveUser = (email) => {
    const user = [...pendingUsers, ...approvedUsers].find(u => u.email === email);
    if (!user) return;
    api.post(`/api/auth/admin/users/${user.id}/approve`)
    .then(res => {
      if ((res.status >= 200 && res.status < 300)) {
        alert("User approved successfully");
        loadUsers();
      }
    })
    .catch(() => {});
  };
  const rejectUser = (email) => {
    const user = [...pendingUsers, ...approvedUsers].find(u => u.email === email);
    if (!user) return;
    api.delete(`/api/auth/admin/users/${user.id}/delete`)
    .then(res => {
      if ((res.status >= 200 && res.status < 300)) {
        alert("User rejected and deleted");
        loadUsers();
      }
    })
    .catch(() => {});
  };
  const handleCourseAction = (id, action) => {
    api.post(`/api/admin/courses/${id}/review`, { action: action })
    .then(res => {
      if ((res.status >= 200 && res.status < 300)) {
        alert(`Course ${action}d successfully`);
        loadPendingCourses();
        loadApprovedCourses();
      }
    })
    .catch(() => {});
  };
  const handleCertificateAction = (id, action) => {
    api.post(`/api/admin/certificates/${id}/review`, { action: action })
    .then(res => {
      if ((res.status >= 200 && res.status < 300)) {
        alert(`Certificate ${action}d successfully`);
        loadPendingCertificates();
      }
    })
    .catch(() => {});
  };
  const renderCoursesView = () => {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Pending Course Approvals</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingCourses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                          </div>
                          <p className="text-sm font-semibold text-slate-500">No pending courses found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingCourses.map((c, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                            </div>
                            <span className="text-sm font-bold text-slate-800">{c.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm border border-slate-200">
                              {(c.instructor?.full_name || c.instructor?.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{c.instructor?.full_name || c.instructor?.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-500 truncate max-w-xs">{c.description}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleCourseAction(c.id, "approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                              Approve
                            </button>
                            <button onClick={() => handleCourseAction(c.id, "reject")} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Approved Courses</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Enrollments</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedCourses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                          </div>
                          <p className="text-sm font-semibold text-slate-500">No approved courses found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    approvedCourses.map((c, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                            </div>
                            <span className="text-sm font-bold text-slate-800">{c.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm border border-slate-200">
                              {(c.instructor?.full_name || c.instructor?.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{c.instructor?.full_name || c.instructor?.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-700 font-bold border border-slate-100">{c.enrollments_count || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Approved
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderCertificatesView = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingCertificates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-500">No pending certificate requests</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingCertificates.map((c, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-sm">
                          {c.student_name ? c.student_name.charAt(0).toUpperCase() : "-"}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{c.student_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        <span className="text-sm font-medium">{c.student_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-600">{c.course_title}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Verification Pending</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleCertificateAction(c.id, "approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                          Approve
                        </button>
                        <button onClick={() => handleCertificateAction(c.id, "reject")} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const menuItems = [
    "Overview",
    "Learner Management",
    "Employee Approvals",
    "Instructor Approvals",
    "Organization Approvals",
    "Approved Accounts",
    "Manage Courses",
    "Certificate Approvals",
    "Subscription Plans",
    "Payments",
    "Reports",
    "Contact Queries",
    "Settings",
  ];
  const learners = approvedUsers.filter(
    (user) =>
      user.role === "Learner" &&
      (user.learnerType === "Independent Learner" ||
        user.learnerType === "Student")
  );
  const employeeRequests = pendingUsers.filter(
    (user) =>
      user.role === "Learner" &&
      user.learnerType === "Employee"
  );
  const instructorRequests = pendingUsers.filter(
    (user) => user.role === "Instructor"
  );
  const organizationRequests = pendingUsers.filter(
    (user) => user.role === "Organization Admin"
  );
  const approvedEmployees = approvedUsers.filter(
    (user) =>
      user.role === "Learner" &&
      user.learnerType === "Employee"
  );
  const allApprovedAccounts = approvedUsers.filter(
    (user) =>
      user.role === "Instructor" ||
      user.role === "Organization Admin" ||
      (user.role === "Learner" && user.learnerType === "Employee")
  );
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-60 bg-blue-950 text-white min-h-screen fixed left-0 top-0 flex flex-col justify-between">
        <div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-10 rounded-lg bg-white p-1"
              />
              <div>
                <h1 className="text-sm font-extrabold tracking-tight">SHNOOR LMS</h1>
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Super Admin</p>
              </div>
            </div>
          </div>
          <nav className="px-3 py-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActivePage(item)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-semibold transition ${activePage === item
                  ? "bg-white text-blue-950"
                  : "text-blue-50 hover:bg-blue-900"
                  }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { sessionStorage.clear(); navigate('/login'); }}
            className="w-full bg-blue-900 hover:bg-red-600 text-blue-50 hover:text-white py-2.5 px-4 rounded-xl text-[12px] font-bold transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Logout
          </button>
        </div>
      </aside>
      <main className="ml-60 flex-1">
        <header className="bg-white px-8 py-3 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {activePage}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage your {activePage.toLowerCase()} and view statistics.
            </p>
          </div>
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center font-bold text-sm">
                {(sessionStorage.getItem("username") || "Admin User").charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{sessionStorage.getItem("username") || "Admin User"}</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>
        <section className="p-8">
          {activePage === "Overview" && (() => {
            const totalLearnerRequests = pendingUsers.filter(u => u.role === "Learner" && u.learnerType !== "Employee").length + learners.length;
            const totalEmployeeRequests = employeeRequests.length + approvedEmployees.length;
            const totalInstructorRequests = instructorRequests.length + allApprovedAccounts.filter(u => u.role === "Instructor").length;
            const totalOrgRequests = organizationRequests.length + allApprovedAccounts.filter(u => u.role === "Organization Admin").length;
            const totalRequests = totalLearnerRequests + totalEmployeeRequests + totalInstructorRequests + totalOrgRequests;
            
            const learnerPct = totalRequests > 0 ? Math.round((totalLearnerRequests / Math.max(totalRequests, 1)) * 100) : 0;
            const employeePct = totalRequests > 0 ? Math.round((totalEmployeeRequests / Math.max(totalRequests, 1)) * 100) : 0;
            const instructorPct = totalRequests > 0 ? Math.round((totalInstructorRequests / Math.max(totalRequests, 1)) * 100) : 0;
            const orgPct = totalRequests > 0 ? Math.round((totalOrgRequests / Math.max(totalRequests, 1)) * 100) : 0;
            
            const segments = [
              { label: "Learner Requests", count: totalLearnerRequests, pct: learnerPct, color: "#3b82f6" },
              { label: "Employee Requests", count: totalEmployeeRequests, pct: employeePct, color: "#22c55e" },
              { label: "Instructor Requests", count: totalInstructorRequests, pct: instructorPct, color: "#8b5cf6" },
              { label: "Organization Requests", count: totalOrgRequests, pct: orgPct, color: "#ef4444" },
            ];
            const radius = 70, cx = 90, cy = 90, strokeWidth = 18;
            const circumference = 2 * Math.PI * radius;
            let cumulativeOffset = 0;
            
            return (
              <div className="animate-fade-in-up space-y-6">
                {/* 4 Stat Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { title: "TOTAL LEARNERS", value: learners.length, bg: "bg-blue-50/50", iconBg: "bg-blue-100", iconColor: "text-blue-600", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
                    { title: "TOTAL EMPLOYEES", value: employeeRequests.length + approvedEmployees.length, bg: "bg-emerald-50/50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
                    { title: "TOTAL INSTRUCTORS", value: instructorRequests.length + allApprovedAccounts.filter(u => u.role === "Instructor").length, bg: "bg-violet-50/50", iconBg: "bg-violet-100", iconColor: "text-violet-600", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14"/></svg> },
                    { title: "TOTAL ORGANIZATIONS", value: organizationRequests.length + allApprovedAccounts.filter(u => u.role === "Organization Admin").length, bg: "bg-rose-50/50", iconBg: "bg-rose-100", iconColor: "text-rose-600", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
                  ].map((card, idx) => (
                    <div key={idx} className={`${card.bg} rounded-2xl p-5 border border-slate-100 flex items-start justify-between shadow-sm`}>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{card.title}</p>
                        <h3 className="text-3xl font-extrabold text-slate-800">{card.value}</h3>
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                        {card.icon}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                  {/* Recent Approvals (Left 3 columns) */}
                  <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-extrabold text-slate-800">Recent Approvals</h3>
                      <button onClick={() => setActivePage("Approved Accounts")} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">View All</button>
                    </div>
                    <div className="space-y-4 flex-1">
                      {allApprovedAccounts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center pb-8">
                          <p className="text-sm font-semibold text-slate-500">No recent approvals</p>
                        </div>
                      ) : (
                        allApprovedAccounts.slice(0, 4).map((user, i) => {
                          const bgColors = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-rose-600"];
                          return (
                            <div key={i} className="flex items-center gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                              <div className={`w-10 h-10 rounded-full ${bgColors[i % 4]} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                <p className="text-xs font-medium text-slate-500">{user.role}</p>
                              </div>
                              <div className="ml-auto flex items-center gap-4">
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">Approved</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {/* Bottom Stats Row */}
                    <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>TOTAL APPROVALS</p>
                        <p className="text-xl font-extrabold text-slate-800 mt-1 text-center">{allApprovedAccounts.length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>PENDING REQUESTS</p>
                        <p className="text-xl font-extrabold text-slate-800 mt-1 text-center">{pendingUsers.length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>REJECTED</p>
                        <p className="text-xl font-extrabold text-slate-800 mt-1 text-center">0</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>THIS MONTH</p>
                        <p className="text-xl font-extrabold text-slate-800 mt-1 text-center">{allApprovedAccounts.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Request Overview (Right 2 columns) */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-extrabold text-slate-800">Request Overview</h3>
                      <span className="text-xs font-semibold text-slate-400">This Month ▾</span>
                    </div>
                    <div className="flex justify-center mb-8 relative">
                      <svg width="180" height="180" className="-rotate-90">
                        {segments.map((seg, idx) => {
                          if (totalRequests === 0) return null;
                          const strokeDasharray = `${(seg.count / Math.max(totalRequests, 1)) * circumference} ${circumference}`;
                          const strokeDashoffset = -cumulativeOffset;
                          cumulativeOffset += (seg.count / Math.max(totalRequests, 1)) * circumference;
                          return (
                            <circle key={idx} cx={cx} cy={cy} r={radius} fill="transparent" stroke={seg.color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                          );
                        })}
                        {totalRequests === 0 && (
                          <circle cx={cx} cy={cy} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-slate-500">Total</span>
                        <span className="text-3xl font-black text-slate-800">{totalRequests}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Requests</span>
                      </div>
                    </div>
                    <div className="space-y-3 flex-1">
                      {segments.map((seg, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
                            <span className="text-sm font-semibold text-slate-600">{seg.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-slate-800">{seg.count}</span>
                            <span className="text-xs font-medium text-slate-400 w-6 text-right">{seg.pct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">All clear! Keep up the great work.</h4>
                        <p className="text-xs text-slate-500 mt-0.5">There are no pending requests at the moment.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { title: "Add Learner", sub: "Create new learner", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", color: "text-blue-600", bg: "bg-blue-50", click: "Learner Management" },
                      { title: "Add Employee", sub: "Create new employee", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-emerald-600", bg: "bg-emerald-50", click: "Employee Approvals" },
                      { title: "Add Instructor", sub: "Create new instructor", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14", color: "text-violet-600", bg: "bg-violet-50", click: "Instructor Approvals" },
                      { title: "Add Organization", sub: "Create new organization", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "text-rose-600", bg: "bg-rose-50", click: "Organization Approvals" },
                      { title: "Manage Courses", sub: "View all courses", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-cyan-600", bg: "bg-cyan-50", click: "Manage Courses" },
                      { title: "Generate Report", sub: "View analytics", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-fuchsia-600", bg: "bg-fuchsia-50", click: "Reports" },
                    ].map((btn, idx) => (
                      <button key={idx} onClick={() => setActivePage(btn.click)} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-left flex flex-col group">
                        <div className={`w-8 h-8 rounded-lg ${btn.bg} ${btn.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={btn.icon}/></svg>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">{btn.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{btn.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
          {activePage === "Learner Management" && (
            <UserTable
              users={learners}
              type="learner"
              pendingCertificates={pendingCertificates}
              handleCertificateAction={handleCertificateAction}
            />
          )}
          {activePage === "Employee Approvals" && (
            <ApprovalTable
              users={[...employeeRequests.map(u => ({...u, _status: 'pending'})), ...approvedEmployees.map(u => ({...u, _status: 'approved'}))]}
              approveUser={approveUser}
              rejectUser={rejectUser}
              type="employee"
            />
          )}
          {activePage === "Instructor Approvals" && (
            <ApprovalTable
              users={[...instructorRequests.map(u => ({...u, _status: 'pending'})), ...allApprovedAccounts.filter(u => u.role === "Instructor").map(u => ({...u, _status: 'approved'}))]}
              approveUser={approveUser}
              rejectUser={rejectUser}
              type="instructor"
            />
          )}
          {activePage === "Organization Approvals" && (
            <ApprovalTable
              users={[...organizationRequests.map(u => ({...u, _status: 'pending'})), ...allApprovedAccounts.filter(u => u.role === "Organization Admin").map(u => ({...u, _status: 'approved'}))]}
              approveUser={approveUser}
              rejectUser={rejectUser}
              type="organization"
            />
          )}
          {activePage === "Approved Accounts" && (
            <UserTable
              users={allApprovedAccounts}
              type="all"
              pendingCertificates={pendingCertificates}
              handleCertificateAction={handleCertificateAction}
            />
          )}
          {activePage === "Manage Courses" && renderCoursesView()}
          {activePage === "Certificate Approvals" && renderCertificatesView()}
          {![
            "Overview",
            "Learner Management",
            "Employee Approvals",
            "Instructor Approvals",
            "Organization Approvals",
            "Approved Accounts",
            "Manage Courses",
            "Certificate Approvals"
          ].includes(activePage) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500">
                  This module will be developed next.
                </p>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}
function StatCard({ title, value, icon, trend, colorClass }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] transition-all duration-300 group cursor-pointer">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 group-hover:bg-opacity-30 transition-all`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-5 flex items-center gap-2 text-sm">
          <span className={`font-bold flex items-center gap-1 ${trend > 0 ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md' : 'text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md'}`}>
            {trend > 0 ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            ) : null}
            {trend > 0 ? `+${trend}%` : '0%'}
          </span>
          <span className="text-slate-400 font-medium text-xs">from last month</span>
        </div>
      )}
    </div>
  );
}
function UserTable({ users, type, pendingCertificates, handleCertificateAction }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role & Details</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : "-"}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-700">{user.role}</span>
                      <span className="text-[10px] font-medium text-slate-400">{getUserDetails(user, type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-3">
                    {type === "learner" && (() => {
                      const pendingCert = pendingCertificates?.find(c => c.student_email === user.email);
                      if (pendingCert) {
                        return (
                          <div className="flex items-center gap-2 mr-3 pr-3 border-r border-slate-200">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded">Cert Pending</span>
                            <button onClick={() => handleCertificateAction(pendingCert.id, "approve")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition">Approve</button>
                            <span className="text-slate-300">|</span>
                            <button onClick={() => handleCertificateAction(pendingCert.id, "reject")} className="text-xs font-bold text-rose-600 hover:text-rose-700 transition">Reject</button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Approved
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function ApprovalTable({ users, approveUser, rejectUser, type }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">User</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Role</th>
              {type === "employee" && (
                <>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Emp ID</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Org Code</th>
                </>
              )}
              {type === "organization" && (
                <>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Org Code</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                </>
              )}
              {type === "instructor" && (
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Joined Date</th>
              )}
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No requests found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : "-"}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-700 capitalize">{user.role.replace('_', ' ')}</span>
                  </td>
                  {type === "employee" && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{user.employeeId || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{user.organizationCode || "-"}</td>
                    </>
                  )}
                  {type === "organization" && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{user.organizationCode || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{user.location || "-"}</td>
                    </>
                  )}
                  {type === "instructor" && (
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user._status === 'approved' || user.is_approved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {user._status === 'approved' || user.is_approved ? (
                      <span className="text-[10px] font-bold text-slate-400">No Action Needed</span>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => approveUser(user.email)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                          Approve
                        </button>
                        <button onClick={() => rejectUser(user.email)} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function getUserDetails(user, type) {
  if (type === "employee") {
    return `${user.organizationCode || "-"} | ${user.employeeId || "-"
      }`;
  }
  if (type === "organization") {
    return `${user.organizationType || "-"} | ${user.organizationName || "-"
      }`;
  }
  if (type === "instructor") {
    return "Instructor Account";
  }
  if (type === "all") {
    if (user.role === "Learner" && user.learnerType === "Employee") {
      return `${user.organizationCode || "-"} | ${user.employeeId || "-"}`;
    }
    if (user.role === "Organization Admin") {
      return `${user.organizationType || "-"} | ${user.organizationName || "-"}`;
    }
    if (user.role === "Instructor") {
      return "Instructor Account";
    }
    return "-";
  }
  return `${user.learnerType || "-"}`;
}
export default AdminDashboard;