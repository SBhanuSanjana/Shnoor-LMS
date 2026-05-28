import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/shnoor-logo.jpeg";
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
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const getHeaders = () => {
    const t=sessionStorage.getItem("access");
    return {
      "Authorization": `Bearer ${t}`,
      "Content-Type": "application/json"
    };
  };
  const loadUsers = () => {
    fetch("http://127.0.0.1:8000/api/auth/admin/users/", { headers: getHeaders() })
    .then(res => {
      if (res.ok) {
        res.json().then(data => {
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
            is_approved: u.is_approved
          }));
          setPendingUsers(mapped.filter(u => !u.is_approved));
          setApprovedUsers(mapped.filter(u => u.is_approved));
        });
      }
    })
    .catch(() => {});
  };
  const loadPendingCourses = () => {
    fetch("http://127.0.0.1:8000/api/courses/admin/pending-courses/", { headers: getHeaders() })
    .then(res => {
      if (res.ok) res.json().then(data => setPendingCourses(data));
    })
    .catch(() => {});
  };
  const loadPendingCertificates = () => {
    fetch("http://127.0.0.1:8000/api/courses/admin/pending-certificates/", { headers: getHeaders() })
    .then(res => {
      if (res.ok) res.json().then(data => setPendingCertificates(data));
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
      loadPendingCertificates();
    }
  }, [navigate, activePage]);
  const approveUser = (email) => {
    const user = [...pendingUsers, ...approvedUsers].find(u => u.email === email);
    if (!user) return;
    fetch(`http://127.0.0.1:8000/api/auth/admin/users/${user.id}/approve/`, {
      method: "POST",
      headers: getHeaders()
    })
    .then(res => {
      if (res.ok) {
        alert("User approved successfully");
        loadUsers();
      }
    })
    .catch(() => {});
  };
  const rejectUser = (email) => {
    const user = [...pendingUsers, ...approvedUsers].find(u => u.email === email);
    if (!user) return;
    fetch(`http://127.0.0.1:8000/api/auth/admin/users/${user.id}/delete/`, {
      method: "DELETE",
      headers: getHeaders()
    })
    .then(res => {
      if (res.ok) {
        alert("User rejected and deleted");
        loadUsers();
      }
    })
    .catch(() => {});
  };
  const handleCourseAction = (id, action) => {
    fetch(`http://127.0.0.1:8000/api/courses/admin/courses/${id}/approve/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ action: action })
    })
    .then(res => {
      if (res.ok) {
        alert(`Course ${action}d successfully`);
        loadPendingCourses();
      }
    })
    .catch(() => {});
  };
  const handleCertificateAction = (id, action) => {
    fetch(`http://127.0.0.1:8000/api/courses/admin/certificates/${id}/approve/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ action: action })
    })
    .then(res => {
      if (res.ok) {
        alert(`Certificate ${action}d successfully`);
        loadPendingCertificates();
      }
    })
    .catch(() => {});
  };
  const renderCoursesView = () => {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Instructor</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingCourses.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-16 text-slate-500">
                  No pending courses found
                </td>
              </tr>
            ) : (
              pendingCourses.map((c, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="px-6 py-5 font-semibold">{c.title}</td>
                  <td className="px-6 py-5">{c.instructor?.full_name || c.instructor?.email}</td>
                  <td className="px-6 py-5 truncate max-w-xs">{c.description}</td>
                  <td className="px-6 py-5 flex gap-2">
                    <button
                      onClick={() => handleCourseAction(c.id, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleCourseAction(c.id, "reject")}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };
  const renderCertificatesView = () => {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Student Email</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingCertificates.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-16 text-slate-500">
                  No pending certificate requests found
                </td>
              </tr>
            ) : (
              pendingCertificates.map((c, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="px-6 py-5 font-semibold">{c.student_name}</td>
                  <td className="px-6 py-5">{c.student_email}</td>
                  <td className="px-6 py-5 font-semibold text-blue-600">{c.course_title}</td>
                  <td className="px-6 py-5 flex gap-2">
                    <button
                      onClick={() => handleCertificateAction(c.id, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleCertificateAction(c.id, "reject")}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-full text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all w-64" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=1e3a8a&color=fff" alt="Admin" className="w-8 h-8 rounded-full border border-white shadow-sm" />
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">Admin User</p>
                <p className="text-[10px] text-slate-500 font-medium">Super Admin</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </header>
        <section className="p-8">
          {activePage === "Overview" && (
            <div className="animate-fade-in-up">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Learners"
                  value={learners.length}
                  colorClass="text-blue-600 bg-blue-100"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                />
                <StatCard
                  title="Employee Requests"
                  value={employeeRequests.length}
                  colorClass="text-indigo-600 bg-indigo-100"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                />
                <StatCard
                  title="Instructor Requests"
                  value={instructorRequests.length}
                  colorClass="text-purple-600 bg-purple-100"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14"></path></svg>}
                />
                <StatCard
                  title="Organization Requests"
                  value={organizationRequests.length}
                  colorClass="text-emerald-600 bg-emerald-100"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
                />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-extrabold text-slate-800">Recent Approvals</h3>
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                  </div>
                  <div className="space-y-5 flex-1">
                    {allApprovedAccounts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No recent approvals</p>
                        <p className="text-xs text-slate-400 mt-1">Approved users will appear here</p>
                      </div>
                    ) : (
                      allApprovedAccounts.slice(0, 4).map((user, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{user.name}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{user.role}</p>
                          </div>
                          <div className="ml-auto">
                            <span className="text-[10px] font-extrabold px-3 py-1 bg-green-100 text-green-700 rounded-full shadow-sm">Approved</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {allApprovedAccounts.length > 0 && (
                    <button
                      onClick={() => setActivePage("Approved Accounts")}
                      className="w-full mt-6 py-3 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      View All Users
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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
              users={employeeRequests}
              approveUser={approveUser}
              rejectUser={rejectUser}
              type="employee"
            />
          )}
          {activePage === "Instructor Approvals" && (
            <ApprovalTable
              users={instructorRequests}
              approveUser={approveUser}
              rejectUser={rejectUser}
              type="instructor"
            />
          )}
          {activePage === "Organization Approvals" && (
            <ApprovalTable
              users={organizationRequests}
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Details</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="text-center py-16 text-slate-500"
              >
                No records found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr
                key={index}
                className="border-t border-slate-100"
              >
                <td className="px-6 py-5 font-semibold">
                  {user.name}
                </td>
                <td className="px-6 py-5">
                  {user.email}
                </td>
                <td className="px-6 py-5">
                  {user.role}
                </td>
                <td className="px-6 py-5">
                  {getUserDetails(user, type)}
                </td>
                <td className="px-6 py-5 flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    Approved
                  </span>
                  {type === "learner" && (() => {
                    const pendingCert = pendingCertificates?.find(c => c.student_email === user.email);
                    if (pendingCert) {
                      return (
                        <div className="flex items-center gap-1.5 ml-2 border-l pl-3 border-slate-200">
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">Cert Pending</span>
                          <button onClick={() => handleCertificateAction(pendingCert.id, "approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold transition">Approve</button>
                          <button onClick={() => handleCertificateAction(pendingCert.id, "reject")} className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-[10px] font-bold transition">Reject</button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
function ApprovalTable({
  users,
  approveUser,
  rejectUser,
  type,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Details</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="text-center py-16 text-slate-500"
              >
                No pending requests found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr
                key={index}
                className="border-t border-slate-100"
              >
                <td className="px-6 py-5 font-semibold">
                  {user.name}
                </td>
                <td className="px-6 py-5">
                  {user.email}
                </td>
                <td className="px-6 py-5">
                  {user.role}
                </td>
                <td className="px-6 py-5">
                  {getUserDetails(user, type)}
                </td>
                <td className="px-6 py-5">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-5 flex gap-2">
                  <button
                    onClick={() =>
                      approveUser(user.email)
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      rejectUser(user.email)
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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