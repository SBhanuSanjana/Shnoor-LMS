import React,{useState,useEffect} from 'react';
import {FileText,Plus,Search,CheckCircle,Clock,X} from 'lucide-react';
import api from '../../../api';

function InstructorAssignments(){
  const[submissions,setSubmissions]=useState([]);
  const[courses,setCourses]=useState([]);
  const[loading,setLoading]=useState(true);
  const[activeTab,setActiveTab]=useState('all');
  const[showCreateModal,setShowCreateModal]=useState(false);
  const[selectedSubmission,setSelectedSubmission]=useState(null);
  const[showGradeModal,setShowGradeModal]=useState(false);
  const[gradeInput,setGradeInput]=useState('');
  const[search,setSearch]=useState('');
  const[newTitle,setNewTitle]=useState('');
  const[newCourseId,setNewCourseId]=useState('');
  const[newDesc,setNewDesc]=useState('');



  const fetchSubmissions=async()=>{
    try{
      const res=await api.get(`/api/courses/instructor/submissions`);
      if((res.status >= 200 && res.status < 300)){
        const data=res.data;
        setSubmissions(data);
      }
    }catch(e){}finally{
      setLoading(false);
    }
  };

  const fetchCourses=async()=>{
    try{
      const res=await api.get(`/api/courses/instructor/my-courses`);
      if((res.status >= 200 && res.status < 300)){
        const data=res.data;
        setCourses(data);
      }
    }catch(e){}
  };

  useEffect(()=>{
    fetchSubmissions();
    fetchCourses();
  },[]);

  const handleOpenGradeModal=(sub)=>{
    setSelectedSubmission(sub);
    setGradeInput(sub.grade||'');
    setShowGradeModal(true);
  };

  const handleGradeSubmit=async(e)=>{
    e.preventDefault();
    if(!gradeInput.trim()||!selectedSubmission)return;
    try{
      const res=await api.post(`/api/courses/instructor/submissions${selectedSubmission.id}/grade/`, {grade:gradeInput});
      if((res.status >= 200 && res.status < 300)){
        alert("Submission graded successfully");
        setShowGradeModal(false);
        fetchSubmissions();
      }else{
        alert("Failed to submit grade");
      }
    }catch(e){
      alert("Failed to submit grade");
    }
  };

  const handlePublishAssignment=async(e)=>{
    e.preventDefault();
    if(!newTitle.trim()||!newCourseId||!newDesc.trim())return;
    try{
      const res=await api.post(`/api/courses/${newCourseId}/assessments`, {title:newTitle,description:newDesc});
      if((res.status >= 200 && res.status < 300)){
        alert("Assignment created successfully");
        setShowCreateModal(false);
        setNewTitle('');
        setNewCourseId('');
        setNewDesc('');
        fetchSubmissions();
      }else{
        alert("Failed to create assignment");
      }
    }catch(e){
      alert("Failed to create assignment");
    }
  };

  const totalSubmissions=submissions.length;
  const toGrade=submissions.filter(s=>!s.is_graded).length;
  const graded=submissions.filter(s=>s.is_graded).length;

  const filteredSubmissions=submissions.filter(s=>{
    if(activeTab==='active')return !s.is_graded;
    if(activeTab==='completed')return s.is_graded;
    return true;
  });

  const searchedSubmissions=filteredSubmissions.filter(s=>
    (s.student_name||'').toLowerCase().includes(search.toLowerCase())||
    (s.course_title||'').toLowerCase().includes(search.toLowerCase())||
    (s.assessment_title||'').toLowerCase().includes(search.toLowerCase())
  );

  return(
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assignments & Submissions</h2>
          <p className="text-slate-500 text-sm mt-1">Review student submissions and publish new course assessments</p>
        </div>
        <button 
          onClick={()=>setShowCreateModal(true)}
          className="bg-blue-950 hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Submissions</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalSubmissions}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">To Grade</p>
            <h3 className="text-2xl font-bold text-slate-800">{toGrade}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Graded</p>
            <h3 className="text-2xl font-bold text-slate-800">{graded}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-full sm:w-auto">
            {['all','active','completed'].map(tab=>(
              <button 
                key={tab}
                onClick={()=>setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all flex-1 sm:flex-none ${activeTab===tab?'bg-blue-50 text-blue-950 shadow-sm':'text-slate-500 hover:text-slate-700'}`}
              >
                {tab==='active'?'pending':tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search submissions..." 
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white"
              />
            </div>
          </div>
        </div>

        {loading?(
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ):(
          <div className="divide-y divide-slate-100">
            {searchedSubmissions.map((submission)=>(
              <div key={submission.id} className="p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${!submission.is_graded?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-800'}`}>
                        {!submission.is_graded?'pending':'graded'}
                      </span>
                      <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{submission.course_title}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">{submission.assessment_title}</h4>
                    <p className="text-sm text-slate-500 mb-2">
                      Submitted by: <span className="font-semibold text-slate-700">{submission.student_name}</span> ({submission.student_email})
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> Submitted: {new Date(submission.created_at).toLocaleDateString()}</span>
                      {submission.is_graded&&<span className="flex items-center gap-1.5"><FileText size={14} /> Grade: {submission.grade}</span>}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={()=>handleOpenGradeModal(submission)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle size={16} />
                      {!submission.is_graded?'Grade Submission':'View / Edit Grade'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {searchedSubmissions.length===0&&(
              <div className="p-8 text-center text-slate-500">No submissions found.</div>
            )}
          </div>
        )}
      </div>

      {showGradeModal&&selectedSubmission&&(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Grade Assignment Submission</h3>
              <button onClick={()=>setShowGradeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGradeSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Assessment</p>
                <p className="text-sm font-bold text-slate-800">{selectedSubmission.assessment_title}</p>
                <p className="text-xs text-slate-500 mt-0.5">Course: {selectedSubmission.course_title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Student Details</p>
                <p className="text-sm font-bold text-slate-800">{selectedSubmission.student_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Email: {selectedSubmission.student_email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1.5">Submitted Answers / Text</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto font-mono text-sm whitespace-pre-wrap text-slate-700">
                  {selectedSubmission.answers_text}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Grade / Score</label>
                <input 
                  type="text" 
                  value={gradeInput}
                  onChange={(e)=>setGradeInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none bg-white" 
                  placeholder="e.g. A+, 95/100, Passed"
                  required
                />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={()=>setShowGradeModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl font-bold transition-colors shadow-md">Submit Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal&&(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Create New Assignment</h3>
              <button onClick={()=>setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePublishAssignment} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Assignment Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e)=>setNewTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none bg-white" 
                    placeholder="e.g. Midterm Project" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Course</label>
                  <select 
                    value={newCourseId}
                    onChange={(e)=>setNewCourseId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none bg-white"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course=>(
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Instructions / Description</label>
                <textarea 
                  rows="4" 
                  value={newDesc}
                  onChange={(e)=>setNewDesc(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none bg-white" 
                  placeholder="Provide detailed instructions..." 
                  required
                ></textarea>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={()=>setShowCreateModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl font-bold transition-colors shadow-md">Publish Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorAssignments;