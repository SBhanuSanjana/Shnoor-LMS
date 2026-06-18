import React,{useState,useEffect}from"react";
import api from '../../../api';
import{useParams,useNavigate}from"react-router-dom";
import{ArrowLeft,Plus,Video,FileText,File,Save,Send,Trash,Image,Music,X}from"lucide-react";
function CourseBuilder(){
  const{courseId}=useParams();
  const navigate=useNavigate();
  const[step,setStep]=useState(1);
  const[course,setCourse]=useState(null);
  const[modules,setModules]=useState([]);
  const[title,setTitle]=useState('');
  const[desc,setDesc]=useState('');
  const[thumbUrl,setThumbUrl]=useState('');
  const[thumbFile,setThumbFile]=useState(null);
  const[loading,setLoading]=useState(true);
  const[showModModal,setShowModModal]=useState(false);
  const[modTitle,setModTitle]=useState('');
  const[showLesModal,setShowLesModal]=useState(false);
  const[selectedModId,setSelectedModId]=useState(null);
  const[lesTitle,setLesTitle]=useState('');
  const[lesType,setLesType]=useState('text');
  const[lesText,setLesText]=useState('');
  const[lesUrl,setLesUrl]=useState('');
  const[lesFile,setLesFile]=useState(null);
  const[lesVttFile,setLesVttFile]=useState(null);
  const[showQuizModal,setShowQuizModal]=useState(false);
  const[quizTitle,setQuizTitle]=useState('');
  const[passingScore,setPassingScore]=useState(60);
  const[showQuesModal,setShowQuesModal]=useState(false);
  const[selectedQuizId,setSelectedQuizId]=useState(null);
  const[qText,setQText]=useState('');
  const[qType,setQType]=useState('single');
  const[optA,setOptA]=useState('');
  const[optB,setOptB]=useState('');
  const[optC,setOptC]=useState('');
  const[optD,setOptD]=useState('');
  const[correct,setCorrect]=useState('');

  const loadCourse=async()=>{
    if(courseId==='new'){
      setLoading(false);
      return;
    }
    try{
      const res=await api.get(`/api/courses/${courseId}`);
      if((res.status >= 200 && res.status < 300)){
        const data=res.data;
        setCourse(data);
        setTitle(data.title||'');
        setDesc(data.description||'');
        setThumbUrl(data.thumbnail_url||'');
        setModules(data.modules||[]);
      }
    }catch(e){}finally{
      setLoading(false);
    }
  };
  useEffect(()=>{
    loadCourse();
  },[courseId]);
  const handleSaveStep1=async(e)=>{
    e.preventDefault();
    if(!title.trim()||!desc.trim()){
      alert("Title and description are required");
      return;
    }
    const formData=new FormData();
    formData.append("title",title);
    formData.append("description",desc);
    if(thumbUrl)formData.append("thumbnail_url",thumbUrl);
    if(thumbFile)formData.append("thumbnail_file",thumbFile);
    try{
      if(courseId==='new'){
        const res=await api.post(`/api/courses/`, formData);
        if((res.status >= 200 && res.status < 300)){
          const data=res.data;
          alert("Course details saved!");
          navigate(`/instructor-dashboard/courses/${data.id}/build`);
          setStep(2);
        }else{
          alert("Failed to save details");
        }
      }else{
        const res=await api.put(`/api/courses/${courseId}`, formData);
        if((res.status >= 200 && res.status < 300)){
          alert("Course details updated!");
          await loadCourse();
          setStep(2);
        }else{
          alert("Failed to save details");
        }
      }
    }catch(e){
      alert("Failed to save details");
    }
  };
  const handleAddModule=async(e)=>{
    e.preventDefault();
    if(!modTitle.trim())return;
    try{
      const res=await api.post(`/api/courses/${courseId}/modules`, {title:modTitle,order:modules.length});
      if((res.status >= 200 && res.status < 300)){
        setModTitle('');
        setShowModModal(false);
        loadCourse();
      }
    }catch(e){}
  };
  const calculateDuration = (type, text, file, url) => {
    return new Promise((resolve) => {
      if (type === 'text') {
        const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const seconds = Math.ceil((wordCount / 200) * 60);
        resolve(seconds || 10);
      } else if (type === 'image') {
        resolve(10);
      } else if (type === 'document') {
        resolve(60);
      } else if (type === 'video' || type === 'audio') {
        if (!file && !url) return resolve(0);
        
        const media = type === 'video' ? document.createElement('video') : document.createElement('audio');
        media.preload = 'metadata';
        
        media.onloadedmetadata = () => {
          resolve(Math.floor(media.duration) || 0);
          if(file) URL.revokeObjectURL(media.src);
        };
        
        media.onerror = () => {
          resolve(0);
          if(file) URL.revokeObjectURL(media.src);
        };

        if (file) {
          media.src = URL.createObjectURL(file);
        } else if (url) {
          media.src = url;
        }
      } else {
        resolve(0);
      }
    });
  };

  const handleAddLesson=async(e)=>{
    e.preventDefault();
    if(!lesTitle.trim())return;

    const autoDuration = await calculateDuration(lesType, lesText, lesFile, lesUrl);

    const formData=new FormData();
    formData.append("title",lesTitle);
    formData.append("content_type",lesType);
    formData.append("order","0");
    if(lesType==='text'){
      formData.append("text_content",lesText);
    }else if(lesType==='video'){
      if(lesFile)formData.append("video_file",lesFile);
      else if(lesUrl)formData.append("video_url",lesUrl);
    }else if(lesType==='audio'){
      if(lesFile)formData.append("audio_file",lesFile);
      else if(lesUrl)formData.append("audio_url",lesUrl);
    }else if(lesType==='image'){
      if(lesFile)formData.append("image_file",lesFile);
      else if(lesUrl)formData.append("image_url",lesUrl);
    }else if(lesType==='document'){
      if(lesFile)formData.append("document_file",lesFile);
      else if(lesUrl)formData.append("document_url",lesUrl);
    }
    if(autoDuration) {
      formData.append("duration", autoDuration);
    }
    if(lesVttFile) {
      formData.append("vtt_file", lesVttFile);
    }
    try{
      const res=await api.post(`/api/courses/modules/${selectedModId}/lessons`, formData);
      if((res.status >= 200 && res.status < 300)){
        setLesTitle('');
        setLesText('');
        setLesUrl('');
        setLesFile(null);
        setLesVttFile(null);
        setShowLesModal(false);
        loadCourse();
      }
    }catch(e){}
  };
  const handleAddQuiz=async(e)=>{
    e.preventDefault();
    if(!quizTitle.trim())return;
    try{
      const res=await api.post(`/api/courses/modules/${selectedModId}/quizzes`, {title:quizTitle,passing_score:passingScore});
      if((res.status >= 200 && res.status < 300)){
        setQuizTitle('');
        setPassingScore(60);
        setShowQuizModal(false);
        loadCourse();
      }
    }catch(e){}
  };
  const handleUpdateQuizScore=async(quizId,score)=>{
    try{
      const res=await api.put(`/api/courses/quizzes/${quizId}`, {passing_score:score});
      if((res.status >= 200 && res.status < 300)){
        loadCourse();
      }
    }catch(e){}
  };
  const handleAddQuestion=async(e)=>{
    e.preventDefault();
    if(!qText.trim()||!optA||!optB||!correct)return;
    try{
      const res=await api.post(`/api/courses/quizzes/${selectedQuizId}/questions`, {
        text:qText,
        question_type:qType,
        option_a:optA,
        option_b:optB,
        option_c:optC,
        option_d:optD,
        correct_answers:correct
      });
      if((res.status >= 200 && res.status < 300)){
        setQText('');
        setQType('single');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setCorrect('');
        setShowQuesModal(false);
        loadCourse();
      }
    }catch(e){}
  };
  const handleCreateFinalQuiz=async()=>{
    try{
      let modId;
      const resMod=await api.post(`/api/courses/${courseId}/modules`, {title:"Final Quiz",order:9999});
      if((resMod.status >= 200 && resMod.status < 300)){
        const modData=resMod.data;
        modId=modData.id;
      }else{
        return;
      }
      const resQuiz=await api.post(`/api/courses/modules/${modId}/quizzes`, {title:"Final Quiz",passing_score:60});
      if((resQuiz.status >= 200 && resQuiz.status < 300)){
        alert("Final Quiz created! Now add questions.");
        loadCourse();
      }
    }catch(e){}
  };
  const handleSubmitForApproval=async()=>{
    try{
      const res=await api.put(`/api/courses/${courseId}`, {is_published:true});
      if((res.status >= 200 && res.status < 300)){
        alert("Course submitted for admin approval!");
        navigate('/instructor-dashboard/courses');
      }else{
        alert("Failed to submit course");
      }
    }catch(e){
      alert("Failed to submit course");
    }
  };
  const regularModules=modules.filter(m=>m.title!=="Final Quiz");
  const finalModule=modules.find(m=>m.title==="Final Quiz");
  const finalQuiz=finalModule?.quizzes?.[0];
  const handleMoveModule=async(index,direction)=>{
    const newModules=[...regularModules];
    if(direction==='up'&&index>0){
      const temp=newModules[index];
      newModules[index]=newModules[index-1];
      newModules[index-1]=temp;
    }else if(direction==='down'&&index<newModules.length-1){
      const temp=newModules[index];
      newModules[index]=newModules[index+1];
      newModules[index+1]=temp;
    }else{
      return;
    }
    const updated=newModules.map((m,idx)=>({...m,order:idx}));
    setModules([...updated,...modules.filter(m=>m.title==="Final Quiz").map(m=>({...m,order:9999}))]);
    try{
      await api.put(`/api/courses/${courseId}/modules/reorder`, {modules:updated.map(m=>({id:m.id,order:m.order}))});
      await loadCourse();
    }catch(e){}
  };
  if(loading){
    return(
      <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950"></div>
      </div>
    );
  }
  return(
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate("/instructor-dashboard/courses")} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><ArrowLeft size={20}/></button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{courseId==='new'?'Create New Course':'Build Your Course'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Define metadata, upload contents, organize modules, configure final evaluation.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${course?.is_approved?'bg-green-100 text-green-700':course?.is_published?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>
            {course?.is_approved?'Approved ✓':course?.is_published?'Pending Admin Review':'Draft'}
          </span>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 p-4 flex gap-4 text-xs font-bold text-slate-400">
          <span className={`pb-2 transition-all ${step===1?'border-b-2 border-blue-950 text-blue-950':'text-slate-400'}`}>1. General Info</span>
          <span className={`pb-2 transition-all ${step===2?'border-b-2 border-blue-950 text-blue-950':'text-slate-400'}`}>2. Modules & Materials</span>
          <span className={`pb-2 transition-all ${step===3?'border-b-2 border-blue-950 text-blue-950':'text-slate-400'}`}>3. Final Evaluation</span>
        </div>
        <div className="p-6">
          {step===1&&(
            <form onSubmit={handleSaveStep1} className="space-y-5 text-sm font-medium">
              <div>
                <label className="block text-slate-700 mb-1.5 font-semibold">Course Title</label>
                <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="e.g. Introduction to Python Programming" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white"/>
              </div>
              <div>
                <label className="block text-slate-700 mb-1.5 font-semibold">Course Description</label>
                <textarea rows="4" value={desc} onChange={(e)=>setDesc(e.target.value)} required placeholder="Describe course details, objectives, requirements..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white"/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-semibold">Upload Course Thumbnail File</label>
                  <input type="file" onChange={(e)=>setThumbFile(e.target.files[0])} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold bg-white"/>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-semibold">OR Thumbnail Image URL</label>
                  <input type="text" value={thumbUrl} onChange={(e)=>setThumbUrl(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white" placeholder="https://..."/>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-yellow-500 text-blue-950 font-black font-bold rounded-xl text-sm hover:bg-blue-700 transition flex items-center gap-1.5 shadow">Save & Continue to Step 2</button>
              </div>
            </form>
          )}
          {step===2&&(
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Step 2: Course Content & Modules</h3>
                <button onClick={()=>setShowModModal(true)} className="bg-yellow-500 text-blue-950 font-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shadow"><Plus size={16}/> Add Module</button>
              </div>
              <div className="space-y-4">
                {regularModules.map((mod,index)=>(
                  <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-slate-800">Module {index+1}: {mod.title}</h4>
                        <div className="flex gap-1.5">
                          {index>0&&(
                            <button type="button" onClick={()=>handleMoveModule(index,'up')} className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded font-bold">▲ Up</button>
                          )}
                          {index<regularModules.length-1&&(
                            <button type="button" onClick={()=>handleMoveModule(index,'down')} className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded font-bold">▼ Down</button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>{setSelectedModId(mod.id);setShowQuizModal(true);}} className="text-xs text-indigo-600 font-semibold hover:underline">Add Quiz</button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {mod.lessons?.map(lesson=>(
                        <div key={lesson.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/30">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-950 rounded-lg">
                              {lesson.content_type==='video'?<Video size={18}/>:lesson.content_type==='audio'?<Music size={18}/>:lesson.content_type==='image'?<Image size={18}/>:lesson.content_type==='document'?<File size={18}/>:<FileText size={18}/>}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{lesson.title}</p>
                              <p className="text-xs text-slate-500 uppercase">{lesson.content_type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {mod.quizzes?.map(quiz=>(
                        <div key={quiz.id} className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-indigo-900">Quiz: {quiz.title}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-medium">Pass Score:</span>
                              <input type="number" min="0" max="100" value={quiz.passing_score||60} onChange={async(e)=>{const val=parseInt(e.target.value)||60;await handleUpdateQuizScore(quiz.id,val);}} className="w-12 p-0.5 border rounded text-xs text-center bg-white font-bold text-indigo-700"/>
                              <span className="text-xs text-slate-500 font-medium">%</span>
                            </div>
                            <button onClick={()=>{setSelectedQuizId(quiz.id);setShowQuesModal(true);}} className="text-xs text-indigo-600 font-semibold hover:underline">+ Add MCQ Question</button>
                          </div>
                          <div className="space-y-1.5">
                            {quiz.questions?.map((q,qIdx)=>(
                              <div key={q.id} className="text-xs text-slate-600 pl-3">{qIdx+1}. {q.text}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button onClick={()=>{setSelectedModId(mod.id);setShowLesModal(true);}} className="w-full py-3 mt-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold text-sm hover:border-blue-300 hover:text-blue-950 transition-colors flex items-center justify-center gap-2">
                        <Plus size={16}/> Add Lesson / Material
                      </button>
                    </div>
                  </div>
                ))}
                {regularModules.length===0&&(
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500">No modules added yet. Add a module to start building course materials.</div>
                )}
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button onClick={()=>setStep(1)} className="px-6 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition">Back to Step 1</button>
                <button onClick={()=>setStep(3)} className="px-6 py-2.5 bg-yellow-500 text-blue-950 font-black font-bold rounded-xl text-sm hover:bg-blue-700 transition">Continue to Step 3</button>
              </div>
            </div>
          )}
          {step===3&&(
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Step 3: Final Quiz Configuration</h3>
                {finalQuiz ? (
                  <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-bold text-indigo-900">Final Quiz: {finalQuiz.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Passing Score Required:</span>
                        <input type="number" min="0" max="100" value={finalQuiz.passing_score||60} onChange={async(e)=>{const val=parseInt(e.target.value)||60;await handleUpdateQuizScore(finalQuiz.id,val);}} className="w-12 p-0.5 border rounded text-xs text-center bg-white font-bold text-indigo-700"/>
                        <span className="text-xs text-slate-500 font-medium">%</span>
                      </div>
                      <button onClick={()=>{setSelectedQuizId(finalQuiz.id);setShowQuesModal(true);}} className="text-xs text-indigo-600 font-semibold hover:underline">+ Add MCQ Question</button>
                    </div>
                    <div className="space-y-1.5">
                      {finalQuiz.questions?.map((q,qIdx)=>(
                        <div key={q.id} className="text-xs text-slate-600 pl-3">{qIdx+1}. {q.text}</div>
                      ))}
                      {(!finalQuiz.questions || finalQuiz.questions.length === 0) && (
                        <div className="text-xs text-slate-400 italic">No questions added yet. Click "+ Add MCQ Question" to add questions.</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                    <p className="text-slate-500 text-sm">No final quiz configured. Students must pass the final quiz to request certificates.</p>
                    <button type="button" onClick={handleCreateFinalQuiz} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow">Configure Final Quiz</button>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button onClick={()=>setStep(2)} className="px-6 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition">Back to Step 2</button>
                <button onClick={handleSubmitForApproval} disabled={!finalQuiz} className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition flex items-center gap-1.5 shadow disabled:opacity-50"><Send size={16}/> Submit Course for Approval</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showModModal&&(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddModule} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Module</h3>
              <button type="button" onClick={()=>setShowModModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <input type="text" value={modTitle} onChange={(e)=>setModTitle(e.target.value)} required placeholder="Module Title" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium bg-slate-50"/>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setShowModModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-yellow-500 text-blue-950 font-black text-xs font-bold rounded-xl hover:bg-blue-700">Add Module</button>
            </div>
          </form>
        </div>
      )}
      {showLesModal&&(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddLesson} className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Lesson</h3>
              <button type="button" onClick={()=>setShowLesModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <input type="text" value={lesTitle} onChange={(e)=>setLesTitle(e.target.value)} required placeholder="Lesson Title" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white"/>
            <select value={lesType} onChange={(e)=>setLesType(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white">
              <option value="text">Text Lesson</option>
              <option value="video">Video Lesson</option>
              <option value="audio">Audio Lesson</option>
              <option value="image">Image Lesson</option>
              <option value="document">Document Lesson (PDF, PPT)</option>
            </select>
            {lesType==="text"&&(
              <textarea rows="5" value={lesText} onChange={(e)=>setLesText(e.target.value)} required placeholder="Enter lesson content text..." className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white" />
            )}
            {lesType==="video"&&(
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Video File (.mp4, .mkv, etc.)</label>
                  <input type="file" accept="video/*" onChange={(e)=>setLesFile(e.target.files[0])} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">OR Enter Video URL</label>
                  <input type="text" value={lesUrl} onChange={(e)=>setLesUrl(e.target.value)} placeholder="https://..." className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white"/>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Subtitles (.vtt file, optional)</label>
                  <input type="file" accept=".vtt" onChange={(e)=>setLesVttFile(e.target.files[0])} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"/>
                </div>
              </div>
            )}
            {lesType==="audio"&&(
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Audio File (.mp3, .wav, etc.)</label>
                  <input type="file" accept="audio/*" onChange={(e)=>setLesFile(e.target.files[0])} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">OR Enter Audio URL</label>
                  <input type="text" value={lesUrl} onChange={(e)=>setLesUrl(e.target.value)} placeholder="https://..." className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white"/>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Subtitles (.vtt file, optional)</label>
                  <input type="file" accept=".vtt" onChange={(e)=>setLesVttFile(e.target.files[0])} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"/>
                </div>
              </div>
            )}
            {lesType==="image"&&(
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Image File (.png, .jpeg, etc.)</label>
                  <input type="file" accept="image/*" onChange={(e)=>setLesFile(e.target.files[0])} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">OR Enter Image URL</label>
                  <input type="text" value={lesUrl} onChange={(e)=>setLesUrl(e.target.value)} placeholder="https://..." className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white"/>
                </div>
              </div>
            )}
            {lesType==="document"&&(
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Document File (.pdf, .ppt, .pptx)</label>
                  <input type="file" accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={(e)=>setLesFile(e.target.files[0])} className="w-full p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">OR Enter Document URL</label>
                  <input type="text" value={lesUrl} onChange={(e)=>setLesUrl(e.target.value)} placeholder="https://..." className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white"/>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setShowLesModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-yellow-500 text-blue-950 font-black text-xs font-bold rounded-xl hover:bg-blue-700">Add Lesson</button>
            </div>
          </form>
        </div>
      )}
      {showQuizModal&&(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddQuiz} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Quiz</h3>
              <button type="button" onClick={()=>setShowQuizModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <input type="text" value={quizTitle} onChange={(e)=>setQuizTitle(e.target.value)} required placeholder="Quiz Title" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm font-medium bg-slate-50"/>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Passing Percentage (0-100)</label>
              <input type="number" min="0" max="100" value={passingScore} onChange={(e)=>setPassingScore(parseInt(e.target.value)||60)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none text-sm font-medium bg-slate-50"/>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setShowQuizModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-yellow-500 text-blue-950 font-black text-xs font-bold rounded-xl hover:bg-blue-700">Add Quiz</button>
            </div>
          </form>
        </div>
      )}
      {showQuesModal&&(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddQuestion} className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add MCQ Question</h3>
              <button type="button" onClick={()=>setShowQuesModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <input type="text" value={qText} onChange={(e)=>setQText(e.target.value)} required placeholder="Question Text" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white"/>
            <select value={qType} onChange={(e)=>{setQType(e.target.value);setCorrect('');}} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white">
              <option value="single">Single Choice (One correct answer)</option>
              <option value="multiple">Multiple Choice (Multiple correct answers)</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={optA} onChange={(e)=>setOptA(e.target.value)} required placeholder="Option A" className="p-2 border border-slate-200 rounded-xl outline-none bg-white"/>
              <input type="text" value={optB} onChange={(e)=>setOptB(e.target.value)} required placeholder="Option B" className="p-2 border border-slate-200 rounded-xl outline-none bg-white"/>
              <input type="text" value={optC} onChange={(e)=>setOptC(e.target.value)} placeholder="Option C" className="p-2 border border-slate-200 rounded-xl outline-none bg-white"/>
              <input type="text" value={optD} onChange={(e)=>setOptD(e.target.value)} placeholder="Option D" className="p-2 border border-slate-200 rounded-xl outline-none bg-white"/>
            </div>
            {qType==="single"?(
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Correct Answer Option</label>
                <select value={correct} onChange={(e)=>setCorrect(e.target.value)} required className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white">
                  <option value="">Select Correct Option</option>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            ):(
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Correct Answers (Check all that apply)</label>
                <div className="flex gap-4 p-2.5 border border-slate-200 rounded-xl bg-white">
                  {['A','B','C','D'].map(k=>{
                    const selected=correct.split(',').map(s=>s.trim()).includes(k);
                    return(
                      <label key={k} className="flex items-center gap-2 font-bold cursor-pointer text-xs">
                        <input type="checkbox" checked={selected} onChange={()=>{const parts=correct?correct.split(',').map(s=>s.trim()).filter(Boolean):[];const newParts=parts.includes(k)?parts.filter(o=>o!==k):[...parts,k];setCorrect(newParts.sort().join(','));}} className="h-4 w-4"/>
                        {k}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setShowQuesModal(false)} className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-yellow-500 text-blue-950 font-black text-xs font-bold rounded-xl hover:bg-blue-700">Add Question</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export default CourseBuilder;