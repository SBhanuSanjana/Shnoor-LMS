import React,{useState,useEffect} from 'react';

function StudentCertificates(){
  const[requests,setRequests]=useState([]);
  const[loading,setLoading]=useState(true);
  const[selectedCert,setSelectedCert]=useState(null);

  const getHeaders=()=>{
    const t=sessionStorage.getItem("access");
    return{
      "Authorization":`Bearer ${t}`,
      "Content-Type":"application/json"
    };
  };

  const loadCerts=async()=>{
    try{
      const res=await fetch("http://127.0.0.1:8000/api/courses/certificate-requests/",{headers:getHeaders()});
      if(res.ok)setRequests(await res.json());
    }catch(e){}finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    loadCerts();
  },[]);

  return(
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cert-print-modal, #cert-print-modal * { visibility: visible; }
          #cert-print-modal { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; }
        }
      `}</style>

      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Certificates</h2>
        <p className="text-slate-500 text-sm mt-1">View and print your earned course credentials</p>
      </div>

      {loading?(
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(r=>(
            <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <h4 className="font-bold text-lg text-slate-900 leading-snug mb-1">{r.course_title}</h4>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Request Date: {new Date(r.created_at).toLocaleDateString()}</div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border inline-block ${
                  r.status==="approved"?"bg-green-50 text-green-700 border-green-200":
                  r.status==="rejected"?"bg-red-50 text-red-700 border-red-200":
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {r.status}
                </span>
              </div>
              {r.status==="approved"&&(
                <button
                  onClick={()=>setSelectedCert(r)}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition text-center shadow-md shadow-blue-600/10"
                >
                  View Certificate
                </button>
              )}
            </div>
          ))}
          {requests.length===0&&(
            <div className="col-span-2 bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500 font-medium">
              No certificates requested or earned yet.
            </div>
          )}
        </div>
      )}

      {selectedCert&&(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-2.5 max-w-3xl w-full shadow-2xl relative rounded-xl border border-slate-100">
            <div id="cert-print-modal" className="bg-white border-8 border-amber-600/30 p-12 text-center relative rounded-lg font-serif">
              <div className="absolute top-4 right-4 text-xs font-bold text-slate-400 uppercase tracking-widest print:hidden">SHNOOR LMS</div>
              <div className="text-amber-600 text-3xl font-black tracking-widest uppercase mb-4">Certificate of Completion</div>
              <div className="w-24 h-0.5 bg-amber-600/40 mx-auto mb-8"></div>
              <p className="text-slate-500 italic text-sm mb-6">This certificate is proudly presented to</p>
              <h2 className="text-slate-900 text-3xl font-black tracking-wide mb-6 italic">{selectedCert.student_name}</h2>
              <p className="text-slate-500 italic text-sm mb-6">for successfully completing the course</p>
              <h3 className="text-slate-800 text-2xl font-bold mb-8 underline">{selectedCert.course_title}</h3>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-12">Completed on: {new Date(selectedCert.updated_at).toLocaleDateString()}</p>
              
              <div className="grid grid-cols-2 gap-12 max-w-md mx-auto mt-12 text-xs border-t border-slate-200 pt-8 font-sans">
                <div>
                  <div className="h-6 flex items-center justify-center font-semibold text-slate-600 font-sans border-b border-slate-300">SHNOOR LMS Administrator</div>
                  <div className="text-slate-400 mt-1 font-bold">Authorized signature</div>
                </div>
                <div>
                  <div className="h-6 flex items-center justify-center font-semibold text-slate-600 font-sans border-b border-slate-300">Lead Instructor</div>
                  <div className="text-slate-400 mt-1 font-bold">Verification authority</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
              <button onClick={()=>setSelectedCert(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-5 rounded-xl text-sm transition">
                Close
              </button>
              <button onClick={()=>window.print()} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-5 rounded-xl text-sm transition">
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentCertificates;