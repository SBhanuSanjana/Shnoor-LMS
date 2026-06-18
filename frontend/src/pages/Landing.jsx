import logo from "../assets/shnoor-logo.jpeg";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import {
  BookOpen, Users, Award, Shield, CheckCircle2,
  ArrowRight, PlayCircle, BarChart3, Menu, X, Star, Globe
} from "lucide-react";

function Landing() {
  const [statsData, setStatsData] = useState({ activeUsers: 0, publishedCourses: 0, certificatesIssued: 0, expertInstructors: 0 });
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  useEffect(() => {
    const approvedUsers = JSON.parse(localStorage.getItem("approvedUsers")) || [];
    const savedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    const savedCategories = JSON.parse(localStorage.getItem("categories")) || [];

    setCourses(savedCourses);
    setCategories(savedCategories);

    const fetchStats = async () => {
      try {
        const res = await api.get('/api/public/stats');
        setStatsData(res.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    const fetchPlans = async () => {
      try {
        const res = await api.get('/api/plans');
        
        const learnerPlans = res.data.filter(p => p.plan_type === 'learner').sort((a, b) => b.price - a.price);
        const orgPlans = res.data.filter(p => p.plan_type === 'organization').sort((a, b) => b.price - a.price);
        
        let displayPlans = [];
        
        // 1. Add the highest-tier Learner Plan (e.g. Premium Learner)
        if (learnerPlans.length > 0) displayPlans.push(learnerPlans[0]);
        
        // 2. Add the middle-tier Org Plan (e.g. Standard Organization)
        if (orgPlans.length > 1) {
            displayPlans.push(orgPlans[1]);
        } else if (orgPlans.length === 1) {
            displayPlans.push(orgPlans[0]);
        }
        
        // 3. Add the highest-tier Org Plan (e.g. Enterprise Organization)
        if (orgPlans.length > 0) displayPlans.push(orgPlans[0]);
        
        // Remove duplicates (in case there was only 1 org plan)
        displayPlans = Array.from(new Set(displayPlans));
        
        // Fill remaining slots with highest priced available plans if we have less than 3
        if (displayPlans.length < 3) {
            const others = res.data
                .filter(p => !displayPlans.includes(p))
                .sort((a, b) => b.price - a.price);
            displayPlans = [...displayPlans, ...others];
        }
        
        // Sort ascending by price for a nice left-to-right display (Learner -> Standard -> Enterprise)
        displayPlans = displayPlans.slice(0, 3).sort((a, b) => a.price - b.price);
        
        setSubscriptionPlans(displayPlans);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    };

    fetchStats();
    fetchPlans();
  }, []);

  const features = [
    { title: "Role-Based Access", desc: "Dedicated portals for students, instructors, institutes, and super admins.", icon: <Shield className="w-6 h-6" /> },
    { title: "Subscription Control", desc: "Flexible access with free trials and premium tier management.", icon: <Star className="w-6 h-6" /> },
    { title: "Course Builder", desc: "Create rich content with video lessons, PDFs, quizzes, and assignments.", icon: <BookOpen className="w-6 h-6" /> },
    { title: "Analytics & Tracking", desc: "Real-time progress tracking, auto-certificates, and admin reports.", icon: <BarChart3 className="w-6 h-6" /> },
  ];

  const stats = [
    { label: "Active Users", value: statsData.activeUsers },
    { label: "Published Courses", value: statsData.publishedCourses },
    { label: "Certificates Issued", value: statsData.certificatesIssued },
    { label: "Expert Instructors", value: statsData.expertInstructors },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 font-sans selection:bg-yellow-400 selection:text-blue-950">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <img src={logo} alt="SHNOOR" className="h-10 w-auto" />
              <span className="text-2xl font-black tracking-tight text-blue-950">SHNOOR LMS</span>
            </div>

            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-sm font-bold text-slate-600 hover:text-yellow-600 transition-colors">Home</a>
              <a href="#features" className="text-sm font-bold text-slate-600 hover:text-yellow-600 transition-colors">Features</a>
              {courses.length > 0 && <a href="#courses" className="text-sm font-bold text-slate-600 hover:text-yellow-600 transition-colors">Courses</a>}
              <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-yellow-600 transition-colors">Pricing</a>
              <a href="#contact" className="text-sm font-bold text-slate-600 hover:text-yellow-600 transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center space-x-5">
              <Link to="/login" className="text-sm font-bold text-blue-950 hover:text-yellow-600 transition-colors">Log in</Link>
              <Link to="/register" className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all bg-blue-950 text-white hover:bg-blue-900 shadow-md px-6 py-2.5 hover:shadow-lg hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>

            <button className="md:hidden p-2 text-blue-950 hover:text-yellow-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg absolute w-full z-40">
          <a href="#home" className="block px-4 py-3 text-base font-bold text-blue-950" onClick={() => setIsMenuOpen(false)}>Home</a>
          <a href="#features" className="block px-4 py-3 text-base font-bold text-slate-600" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#courses" className="block px-4 py-3 text-base font-bold text-slate-600" onClick={() => setIsMenuOpen(false)}>Courses</a>
          <a href="#pricing" className="block px-4 py-3 text-base font-bold text-slate-600" onClick={() => setIsMenuOpen(false)}>Pricing</a>
          <a href="#contact" className="block px-4 py-3 text-base font-bold text-slate-600" onClick={() => setIsMenuOpen(false)}>Contact</a>
          <div className="pt-6 px-4 flex flex-col gap-3">
            <Link to="/login" className="w-full text-center px-4 py-3 border-2 border-slate-200 rounded-xl text-blue-950 font-bold" onClick={() => setIsMenuOpen(false)}>Log in</Link>
            <Link to="/register" className="w-full text-center px-4 py-3 bg-blue-950 text-white rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="home" className="py-24 lg:py-32 bg-blue-950 relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#eab308 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-sm font-bold text-yellow-400 mb-8 shadow-sm">
            Professional LMS Platform
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white mb-8 leading-tight">
            Learn smarter with a <span className="text-yellow-400">structured</span> digital LMS.
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            A professional platform for institutes, instructors, and students to manage courses, subscriptions, quizzes, assignments, and certificates from one centralized hub.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/register" className="inline-flex justify-center items-center rounded-xl bg-yellow-500 px-8 py-4 text-base font-black text-blue-950 hover:bg-yellow-400 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.5)] transition-all hover:-translate-y-1">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="#features" className="inline-flex justify-center items-center rounded-xl bg-blue-900/50 px-8 py-4 text-base font-bold text-white border-2 border-blue-800 hover:bg-blue-800 transition-colors">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* PLATFORM WORKFLOW (Below Hero) */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-blue-950">Platform Workflow</h2>
            <p className="mt-4 text-lg text-slate-600 font-medium max-w-2xl mx-auto">A seamless 6-step journey from onboarding to certification.</p>
          </div>

          <div className="relative max-w-6xl mx-auto mt-12">
            {/* Horizontal Line connecting steps */}
            <div className="hidden lg:block absolute top-6 left-[8.33%] w-[83.33%] h-1 bg-slate-200 rounded-full"></div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
              {[
                { title: "Register", desc: "Student/Institute" },
                { title: "Subscribe", desc: "Free or Premium" },
                { title: "Publish", desc: "Upload Courses" },
                { title: "Access", desc: "Learn Anywhere" },
                { title: "Assess", desc: "Take Quizzes" },
                { title: "Certify", desc: "Earn Credentials" },
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center group cursor-default">
                  {/* Dot / Number */}
                  <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-100 group-hover:border-yellow-400 group-hover:bg-blue-950 text-blue-950 group-hover:text-yellow-400 flex items-center justify-center font-black text-lg transition-all duration-300 shadow-sm relative z-10 mb-5">
                    {index + 1}
                  </div>
                  {/* Content */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-lg group-hover:border-yellow-400 group-hover:-translate-y-1 transition-all duration-300 w-full h-full flex flex-col justify-center">
                    <h3 className="font-black text-blue-950 text-base mb-1.5">{step.title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-4xl md:text-5xl font-black text-blue-950">{stat.value}</div>
                <div className="mt-3 text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-sm">Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-blue-950 mt-4">Everything you need</h2>
            <p className="mt-4 text-lg text-slate-600 font-medium">
              A comprehensive set of tools designed for a seamless learning and teaching experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-t-4 hover:border-t-yellow-400">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-blue-950 mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      {categories.length > 0 && (
        <section id="categories" className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl font-black tracking-tight text-blue-950 mb-4">Top Categories</h2>
              <p className="text-slate-600 font-medium max-w-2xl">Explore our wide variety of disciplines and topics tailored for modern learners.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 px-6 py-5 rounded-xl text-center hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer group">
                  <h3 className="text-base font-bold text-blue-950 group-hover:text-blue-700">{category.name || category}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COURSES SECTION */}
      {courses.length > 0 && (
        <section id="courses" className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-blue-950">Featured Courses</h2>
              <p className="mt-4 text-lg text-slate-600 font-medium">Browse our latest published courses.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 3).map((course, index) => (
                <div key={index} className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-48 bg-slate-200 relative">
                    <img src={`https://source.unsplash.com/random/800x600?education,tech,${index}`} alt="Course Cover" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                        {course.category || "General"}
                      </span>
                      <span className={`text-sm font-black ${course.isFree ? "text-emerald-600" : "text-blue-700"}`}>
                        {course.isFree ? "Free" : "Premium"}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-blue-950 mb-3">{course.title || "Course Title"}</h3>
                    <p className="text-sm text-slate-600 mb-8 flex-1 line-clamp-2 font-medium">
                      {course.description || "Learn the fundamentals in this comprehensive and expertly designed course."}
                    </p>
                    <div className="flex items-center pt-4 border-t border-slate-100 text-sm">
                      <div className="font-bold text-slate-800">{course.instructor || "Instructor"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-sm">Clear Pricing</span>
            <h2 className="text-3xl font-black tracking-tight text-blue-950 sm:text-4xl mt-4">Popular Plans</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-center justify-center">
            {subscriptionPlans.length === 0 ? (
              <p className="text-center text-slate-500 col-span-full">Pricing plans will be announced soon.</p>
            ) : (
              subscriptionPlans.map((plan, index) => (
                <div key={plan.id} className={`rounded-3xl border p-10 shadow-sm text-center relative overflow-hidden transition-all hover:scale-105 ${index % 2 === 1 ? 'bg-blue-950 border-blue-900 text-white shadow-2xl scale-105' : 'bg-slate-50 border-slate-200 text-blue-950'}`}>
                  {index % 2 === 1 && <div className="absolute top-0 inset-x-0 h-2 bg-yellow-400"></div>}
                  <h3 className={`text-2xl font-black ${index % 2 === 1 ? 'text-white' : 'text-blue-950'}`}>{plan.name}</h3>
                  <p className={`mt-4 font-bold tracking-widest text-xs uppercase ${index % 2 === 1 ? 'text-yellow-400' : 'text-blue-600'}`}>
                    FOR {plan.plan_type === 'learner' ? 'LEARNERS' : 'ORGANIZATIONS'}
                  </p>
                  <div className="mt-8 mb-10">
                    <span className={`text-5xl font-black tracking-tight ${index % 2 === 1 ? 'text-yellow-400' : 'text-blue-950'}`}>₹{parseFloat(plan.price).toLocaleString()}</span>
                    <span className={`text-sm font-bold ${index % 2 === 1 ? 'text-blue-300' : 'text-slate-400'}`}>/mo</span>
                  </div>
                  <ul className={`space-y-4 text-sm leading-6 font-medium text-left ${index % 2 === 1 ? 'text-slate-300' : 'text-slate-700'}`}>
                    {plan.features && Array.isArray(plan.features) ? plan.features.map((item, i) => (
                      <li key={i} className="flex gap-x-3 items-center">
                        <CheckCircle2 className={`h-5 w-5 flex-none ${index % 2 === 1 ? 'text-yellow-400' : 'text-emerald-500'}`} aria-hidden="true" />
                        {item.feature_name} {item.feature_value && item.feature_value !== 'True' ? `- ${item.feature_value}` : ''}
                      </li>
                    )) : null}
                  </ul>
                  <Link to="/register" className={`mt-10 block w-full rounded-xl px-3 py-4 text-center text-sm font-bold shadow-sm transition-colors ${index % 2 === 1 ? 'bg-yellow-500 text-blue-950 hover:bg-yellow-400' : 'border-2 border-slate-300 bg-white text-blue-950 hover:bg-slate-100'}`}>
                    Subscribe Now
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-blue-950">Get in touch</h2>
            <p className="mt-6 text-lg text-slate-600 font-medium leading-relaxed">
              Have questions about implementation, pricing, or features? Send us a message and our team will get back to you shortly.
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-950">Email Us</h3>
                  <p className="mt-2 text-slate-600 font-medium">info@shnoor.com<br />proc@shnoor.com</p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-950">Headquarters</h3>
                  <p className="mt-2 text-slate-600 font-medium">10009 Mount Tabor Road,<br />Odessa Missouri, United States.</p>
                </div>
              </div>
            </div>
          </div>

          <form className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-blue-950 mb-2">Full Name</label>
                <input type="text" className="block w-full rounded-xl border-slate-300 py-3 px-4 text-slate-900 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium transition-colors" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-950 mb-2">Email Address</label>
                <input type="email" className="block w-full rounded-xl border-slate-300 py-3 px-4 text-slate-900 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium transition-colors" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-950 mb-2">Message</label>
                <textarea rows={4} className="block w-full rounded-xl border-slate-300 py-3 px-4 text-slate-900 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium transition-colors resize-none" placeholder="How can we help?"></textarea>
              </div>
              <button type="button" onClick={(e) => e.preventDefault()} className="w-full rounded-xl bg-blue-950 px-4 py-4 text-base font-bold text-white shadow-md hover:bg-blue-900 transition-colors mt-4">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-950 pt-16 pb-8 border-t-[8px] border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white p-1.5 rounded-lg">
                <img src={logo} alt="SHNOOR" className="h-8 w-auto" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">SHNOOR</span>
            </div>
            <p className="text-base text-blue-200 max-w-md font-medium leading-relaxed">
              SHNOOR International LLC works in IT consulting, product development, application design, and global trade services.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-6">Services</h3>
            <ul className="space-y-4 text-sm font-medium text-blue-200">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Cloud Management</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Enterprise Management</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Data & AI</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Consulting & Staffing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-6">Legal</h3>
            <ul className="space-y-4 text-sm font-medium text-blue-200">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-blue-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-blue-300">&copy; 2026 SHNOOR International LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;