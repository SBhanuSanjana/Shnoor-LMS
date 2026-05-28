import React,{useState,useEffect} from 'react';
import {Target,BookOpen,ClipboardList,CheckCircle} from 'lucide-react';

function ProgressTracker(){
  const[enrollments,setEnrollments]=useState([]);
  const[requests,setRequests]=useState([]);
  const[loading,setLoading]=useState(true);

  const getHeaders=()=>{
    const t=sessionStorage.getItem("access");
    return{
      "Authorization":`Bearer ${t}`,
      "Content-Type":"application/json"
    };
  };

  useEffect(()=>{
    const fetchProgress=async()=>{
      try{
        const[resEnroll,resCerts]=await Promise.all([
          fetch("http://127.0.0.1:8000/api/courses/enrollments/",{headers:getHeaders()}),
          fetch("http://127.0.0.1:8000/api/courses/certificate-requests/",{headers:getHeaders()})
        ]);
        if(resEnroll.ok)setEnrollments(await resEnroll.json());
        if(resCerts.ok)setRequests(await resCerts.json());
      }catch(e){}finally{
        setLoading(false);
      }
    };
    fetchProgress();
  },[]);

  const getStats=()=>{
    let totalL=0;
    let completedL=0;
    let totalQ=0;
    let passedQ=0;

    enrollments.forEach(e=>{
      e.course.modules?.forEach(m=>{
        if(m.title!=="Final Quiz")totalL+=m.lessons?.length||0;
        totalQ+=m.quizzes?.length||0;
        m.quizzes?.forEach(q=>{
          if(e.quiz_attempts?.some(a=>a.quiz===q.id&&a.passed))passedQ++;
        });
      });
      completedL+=e.lesson_progress?.filter(p=>p.is_completed).length||0;
    });

    return{totalL,completedL,totalQ,passedQ};
  };

  const stats=getStats();
  const approvedCerts=requests.filter(r=>r.status==='approved').length;

  return(
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Learning Progress Tracker</h2>
        <p className="text-slate-500 text-sm mt-1">Detailed audit of your courses, lessons, and certificates</p>
      </div>

      {loading?(
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ):(
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Courses Enrolled</p>
                <h3 className="text-xl font-bold text-slate-800">{enrollments.length}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Lessons Done</p>
                <h3 className="text-xl font-bold text-slate-800">{stats.completedL}/{stats.totalL}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <ClipboardList size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Quizzes Passed</p>
                <h3 className="text-xl font-bold text-slate-800">{stats.passedQ}/{stats.totalQ}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Target size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Certificates Earned</p>
                <h3 className="text-xl font-bold text-slate-800">{approvedCerts}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Course-wise Progression Details</h3>
            <div className="space-y-6">
              {enrollments.map(e=>{
                let totalLessons=0;
                e.course.modules?.forEach(m=>{
                  if(m.title!=="Final Quiz")totalLessons+=m.lessons?.length||0;
                });
                const doneLessons=e.lesson_progress?.filter(p=>p.is_completed).length||0;
                const pct=totalLessons>0?Math.round((doneLessons/totalLessons)*100):0;
                return(
                  <div key={e.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
                      <span>{e.course.title}</span>
                      <span>{pct}% ({doneLessons}/{totalLessons} lessons)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{width:`${pct}%`}}></div>
                    </div>
                  </div>
                );
              })}
              {enrollments.length===0&&(
                <div className="text-center py-6 text-slate-400 font-medium">No progress logs recorded.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProgressTracker;