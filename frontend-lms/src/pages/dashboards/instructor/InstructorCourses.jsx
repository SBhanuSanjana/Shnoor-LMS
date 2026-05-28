import React,{useState,useEffect}from"react";
import{Plus,Edit2,Trash2,CheckCircle,Clock,Search}from"lucide-react";
import{useNavigate}from"react-router-dom";
function InstructorCourses(){
  const navigate=useNavigate();
  const[searchTerm,setSearchTerm]=useState("");
  const[courses,setCourses]=useState([]);
  const[loading,setLoading]=useState(true);
  const getHeaders=()=>{
    const t=sessionStorage.getItem("access");
    return{
      "Authorization":`Bearer ${t}`,
      "Content-Type":"application/json"
    };
  };
  const loadCourses=async()=>{
    try{
      const res=await fetch("http://127.0.0.1:8000/api/courses/instructor/",{headers:getHeaders()});
      if(res.ok){
        const data=await res.json();
        setCourses(data);
      }
    }catch(e){}finally{
      setLoading(false);
    }
  };
  useEffect(()=>{
    loadCourses();
  },[]);
  const handleDelete=async(id)=>{
    if(!window.confirm("Are you sure you want to delete this course?"))return;
    try{
      const res=await fetch(`http://127.0.0.1:8000/api/courses/${id}/`,{
        method:"DELETE",
        headers:getHeaders()
      });
      if(res.ok){
        alert("Course deleted successfully");
        loadCourses();
      }
    }catch(e){
      alert("Failed to delete course");
    }
  };
  const getStatusBadge=(course)=>{
    const status=course.is_published?"published":(course.is_approved?"draft":"pending");
    switch(status){
      case"published":
        return<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle size={12}/> Published</span>;
      case"pending":
        return<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock size={12}/> Pending Approval</span>;
      case"draft":
        return<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"><Edit2 size={12}/> Draft</span>;
      default:
        return<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };
  const filteredCourses=courses.filter(c=>c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  return(
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
          <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
        </div>
        <button onClick={()=>navigate("/instructor-dashboard/courses/new/build")} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md shadow-blue-600/20">
          <Plus size={18}/>
          Create New Course
        </button>
      </div>
      {loading?(
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ):(
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Course Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Students</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((course)=>(
                <tr key={course.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{course.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Created on {new Date(course.created_at).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(course)}
                    {!course.is_approved&&(
                      <p className="text-[10px] text-amber-600 mt-1 max-w-[120px]">Waiting for admin review</p>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-700">
                    {(course.enrollments_count||0).toLocaleString()}
                  </td>
                  <td className="p-4 pr-6 flex justify-end gap-2">
                    <button onClick={()=>navigate(`/instructor-dashboard/courses/${course.id}/build`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit/Build Course">
                      <Edit2 size={18}/>
                    </button>
                    <button onClick={()=>handleDelete(course.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCourses.length===0&&(
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default InstructorCourses;