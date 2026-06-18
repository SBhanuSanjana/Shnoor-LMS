import { useState, useEffect } from "react";
import { X, Search, Check, Users } from "lucide-react";
import { chatService } from "../../services/chatService";

function NewGroupModal({ isOpen, onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setGroupName("");
      setSearchQuery("");
      setUsers([]);
      setSelectedUserIds(new Set());
      return;
    }
    
    // Fetch initial users when opened
    fetchUsers("");
  }, [isOpen]);

  const fetchUsers = async (query) => {
    setLoading(true);
    try {
      const results = await chatService.searchUsers(query);
      setUsers(results);
    } catch (err) {
      console.error("Failed to search users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const delayDebounceFn = setTimeout(() => {
        fetchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, isOpen]);

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    if (selectedUserIds.size === 0) {
      alert("Please select at least one member to add.");
      return;
    }
    onCreate(groupName, Array.from(selectedUserIds));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden m-4 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <Users size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold tracking-tight">Create New Group</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              placeholder="E.g. Project Team, Study Group..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Invite Members ({selectedUserIds.size} selected)
            </label>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <div className="h-48 overflow-y-auto custom-scrollbar border border-slate-800 rounded-xl bg-slate-800/20 p-1">
              {loading && users.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">
                  Searching...
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">
                  No users found.
                </div>
              ) : (
                <div className="space-y-1">
                  {users.map((user) => {
                    const isSelected = selectedUserIds.has(user.id);
                    return (
                      <div 
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-slate-800 border border-transparent'}`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {(user.full_name || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-white truncate">{user.full_name}</span>
                            <span className="text-xs text-slate-400 truncate">{user.email}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!groupName.trim() || selectedUserIds.size === 0}
            className="px-6 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            <Users size={16} /> Create Group
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default NewGroupModal;
