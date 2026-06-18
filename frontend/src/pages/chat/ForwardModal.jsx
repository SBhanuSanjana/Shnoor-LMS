import { useState } from "react";
import { Search, X, Users, MessageSquare } from "lucide-react";

function ForwardModal({ isOpen, onClose, conversations, onForward }) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredConversations = conversations.filter(c => {
    const name = c.name || (c.type === 'DIRECT' ? c.other_role || 'Direct Message' : 'Group Chat');
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Forward Message</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 font-medium text-sm">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map(conv => (
              <button 
                key={conv.id}
                onClick={() => onForward(conv.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${conv.type === 'GROUP' ? 'bg-orange-500' : 'bg-blue-600'}`}>
                  {conv.type === 'GROUP' ? <Users size={18} /> : (conv.name || "D").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{conv.name || "Direct Message"}</p>
                  <p className="text-xs text-slate-500 capitalize truncate mt-0.5">
                    {conv.type === 'DIRECT' && conv.other_role ? conv.other_role.replace('_', ' ').toLowerCase() : conv.type.toLowerCase()}
                  </p>
                </div>
                <div className="text-blue-600 bg-blue-50 p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <MessageSquare size={16} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;
