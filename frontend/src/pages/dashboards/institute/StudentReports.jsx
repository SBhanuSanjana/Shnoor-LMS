import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  Search,
  BookOpen,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../../api";

function StudentReports() {
  const { orgType } = useOutletContext();
  const learnerText = orgType === 'company' ? 'Employee' : 'Student';
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/api/org-admin/reports/students");
        setReports(res.data || []);
      } catch (e) {
        console.error("Failed to fetch reports:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const totalStudents = reports.length;
  const totalEnrollments = reports.reduce(
    (sum, r) => sum + (r.total_courses || 0),
    0
  );
  const completedCourses = reports.reduce(
    (sum, r) =>
      sum + (r.courses?.filter((c) => c.completed_at).length || 0),
    0
  );
  const avgCourses =
    totalStudents > 0
      ? (totalEnrollments / totalStudents).toFixed(1)
      : 0;

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.full_name || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q)
    );
  });

  // Calculate Chart Data
  const courseCounts = {};
  let totalInProgress = 0;
  let totalCompletedChart = 0;

  reports.forEach(r => {
    (r.courses || []).forEach(c => {
      if (!courseCounts[c.course_title]) courseCounts[c.course_title] = 0;
      courseCounts[c.course_title]++;

      if (c.completed_at) totalCompletedChart++;
      else totalInProgress++;
    });
  });

  const barData = Object.keys(courseCounts)
    .map(title => ({ name: title, Enrollments: courseCounts[title] }))
    .sort((a, b) => b.Enrollments - a.Enrollments)
    .slice(0, 5); // Top 5 courses

  const pieData = [
    { name: "Completed", value: totalCompletedChart },
    { name: "In Progress", value: totalInProgress }
  ];
  const COLORS = ['#10b981', '#3b82f6']; // Emerald for Completed, Blue for In Progress

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{learnerText} Reports</h2>
        <p className="text-slate-500 text-sm mt-1">
          Comprehensive analytics for all approved {learnerText.toLowerCase()}s
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Total {learnerText}s
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              {totalStudents}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Total Enrollments
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              {totalEnrollments}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Completions
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              {completedCourses}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Avg Courses/{learnerText}
            </p>
            <h3 className="text-xl font-bold text-slate-800">{avgCourses}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Top 5 Courses by Enrollment</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="Enrollments" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Overall Completion Status</h3>
            <div className="h-64 flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-xs font-semibold text-slate-600">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder={`Search ${learnerText.toLowerCase()}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4 w-8"></th>
                  <th className="px-6 py-4">{learnerText}</th>
                  <th className="px-6 py-4 text-center">Courses Enrolled</th>
                  <th className="px-6 py-4 text-center">Completed</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => {
                  const initials = student.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const completedCount =
                    student.courses?.filter((c) => c.completed_at).length || 0;
                  const isExpanded = expandedStudent === student.id;

                  return (
                    <React.Fragment key={student.id}>
                      <tr
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedStudent(isExpanded ? null : student.id)
                        }
                      >
                        <td className="px-6 py-4">
                          <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-200">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">
                                {student.full_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-bold text-slate-800">
                            {student.total_courses || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              completedCount > 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {completedCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="5" className="px-6 py-0">
                            <div className="bg-slate-50 rounded-xl p-5 mb-4 border border-slate-100">
                              <h4 className="text-sm font-bold text-slate-700 mb-3">
                                Enrolled Courses
                              </h4>
                              {student.courses && student.courses.length > 0 ? (
                                <div className="space-y-2">
                                  {student.courses.map((course, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                          <BookOpen size={14} />
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-slate-700">
                                            {course.course_title}
                                          </p>
                                          {course.assessments &&
                                            course.assessments.length > 0 && (
                                              <p className="text-xs text-slate-400">
                                                {course.assessments.length}{" "}
                                                assessment(s) graded
                                              </p>
                                            )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {course.assessments &&
                                          course.assessments.length > 0 && (
                                            <div className="flex gap-1">
                                              {course.assessments.map(
                                                (a, aIdx) => (
                                                  <span
                                                    key={aIdx}
                                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700"
                                                    title={a.assessment_title}
                                                  >
                                                    {a.grade || "N/A"}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          )}
                                        {course.completed_at ? (
                                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                            Completed
                                          </span>
                                        ) : (
                                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                                            In Progress
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400">
                                  No courses enrolled yet
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-12 text-center text-slate-400"
                    >
                      <Users
                        size={48}
                        className="mx-auto mb-4 text-slate-300"
                      />
                      <p className="text-lg font-semibold text-slate-500">
                        No {learnerText.toLowerCase()} data found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentReports;
