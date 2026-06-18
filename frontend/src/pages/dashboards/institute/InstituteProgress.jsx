import React, { useState, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import api from "../../../api";

function EmptyState({ title, description, icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-16 min-h-[300px]">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5 text-slate-400 border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto">{description}</p>
    </div>
  );
}

function InstituteProgress() {
  const { orgType } = useOutletContext();
  const location = useLocation();
  const searchTerm = location.state?.searchTerm || '';
  const learnerText = orgType === 'company' ? 'Employee' : 'Learner';
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get("/api/org-admin/progress");
        setProgressData(response.data || []);
      } catch (err) {
        console.error("Failed to fetch progress data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{learnerText} Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Completion</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-16 text-center text-slate-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Loading progress data...
                </td>
              </tr>
            ) : progressData.filter(item => !searchTerm || item.learner_name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.course_title?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
              <tr>
                <td colSpan="4" className="p-0">
                  <EmptyState title="No Progress Data" description={`When ${learnerText.toLowerCase()}s enroll and begin taking courses, their progress metrics will appear here.`} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
                </td>
              </tr>
            ) : (
              progressData
                .filter(item => !searchTerm || item.learner_name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.course_title?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item, idx) => {
                const total = parseInt(item.total_lessons) || 0;
                const completed = parseInt(item.completed_lessons) || 0;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                return (
                  <tr key={`${item.learner_id}-${item.course_id}-${idx}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{item.learner_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.course_title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600 min-w-[3rem]">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(item.last_active).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InstituteProgress;
