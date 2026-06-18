import { useState, useEffect, useRef } from "react";
import { Search, Loader2, BookOpen, Layers, FileText, Target, User, Bell, Award, MessageSquare } from "lucide-react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults(null);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const getIcon = (type) => {
    switch (type) {
      case 'course': return <BookOpen size={16} className="text-blue-500" />;
      case 'module': return <Layers size={16} className="text-indigo-500" />;
      case 'lesson': return <FileText size={16} className="text-teal-500" />;
      case 'quiz': return <Target size={16} className="text-orange-500" />;
      case 'assignment': return <Target size={16} className="text-purple-500" />;
      case 'user': return <User size={16} className="text-slate-500" />;
      case 'announcement': return <Bell size={16} className="text-yellow-500" />;
      case 'certificate': return <Award size={16} className="text-emerald-500" />;
      case 'chat_message': return <MessageSquare size={16} className="text-sky-500" />;
      default: return <Search size={16} className="text-slate-400" />;
    }
  };

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery("");

    const role = sessionStorage.getItem("role") || 'learner';
    let base = '/student-dashboard';
    
    // --- ADMIN ROUTING ---
    if (role === 'admin') {
      let targetPage = 'Overview';
      let navState = {};

      if (['course', 'module', 'lesson', 'quiz', 'assignment'].includes(item.type)) {
        targetPage = 'Manage Courses';
      } else if (item.type === 'chat_message') {
        targetPage = 'Messages';
        navState.targetId = item.id;
      } else if (item.type === 'user') {
        targetPage = 'Manage Users';
        navState.searchTerm = item.title;
      } else if (item.type === 'announcement') {
        targetPage = 'Announcements';
        navState.searchTerm = item.title;
      } else if (item.type === 'certificate') {
        targetPage = 'Certificate Requests';
        navState.searchTerm = item.title;
      }
      
      navState.activePage = targetPage;
      navigate('/admin-dashboard', { state: navState });
      return;
    }

    // --- NON-ADMIN ROUTING ---
    if (role === 'organization_admin') base = '/institute-dashboard';
    else if (role === 'instructor') base = '/instructor-dashboard';

    const statePayload = { 
      targetCourseId: item.course_id || item.id,
      targetItemId: item.id,
      targetItemType: item.type,
      searchTerm: item.title 
    };

    if (item.type === 'chat_message') {
      navigate(`${base}/chat`, { state: { targetId: item.id } });
      return;
    }

    if (item.type === 'announcement') {
      navigate(`${base}/announcements`, { state: { searchTerm: item.title } });
      return;
    }

    // ROLE-SPECIFIC ROUTING
    if (role === 'instructor') {
      if (item.type === 'assignment') {
        navigate(`${base}/assignments`, { state: statePayload });
      } else if (item.type === 'quiz') {
        navigate(`${base}/quizzes`, { state: statePayload });
      } else if (item.type === 'user' || item.type === 'certificate') {
        navigate(`${base}/students`, { state: { searchTerm: item.title } });
      } else {
        // courses, modules, lessons
        navigate(`${base}/courses`, { state: statePayload });
      }
    } 
    else if (role === 'organization_admin') {
      if (item.type === 'certificate') {
        navigate(`${base}/certificates`, { state: statePayload });
      } else if (item.type === 'user') {
        navigate(`${base}/learners`, { state: { searchTerm: item.title } });
      } else {
        // assignments, quizzes, courses, modules, lessons
        navigate(`${base}/courses`, { state: statePayload });
      }
    } 
    else { // student or learner
      if (item.type === 'assignment') {
        navigate(`${base}/assignments`, { state: statePayload });
      } else if (item.type === 'quiz') {
        navigate(`${base}/quizzes`, { state: statePayload });
      } else if (item.type === 'certificate') {
        navigate(`${base}/certificates`, { state: statePayload });
      } else if (item.type === 'user') {
        navigate(`${base}/chat`, { state: { searchTerm: item.title } });
      } else {
        // courses, modules, lessons
        navigate(`${base}/courses`, { state: statePayload });
      }
    }
  };

  const totalResults = results ? Object.values(results).reduce((acc, arr) => acc + arr.length, 0) : 0;

  return (
    <div className="relative w-72" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (totalResults > 0) setIsOpen(true); }}
          placeholder="Search..."
          className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-10 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />
        )}
      </div>

      {isOpen && results && totalResults > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 max-h-96 overflow-y-auto bg-white border border-slate-100 shadow-xl rounded-2xl z-50 py-2 custom-scrollbar">
          {Object.entries(results).map(([category, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={category} className="mb-2 last:mb-0">
                <h4 className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{category.replace('_', ' ')}</h4>
                {items.map((item, idx) => (
                  <button
                    key={`${category}-${idx}`}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-slate-800 truncate">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-[11px] text-slate-500 truncate">{item.subtitle}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {isOpen && query.length >= 2 && !loading && totalResults === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 p-4 text-center">
          <p className="text-sm font-bold text-slate-600">No results found.</p>
          <p className="text-xs text-slate-400">Try checking your spelling or using different keywords.</p>
        </div>
      )}
    </div>
  );
}
