import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Check } from 'lucide-react';

function StudentAssignments() {
  const [activeTab, setActiveTab] = useState('pending');
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answersText, setAnswersText] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => {
    const t = sessionStorage.getItem("access");
    return {
      "Authorization": `Bearer ${t}`,
      "Content-Type": "application/json"
    };
  };

  const loadData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/courses/enrollments/", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
        const list = [];
        data.forEach(e => {
          e.course.assessments?.forEach(a => {
            const sub = e.assessment_submissions?.find(s => s.assessment === a.id);
            let status = 'pending';
            if (sub) {
              status = sub.is_graded ? 'graded' : 'submitted';
            }
            list.push({
              id: a.id,
              title: a.title,
              description: a.description,
              course: e.course.title,
              status,
              submittedAt: sub ? new Date(sub.created_at).toLocaleDateString() : null,
              score: sub?.grade || '--',
              maxMarks: '100',
              answersText: sub?.answers_text || ''
            });
          });
        });
        setAssignments(list);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitAssignment = async (id) => {
    const txt = answersText[id];
    if (!txt || !txt.trim()) {
      alert("Please write your answer text before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/courses/assessments/${id}/submit/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ answers_text: txt })
      });
      if (res.ok) {
        alert("Assignment submitted successfully!");
        setAnswersText({ ...answersText, [id]: '' });
        loadData();
      }
    } catch (e) {
      alert("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const submittedCount = assignments.filter(a => a.status === 'submitted').length;
  const gradedCount = assignments.filter(a => a.status === 'graded').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Assignments</h2>
        <p className="text-slate-500 text-sm mt-1">Submit your tasks and track your grades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Pending Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800">{pendingCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Check size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Submitted</p>
            <h3 className="text-2xl font-bold text-slate-800">{submittedCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Graded</p>
            <h3 className="text-2xl font-bold text-slate-800">{gradedCount}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-full sm:w-auto">
            {['pending', 'submitted', 'graded'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all flex-1 sm:flex-none ${activeTab === tab ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 p-6 space-y-6">
            {assignments.filter(a => a.status === activeTab).map((assignment) => (
              <div key={assignment.id} className="pt-6 first:pt-0">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
                        ${assignment.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                          assignment.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 
                          'bg-emerald-100 text-emerald-700'}`}
                      >
                        {assignment.status}
                      </span>
                      <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{assignment.course}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">{assignment.title}</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">{assignment.description}</p>
                    
                    {assignment.status === 'pending' ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Write your solution:</label>
                        <textarea
                          rows="5"
                          value={answersText[assignment.id] || ''}
                          onChange={(e) => setAnswersText({ ...answersText, [assignment.id]: e.target.value })}
                          placeholder="Type your response here..."
                          className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                        ></textarea>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Submission</div>
                        <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">{assignment.answersText}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:w-64 bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center text-center h-full space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Submission status</p>
                      <div className="text-3xl font-black text-slate-800">
                        {assignment.status === 'graded' ? (
                          <span className="text-emerald-600">{assignment.score}</span>
                        ) : assignment.status === 'submitted' ? (
                          <span className="text-blue-600 text-lg uppercase font-bold">Grading Pending</span>
                        ) : (
                          <span className="text-slate-300">--</span>
                        )}
                      </div>
                    </div>
                    {assignment.status === 'pending' && (
                      <button onClick={() => handleSubmitAssignment(assignment.id)} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md disabled:opacity-50">
                        {submitting ? "Submitting..." : "Submit Assignment"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {assignments.filter(a => a.status === activeTab).length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium">No tasks found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAssignments;