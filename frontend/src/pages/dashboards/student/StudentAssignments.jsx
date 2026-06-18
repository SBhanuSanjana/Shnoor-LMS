import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, Check } from 'lucide-react';
import api from '../../../api';

function StudentAssignments() {
  const location = useLocation();
  const searchTerm = location.state?.searchTerm || '';
  const [activeTab, setActiveTab] = useState('pending');
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answersText, setAnswersText] = useState({});
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);



  const loadData = async () => {
    try {
      const res = await api.get(`/api/courses/enrollments`);
      if ((res.status >= 200 && res.status < 300)) {
        const data = res.data;
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
              answersText: sub?.answers_text || '',
              submissionFile: sub?.submission_file || null
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
    const file = submissionFiles[id];

    if ((!txt || !txt.trim()) && !file) {
      alert("Please write your answer text or upload a file before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (txt) formData.append('answersText', txt);
      if (file) formData.append('submission_file', file);

      const res = await api.post(`/api/courses/assessments/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if ((res.status >= 200 && res.status < 300)) {
        alert("Assignment submitted successfully!");
        setAnswersText({ ...answersText, [id]: '' });
        setSubmissionFiles({ ...submissionFiles, [id]: null });
        loadData();
      }
    } catch (e) {
      alert("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const submittedCount = assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
  const gradedCount = assignments.filter(a => a.status === 'graded').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Assignments</h2>
        <p className="text-slate-500 text-sm mt-1">Submit your tasks and track your grades</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{pendingCount}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Pending</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Check size={24} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{submittedCount}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Submitted</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{gradedCount}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Graded</p>
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
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all flex-1 sm:flex-none ${activeTab === tab ? 'bg-blue-50 text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950 mx-auto"></div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 p-6 space-y-6">
            {assignments
              .filter(a => searchTerm ? true : (activeTab === 'submitted' ? (a.status === 'submitted' || a.status === 'graded') : a.status === activeTab))
              .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.course.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((assignment) => (
              <div key={assignment.id} className="pt-6 first:pt-0">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
                        ${assignment.status === 'pending' ? 'bg-blue-100 text-blue-800' : 
                          assignment.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 
                          'bg-blue-100 text-blue-800'}`}
                      >
                        {assignment.status}
                      </span>
                      <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{assignment.course}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">{assignment.title}</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">{assignment.description}</p>
                    
                    {assignment.status === 'pending' ? (
                      <div className="space-y-4">
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
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-slate-700">Or attach a file (PDF, DOCX):</label>
                          <input 
                            type="file" 
                            onChange={(e) => setSubmissionFiles({ ...submissionFiles, [assignment.id]: e.target.files[0] })}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assignment.answersText && (
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Submission Text</div>
                            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">{assignment.answersText}</p>
                          </div>
                        )}
                        {assignment.submissionFile && (
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached File</div>
                            <a href={`http://localhost:5000/${assignment.submissionFile}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-50 text-blue-600 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition">
                              <FileText size={16} />
                              View / Download Attached File
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:w-64 bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center text-center h-full space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Submission status</p>
                      <div className="text-3xl font-black text-slate-800">
                        {assignment.status === 'graded' ? (
                          <span className="text-blue-950">{assignment.score}</span>
                        ) : assignment.status === 'submitted' ? (
                          <span className="text-blue-950 text-lg uppercase font-bold">Grading Pending</span>
                        ) : (
                          <span className="text-slate-300">--</span>
                        )}
                      </div>
                    </div>
                    {assignment.status === 'pending' && (
                      <button onClick={() => handleSubmitAssignment(assignment.id)} disabled={submitting} className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-black shadow-[0_4px_20px_-4px_rgba(234,179,8,0.5)] font-bold py-2.5 rounded-xl text-sm transition shadow-md disabled:opacity-50">
                        {submitting ? "Submitting..." : "Submit Assignment"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {assignments
              .filter(a => searchTerm ? true : (activeTab === 'submitted' ? (a.status === 'submitted' || a.status === 'graded') : a.status === activeTab))
              .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.course.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium">No tasks found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAssignments;