import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Star, Crown, Medal } from 'lucide-react';
import api from '../../api';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const currentUserId = parseInt(sessionStorage.getItem('userId'));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/api/courses');
        if (res.status >= 200 && res.status < 300) {
          setCourses(Array.isArray(res.data) ? res.data : []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const url = selectedCourseId ? `/api/leaderboard?courseId=${selectedCourseId}` : '/api/leaderboard';
        const res = await api.get(url);
        if (res.status >= 200 && res.status < 300) {
          setLeaderboard(Array.isArray(res.data) ? res.data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedCourseId]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-200"><Crown size={20} className="text-white" /></div>;
    if (rank === 2) return <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-200"><Medal size={20} className="text-white" /></div>;
    if (rank === 3) return <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200"><Medal size={20} className="text-white" /></div>;
    return <span className="w-10 h-10 flex items-center justify-center text-slate-500 font-bold text-lg">{rank}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Trophy size={28} className="text-amber-500" />
          <h2 className="text-2xl font-bold text-slate-800">Leaderboards</h2>
        </div>
        <p className="text-slate-500 text-sm">See how you rank against top learners globally</p>
      </div>

      {/* Dropdown */}
      <div className="flex bg-slate-100 rounded-xl p-1 w-fit border border-slate-200">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-slate-700 font-semibold px-4 py-1.5 outline-none text-sm min-w-[200px]"
        >
          <option value="">Global Rank (All Courses)</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            <Trophy size={40} className="mx-auto mb-3 text-slate-300" />
            <p>No learners on the leaderboard yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] w-12">Rank</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Top Performer</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Courses Completed</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Quizzes Passed</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">Learning Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((learner, index) => {
                  const rank = index + 1;
                  const isMe = learner.id === currentUserId;
                  const lessonsNum = parseInt(learner.lessons_completed) || 0;
                  const coursesNum = parseInt(learner.courses_completed) || 0;
                  const quizzesNum = parseInt(learner.quizzes_passed) || 0;

                  return (
                    <tr
                      key={learner.id}
                      className={`transition-colors ${
                        isMe
                          ? 'bg-amber-50/60 hover:bg-amber-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        {getRankIcon(rank)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="font-semibold text-slate-800">
                              {learner.full_name}
                            </span>
                            {isMe && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-blue-950 uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800">{coursesNum} Courses</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800">{quizzesNum} Passed</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 text-orange-600 font-bold">
                           <TrendingUp size={16} /> {learner.streak_count || 1} Days
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
