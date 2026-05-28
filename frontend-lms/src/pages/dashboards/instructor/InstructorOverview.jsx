import React,{useState,useEffect}from"react";
import{BookOpen,Users,Clock,AlertCircle}from"lucide-react";
function InstructorOverview(){
  const[stats,setStats]=useState([
    {label:"Total Courses",value:"0",icon:<BookOpen className="text-blue-500" size={24}/>,bgColor:"bg-blue-50"},
    {label:"Active Students",value:"0",icon:<Users className="text-emerald-500" size={24}/>,bgColor:"bg-emerald-50"},
    {label:"Pending Assignments",value:"0",icon:<Clock className="text-amber-500" size={24}/>,bgColor:"bg-amber-50"},
    {label:"Unread Messages",value:"0",icon:<AlertCircle className="text-purple-500" size={24}/>,bgColor:"bg-purple-50"},
  ]);
  const[loading,setLoading]=useState(true);
  const getHeaders=()=>{
    const t=sessionStorage.getItem("access");
    return{
      "Authorization":`Bearer ${t}`,
      "Content-Type":"application/json"
    };
  };
  useEffect(()=>{
    const loadOverview=async()=>{
      try{
        const[resCourses,resSubmissions]=await Promise.all([
          fetch("http://127.0.0.1:8000/api/courses/instructor/",{headers:getHeaders()}),
          fetch("http://127.0.0.1:8000/api/courses/submissions/",{headers:getHeaders()})
        ]);
        let coursesList=[];
        let subsList=[];
        if(resCourses.ok)coursesList=await resCourses.json();
        if(resSubmissions.ok)subsList=await resSubmissions.json();
        const totalCourses=coursesList.length;
        const activeStudents=coursesList.reduce((acc,c)=>acc+(c.enrollments_count||0),0);
        const pendingSubmissions=subsList.filter(s=>!s.is_graded).length;
        setStats([
          {label:"Total Courses",value:totalCourses.toString(),icon:<BookOpen className="text-blue-500" size={24}/>,bgColor:"bg-blue-50"},
          {label:"Active Students",value:activeStudents.toString(),icon:<Users className="text-emerald-500" size={24}/>,bgColor:"bg-emerald-50"},
          {label:"Pending Assignments",value:pendingSubmissions.toString(),icon:<Clock className="text-amber-500" size={24}/>,bgColor:"bg-amber-50"},
          {label:"Unread Messages",value:"0",icon:<AlertCircle className="text-purple-500" size={24}/>,bgColor:"bg-purple-50"},
        ]);
      }catch(e){}finally{
        setLoading(false);
      }
    };
    loadOverview();
  },[]);
  return(
    <div className="space-y-6">
      {loading?(
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ):(
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat,idx)=>(
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`p-4 rounded-xl ${stat.bgColor}`}>{stat.icon}</div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Enrollment Trends</h3>
              </div>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Chart visualization will be implemented here</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Upcoming Live Classes</h3>
              </div>
              <div className="text-center py-8 text-slate-400 text-sm font-medium">No workshops scheduled for this week.</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default InstructorOverview;