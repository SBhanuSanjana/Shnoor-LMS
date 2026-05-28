import React from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';

function StudentSubscription() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Subscription</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your SAAS LMS membership plan and billing statements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Active Plan</span>
              <CreditCard className="text-slate-400" size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Standard Pro</h3>
            <p className="text-slate-500 text-sm mb-6">Unlimited access to all enrolled modules</p>
            <div className="space-y-2 mb-6">
              {["Full course access", "Interactive MCQ quizzes", "Instructor graded feedback", "Verified certificates"].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="text-2xl font-black text-slate-900">$29<span className="text-sm font-semibold text-slate-400">/mo</span></span>
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentSubscription;