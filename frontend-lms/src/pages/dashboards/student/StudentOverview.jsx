import { useState, useEffect } from 'react';
import { PlayCircle, Award, Target, Flame, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StudentOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ quizzesPassed: 0, totalQuizzes: 0, certsCount: 0 });
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const t = sessionStorage.getItem("access");
    return {
      "Authorization": `Bearer ${t}`,
      "Content-Type": "application/json"
    };
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [resEnroll, resCerts] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/courses/enrollments/", { headers: getHeaders() }),
          fetch("http://127.0.0.1:8000/api/courses/certificate-requests/", { headers: getHeaders() })
        ]);
        let enrolls = [];
        let certs = [];
        if (resEnroll.ok) enrolls = await resEnroll.json();
        if (resCerts.ok) certs = await resCerts.json();

        let totalQuizzes = 0;
        let quizzesPassed = 0;
        enrolls.forEach(e => {
          e.course.modules?.forEach(m => {
            totalQuizzes += m.quizzes?.length || 0;
            m.quizzes?.forEach(q => {
              if (e.quiz_attempts?.some(a => a.quiz === q.id && a.passed)) {
                quizzesPassed++;
              }
            });
          });
        });

        const approvedCerts = certs.filter(r => r.status === "approved").length;
        setStats({ quizzesPassed, totalQuizzes, certsCount: approvedCerts });

        const active = enrolls.find(e => {
          let courseLessons = 0;
          e.course.modules?.forEach(m => { courseLessons += m.lessons?.length || 0; });
          const completed = e.lesson_progress?.filter(p => p.is_completed).length || 0;
          return courseLessons > 0 && completed < courseLessons;
        }) || enrolls[0];

        if (active) {
          let courseLessons = 0;
          active.course.modules?.forEach(m => { courseLessons += m.lessons?.length || 0; });
          const completed = active.lesson_progress?.filter(p => p.is_completed).length || 0;
          const pct = courseLessons > 0 ? Math.round((completed / courseLessons) * 100) : 0;
          setActiveCourse({
            id: active.id,
            title: active.course.title,
            progress: pct,
            image: active.course.thumbnail_file || active.course.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            instructor: active.course.instructor?.full_name || active.course.instructor?.email
          });
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const username = sessionStorage.getItem("username") || "Learner";

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-lg shadow-blue-900/20">
        <div className="mb-6 md:mb-0">
          <h2 className="text-3xl font-extrabold mb-2">Welcome back, {username}! 👋</h2>
          {activeCourse ? (
            <p className="text-blue-100 max-w-md text-sm leading-relaxed">
              You are {activeCourse.progress}% through your {activeCourse.title} course. Keep up the great work!
            </p>
          ) : (
            <p className="text-blue-100 max-w-md text-sm leading-relaxed">
              You don't have any active learning courses. Explore the catalog and request enrollment!
            </p>
          )}
        </div>
        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 text-center min-w-[150px]">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xl mb-1">
            <Flame size={24} className="fill-amber-300" />
            1 Day
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white">Learning Streak</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeCourse && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Continue Learning</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div 
                    onClick={() => navigate('/student-dashboard/courses')}
                    className="w-full sm:w-1/3 h-32 bg-slate-200 rounded-xl relative overflow-hidden group cursor-pointer"
                  >
                    <img src={activeCourse.image} alt="Course Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle size={48} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs font-bold text-blue-600 mb-1">IN PROGRESS</p>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{activeCourse.title}</h4>
                    <p className="text-sm text-slate-500 mb-4">By {activeCourse.instructor}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${activeCourse.progress}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{activeCourse.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Target size={28} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Quizzes Passed</p>
                  <h4 className="text-2xl font-bold text-slate-900">{stats.quizzesPassed}/{stats.totalQuizzes}</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                  <Award size={28} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Certificates Earned</p>
                  <h4 className="text-2xl font-bold text-slate-900">{stats.certsCount}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Live Workshops</h3>
              </div>
              <div className="text-center py-8 text-slate-400 text-sm font-medium">
                No workshops scheduled for this week.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentOverview;