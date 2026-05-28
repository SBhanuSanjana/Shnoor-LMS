import React,{useState,useEffect} from 'react';
import {Search,PlayCircle,CheckCircle,Clock,Lock,BookOpen,ChevronRight,Check} from 'lucide-react';

function StudentCourses(){
  const[activeTab,setActiveTab]=useState('enrolled');
  const[enrollments,setEnrollments]=useState([]);
  const[discoverCourses,setDiscoverCourses]=useState([]);
  const[searchTerm,setSearchTerm]=useState('');
  const[loading,setLoading]=useState(true);
  const[activePlayer,setActivePlayer]=useState(null);
  const[activeLesson,setActiveLesson]=useState(null);
  const[activeQuiz,setActiveQuiz]=useState(null);
  const[activeAssessment,setActiveAssessment]=useState(null);
  const[quizAnswers,setQuizAnswers]=useState({});
  const[quizResult,setQuizResult]=useState(null);
  const[assignmentText,setAssignmentText]=useState('');
  const[submitting,setSubmitting]=useState(false);

  const getHeaders=()=>{
    const t=sessionStorage.getItem("access");
    return{
      "Authorization":`Bearer ${t}`,
      "Content-Type":"application/json"
    };
  };

  const loadData=async()=>{
    setLoading(true);
    try{
      const[resEnroll,resCatalog]=await Promise.all([
        fetch("http://127.0.0.1:8000/api/courses/enrollments/",{headers:getHeaders()}),
        fetch("http://127.0.0.1:8000/api/courses/",{headers:getHeaders()})
      ]);
      if(resEnroll.ok){
        const enrollData=await resEnroll.json();
        setEnrollments(enrollData||[]);
        if(activePlayer){
          const updated=enrollData.find(e=>e.id===activePlayer.id);
          if(updated)setActivePlayer(updated);
        }
      }
      if(resCatalog.ok){
        setDiscoverCourses(await resCatalog.json());
      }
    }catch(e){}finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    loadData();
  },[]);

  const handleEnroll=async(courseId)=>{
    try{
      const res=await fetch(`http://127.0.0.1:8000/api/courses/${courseId}/enroll/`,{
        method:"POST",
        headers:getHeaders()
      });
      if(res.ok){
        alert("Enrolled successfully!");
        loadData();
      }else{
        const err=await res.json();
        alert(err.error||"Enrollment failed");
      }
    }catch(e){
      alert("Failed to enroll");
    }
  };

  const handleCompleteLesson=async(lessonId)=>{
    try{
      const res=await fetch(`http://127.0.0.1:8000/api/courses/lessons/${lessonId}/complete/`,{
        method:"POST",
        headers:getHeaders()
      });
      if(res.ok){
        loadData();
      }
    }catch(e){}
  };

  const handleSubmitQuiz=async(quizId)=>{
    setSubmitting(true);
    try{
      const res=await fetch(`http://127.0.0.1:8000/api/courses/quizzes/${quizId}/submit/`,{
        method:"POST",
        headers:getHeaders(),
        body:JSON.stringify({answers:quizAnswers})
      });
      if(res.ok){
        const data=await res.json();
        setQuizResult(data);
        loadData();
      }
    }catch(e){}finally{
      setSubmitting(false);
    }
  };

  const handleRequestCert=async(enrollmentId)=>{
    try{
      const res=await fetch(`http://127.0.0.1:8000/api/courses/enrollments/${enrollmentId}/request-certificate/`,{
        method:"POST",
        headers:getHeaders()
      });
      if(res.ok){
        alert("Certificate requested!");
        loadData();
      }else{
        const err=await res.json();
        alert(err.error||"Requirements not met yet");
      }
    }catch(e){}
  };

  const getMediaUrl=(path)=>{
    if(!path)return "";
    if(path.startsWith("http"))return path;
    return`http://127.0.0.1:8000${path}`;
  };

  const isLessonCompleted=(enrollment,lessonId)=>{
    return enrollment?.lesson_progress?.some(p=>p.lesson===lessonId&&p.is_completed);
  };

  const getQuizStatus=(enrollment,quizId)=>{
    const attempts=enrollment?.quiz_attempts?.filter(a=>a.quiz===quizId);
    if(!attempts||attempts.length===0)return null;
    return{passed:attempts.some(a=>a.passed),score:Math.max(...attempts.map(a=>a.score)),totalQ:attempts[0].total_questions};
  };

  const getProgress=(e)=>{
    let total=0;
    e.course.modules?.forEach(m=>{
      if(m.title!=="Final Quiz")total+=m.lessons?.length||0;
    });
    const completed=e.lesson_progress?.filter(p=>p.is_completed).length||0;
    return{
      pct:total>0?Math.round((completed/total)*100):0,
      total,
      completed
    };
  };

  const checkCertReady=(e)=>{
    let totalL=0;
    e.course.modules?.forEach(m=>{
      if(m.title!=="Final Quiz")totalL+=m.lessons?.length||0;
    });
    const completedL=e.lesson_progress?.filter(p=>p.is_completed).length||0;
    const finalModule=e.course.modules?.find(m=>m.title==="Final Quiz");
    const finalQuiz=finalModule?.quizzes?.[0];
    if(!finalQuiz)return false;
    const passedFinal=e.quiz_attempts?.some(a=>a.quiz===finalQuiz.id&&a.passed);
    return completedL>=totalL&&passedFinal;
  };

  const filteredEnrolled=enrollments.filter(e=>e.course.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDiscover=discoverCourses.filter(c=>c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if(activePlayer){
    const progress=getProgress(activePlayer);
    const readyCert=checkCertReady(activePlayer);
    const finalMod=activePlayer.course.modules?.find(m=>m.title==="Final Quiz");
    return(
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-140px)] -m-2">
        <div className="lg:col-span-4 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800">
          <div className="p-5 border-b border-slate-800">
            <button onClick={()=>{setActivePlayer(null);loadData();}} className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase mb-3 block">
              ← Leave Course
            </button>
            <h3 className="font-extrabold text-base line-clamp-1">{activePlayer.course.title}</h3>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>{progress.pct}% Complete</span>
              <span>{progress.completed}/{progress.total} Lessons</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{width:`${progress.pct}%`}}></div>
            </div>
            {readyCert&&(
              <button 
                onClick={()=>handleRequestCert(activePlayer.id)}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs transition shadow"
              >
                Request Certificate
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activePlayer.course.modules?.filter(m=>m.title!=="Final Quiz").map((m,mIdx)=>(
              <div key={m.id} className="space-y-1.5">
                <h5 className="text-[11px] font-bold text-slate-500 uppercase px-2">Module {mIdx+1}: {m.title}</h5>
                <div className="space-y-1">
                  {m.lessons?.map(l=>{
                    const done=isLessonCompleted(activePlayer,l.id);
                    const active=activeLesson?.id===l.id;
                    return(
                      <button
                        key={l.id}
                        onClick={()=>{setActiveLesson(l);setActiveQuiz(null);setActiveAssessment(null);setQuizResult(null);}}
                        className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-between transition ${active?'bg-blue-600 text-white':'hover:bg-slate-800 text-slate-400'}`}
                      >
                        <span className="truncate pr-2">{l.title}</span>
                        {done&&<Check size={14} className="text-green-400" />}
                      </button>
                    );
                  })}
                  {m.quizzes?.map(q=>{
                    const status=getQuizStatus(activePlayer,q.id);
                    const active=activeQuiz?.id===q.id;
                    return(
                      <button
                        key={q.id}
                        onClick={()=>{setActiveQuiz(q);setActiveLesson(null);setActiveAssessment(null);setQuizAnswers({});setQuizResult(null);}}
                        className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-between transition ${active?'bg-indigo-600 text-white':'hover:bg-slate-800 text-indigo-400'}`}
                      >
                        <span className="truncate pr-2">Quiz: {q.title}</span>
                        {status?.passed&&<Check size={14} className="text-green-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {finalMod&&(
              <div className="border-t border-slate-800 pt-4 space-y-1.5">
                <h5 className="text-[11px] font-bold text-amber-500 uppercase px-2">Final Evaluation</h5>
                <div className="space-y-1">
                  {finalMod.quizzes?.map(q=>{
                    const status=getQuizStatus(activePlayer,q.id);
                    const active=activeQuiz?.id===q.id;
                    return(
                      <button
                        key={q.id}
                        onClick={()=>{setActiveQuiz(q);setActiveLesson(null);setActiveAssessment(null);setQuizAnswers({});setQuizResult(null);}}
                        className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-between transition ${active?'bg-amber-600 text-white':'hover:bg-slate-800 text-amber-400'}`}
                      >
                        <span className="truncate pr-2">🏆 Final Quiz: {q.title}</span>
                        {status?.passed&&<Check size={14} className="text-green-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto p-6 bg-slate-50/50">
          {activeLesson&&(
            <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">{activeLesson.title}</h3>
              {activeLesson.content_type==="video"&&(activeLesson.video_file||activeLesson.video_url)&&(
                <div className="bg-black rounded-xl overflow-hidden aspect-video max-h-[360px] flex items-center justify-center">
                  <video key={activeLesson.id} src={getMediaUrl(activeLesson.video_file||activeLesson.video_url)} controls className="w-full h-full object-contain" />
                </div>
              )}
              {activeLesson.content_type==="audio"&&(activeLesson.audio_file||activeLesson.audio_url)&&(
                <audio key={activeLesson.id} src={getMediaUrl(activeLesson.audio_file||activeLesson.audio_url)} controls className="w-full mt-3" />
              )}
              {activeLesson.content_type==="image"&&(activeLesson.image_file||activeLesson.image_url)&&(
                <div className="rounded-xl overflow-hidden max-h-[480px] flex items-center justify-center bg-slate-100 p-2 border border-slate-200">
                  <img src={getMediaUrl(activeLesson.image_file||activeLesson.image_url)} alt={activeLesson.title} className="max-w-full max-h-[440px] object-contain rounded-lg" />
                </div>
              )}
              {activeLesson.text_content&&<div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">{activeLesson.text_content}</div>}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                {isLessonCompleted(activePlayer,activeLesson.id)?(
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200">Completed ✓</span>
                ):(
                  <button onClick={()=>handleCompleteLesson(activeLesson.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition">
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          )}
          {activeQuiz&&(
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900">{activeQuiz.title}</h3>
              {quizResult?(
                <div className="text-center py-8 space-y-3">
                  <div className="text-4xl">{quizResult.passed?"🎉":"😢"}</div>
                  <h4 className="text-base font-bold text-slate-800">{quizResult.passed?"Quiz Passed!":"Quiz Failed"}</h4>
                  <p className="text-sm text-slate-500">Score: {quizResult.score} / {quizResult.total}</p>
                  <button onClick={()=>{setQuizResult(null);setQuizAnswers({});}} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs">Retake Quiz</button>
                </div>
              ):getQuizStatus(activePlayer,activeQuiz.id)?.passed?(
                <div className="text-center py-8 space-y-3">
                  <span className="text-4xl">🏆</span>
                  <p className="text-sm font-bold text-green-600">You have already passed this quiz!</p>
                  <button onClick={()=>{setQuizAnswers({});}} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs">Retake Quiz</button>
                </div>
              ):(
                <form onSubmit={(e)=>{e.preventDefault();handleSubmitQuiz(activeQuiz.id);}} className="space-y-5">
                  {activeQuiz.questions?.map((q,idx)=>(
                    <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-sm">
                      <div className="font-bold text-slate-800">{idx+1}. {q.text}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['A','B','C','D'].map(k=>{
                          const val=q[`option_${k.toLowerCase()}`];
                          if(!val)return null;
                          const isMult=q.question_type==='multiple';
                          const isSel=isMult?(quizAnswers[q.id]||[]).includes(k):quizAnswers[q.id]===k;
                          return(
                            <label key={k} className={`flex items-center gap-3 p-3 rounded-lg border bg-white cursor-pointer transition ${isSel?'border-blue-500 bg-blue-50/30':'border-slate-200 hover:bg-slate-100'}`}>
                              <input
                                type={isMult?'checkbox':'radio'}
                                name={`q-${q.id}`}
                                checked={isSel}
                                onChange={()=>{
                                  if(isMult){
                                    const curr=quizAnswers[q.id]||[];
                                    setQuizAnswers({...quizAnswers,[q.id]:curr.includes(k)?curr.filter(o=>o!==k):[...curr,k]});
                                  }else{
                                    setQuizAnswers({...quizAnswers,[q.id]:k});
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 border-slate-300 bg-white"
                              />
                              <span className="font-bold">{k}.</span>
                              <span>{val}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-3">
                    <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition disabled:opacity-50">
                      {submitting?'Submitting...':'Submit Quiz'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          {!activeLesson&&!activeQuiz&&(
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-4xl mb-3">📖</div>
              <h4 className="font-bold text-slate-800">Select an item from the syllabus panel to begin!</h4>
              <p className="text-slate-500 text-xs mt-1">Select lessons or quizzes in the sidebar to load their content.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return(
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={()=>setActiveTab('enrolled')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab==='enrolled'?'bg-white text-blue-600 shadow-sm':'text-slate-500 hover:text-slate-700'}`}
          >
            My Learning
          </button>
          <button 
            onClick={()=>setActiveTab('discover')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab==='discover'?'bg-white text-blue-600 shadow-sm':'text-slate-500 hover:text-slate-700'}`}
          >
            Discover Courses
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {loading?(
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ):activeTab==='enrolled'?(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrolled.map(e=>{
            const progress=getProgress(e);
            return(
              <div key={e.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                <div className="h-40 relative overflow-hidden bg-slate-100">
                  {e.course.thumbnail_file||e.course.thumbnail_url?(
                    <img src={getMediaUrl(e.course.thumbnail_file||e.course.thumbnail_url)} alt={e.course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ):(
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold p-4 text-center text-sm">{e.course.title}</div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{e.course.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">By {e.course.instructor?.full_name||e.course.instructor?.email}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                      <span>{progress.pct}% Complete</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full rounded-full bg-blue-600" style={{width:`${progress.pct}%`}}></div>
                    </div>
                    <button 
                      onClick={()=>{
                        setActivePlayer(e);
                        setActiveLesson(null);
                        setActiveQuiz(null);
                        setActiveAssessment(null);
                        setQuizResult(null);
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <PlayCircle size={18} /> Continue Learning
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredEnrolled.length===0&&(
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500">
              No enrolled courses found.
            </div>
          )}
        </div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiscover.map(course=>{
            const isEnrolled=enrollments.some(e=>e.course.id===course.id);
            return(
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                <div className="h-40 relative overflow-hidden bg-slate-100">
                  {course.thumbnail_file||course.thumbnail_url?(
                    <img src={getMediaUrl(course.thumbnail_file||course.thumbnail_url)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ):(
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white font-bold p-4 text-center text-sm">{course.title}</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Free
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">By {course.instructor?.full_name||course.instructor?.email}</p>
                  </div>
                  {isEnrolled?(
                    <span className="w-full text-center bg-green-50 text-green-700 font-bold py-2.5 rounded-xl text-sm border border-green-200">Enrolled</span>
                  ):(
                    <button onClick={()=>handleEnroll(course.id)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-2">
                      Request Enrollment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredDiscover.length===0&&(
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500">
              No discoverable courses found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentCourses;