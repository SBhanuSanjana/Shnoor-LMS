import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { Paperclip, Send, Users, Smile, MessageSquare, Mic, Search, MoreVertical, Archive, Lock, Download, Trash2, X, Square } from "lucide-react";
import { chatService } from "../../services/chatService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach(msg => {
    const dateStr = new Date(msg.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(msg);
  });
  return groups;
};

function ChatWindow({ activeConv, messages, onSendMessage, currentUserId, currentUserRole, onStartDirectChat, onRefreshMessages, onRefreshConversations, onForwardMessage, onOpenAddMember, onLeaveGroup }) {
  const [inputText, setInputText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const membersRef = useRef(null);

  useEffect(() => {
    setShowMembers(false);
    setShowDropdown(false);
    setShowSearch(false);
    setSearchQuery("");
    setMembers([]);
    setReplyingTo(null);
  }, [activeConv?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (membersRef.current && !membersRef.current.contains(event.target)) {
        setShowMembers(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Search
  useEffect(() => {
    if (showSearch && searchQuery.trim().length > 1) {
      const timeoutId = setTimeout(async () => {
        try {
          const res = await chatService.searchMessages(activeConv?.id, searchQuery);
          setSearchResults(res);
        } catch (e) {
          console.error(e);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, showSearch, activeConv?.id]);

  if (!activeConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white border-l border-slate-100">
        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
          <MessageSquare className="text-slate-300" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Your Messages</h2>
        <p className="mt-2 text-slate-500 font-medium">Select a conversation from the sidebar to start chatting.</p>
      </div>
    );
  }

  // Handle Text/File Send
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, "TEXT", null, null, null, replyingTo?.id);
    setInputText("");
    setReplyingTo(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await chatService.uploadAttachment(activeConv.id, file);
      const isImage = file.type.startsWith("image/");
      onSendMessage("", isImage ? "IMAGE" : "FILE", res.fileName, res.fileUrl, res.fileType, replyingTo?.id);
      setReplyingTo(null);
    } catch (err) {
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  // Handle Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });
        
        try {
          setUploading(true);
          const res = await chatService.uploadAttachment(activeConv.id, file);
          onSendMessage("", "AUDIO", res.fileName, res.fileUrl, res.fileType, replyingTo?.id);
          setReplyingTo(null);
        } catch (err) {
          alert("Failed to send voice message");
        } finally {
          setUploading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Handle Message Bubble Actions
  const handleMessageAction = async (action, message, data) => {
    try {
      if (action === 'EDIT') {
        const newText = prompt("Edit message:", message.message);
        if (newText && newText !== message.message) {
          await chatService.editMessage(message.id, newText);
          onRefreshMessages();
        }
      } else if (action === 'DELETE_ME') {
        await chatService.deleteForMe(message.id);
        onRefreshMessages();
      } else if (action === 'DELETE_EVERYONE') {
        if (confirm("Delete this message for everyone?")) {
          await chatService.deleteForEveryone(message.id);
          onRefreshMessages();
        }
      } else if (action === 'REACT') {
        await chatService.reactToMessage(message.id, data);
        onRefreshMessages();
      } else if (action === 'REPLY') {
        setReplyingTo(message);
      } else if (action === 'FORWARD') {
        if (onForwardMessage) onForwardMessage(message);
      }
    } catch (err) {
      console.error(err);
      alert("Action failed: " + (err.response?.data?.error || err.message));
    }
  };

  // Handle Header Dropdown Actions
  const handleChatAction = async (action) => {
    setShowDropdown(false);
    try {
      if (action === 'ARCHIVE') {
        await chatService.toggleArchive(activeConv.id);
        if (onRefreshConversations) onRefreshConversations();
        alert(`Chat ${activeConv.is_archived ? "unarchived" : "archived"}.`);
      } else if (action === 'LOCK') {
        await chatService.toggleLock(activeConv.id);
        if (onRefreshConversations) onRefreshConversations();
        alert(`Chat ${activeConv.is_locked ? "unlocked" : "locked"}. ${!activeConv.is_locked ? "Ensure you have set a PIN." : ""}`);
      } else if (action === 'CLEAR') {
        if (confirm("Are you sure you want to clear your history? This cannot be undone.")) {
          await chatService.clearHistory(activeConv.id);
          onRefreshMessages();
        }
      } else if (action === 'EXPORT') {
        const doc = new jsPDF();
        const title = `Chat Export - ${activeConv.name || 'Direct Message'}`;
        
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${format(new Date(), "MMM d, yyyy h:mm a")}`, 14, 30);
        
        const tableColumn = ["Date & Time", "Sender", "Message"];
        const tableRows = [];
        
        messages.forEach(msg => {
          if (!msg.is_deleted_for_everyone) {
            const timeStr = format(new Date(msg.created_at), "MMM d, yyyy h:mm a");
            let text = msg.message || "";
            if (msg.message_type !== 'TEXT') {
               text = `[${msg.message_type} attachment] ${text}`;
            }
            if (msg.is_forwarded) {
               text = `[Forwarded] ${text}`;
            }
            tableRows.push([
              timeStr,
              msg.sender_name || "Unknown",
              text
            ]);
          }
        });
        
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 40,
          styles: { fontSize: 10, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 40 },
            2: { cellWidth: 'auto' }
          }
        });
        
        doc.save(`${(activeConv.name || 'chat').replace(/\s+/g, '_')}_history.pdf`);
      } else if (action === 'LEAVE') {
        if (confirm("Are you sure you want to leave this group?")) {
          if (onLeaveGroup) onLeaveGroup();
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to perform action: " + (err.message || "Unknown error"));
    }
  };

  // Handle Search (moved to top to avoid React Hook order error)

  const displayMessages = showSearch && searchQuery.trim().length > 1 ? searchResults : messages;
  const groupedMessages = groupMessagesByDate(displayMessages);
  const initial = (activeConv.name || "D").charAt(0).toUpperCase();

  const getSubtitle = () => {
    if (activeConv.type === 'DIRECT' && activeConv.other_role) {
      return activeConv.other_role.replace('_', ' ').toLowerCase();
    }
    return activeConv.type.toLowerCase();
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Header */}
      <div className="h-20 px-8 border-b border-slate-100 bg-white flex items-center justify-between z-20 shrink-0 relative">
        
        {showSearch ? (
          <div className="flex items-center gap-3 w-full bg-slate-50 px-4 py-2 rounded-xl border border-blue-200">
            <Search size={18} className="text-blue-500" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search in this chat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-800 text-sm font-medium"
            />
            <button onClick={() => setShowSearch(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500"><X size={16}/></button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-600/20">
                {initial}
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg leading-tight flex items-center gap-2">
                  {activeConv.is_locked && <Lock size={14} className="text-slate-400" />}
                  {activeConv.name || "Direct Message"}
                </h2>
                <p className="text-sm text-slate-500 font-medium capitalize mt-0.5">
                  {getSubtitle()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSearch(true)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <Search size={20} />
              </button>

              {activeConv.type !== 'DIRECT' && (
                <div className="relative" ref={membersRef}>
                  <button 
                    onClick={async () => {
                      setShowMembers(!showMembers);
                      setShowDropdown(false);
                      if (!showMembers && members.length === 0) {
                        try {
                          const data = await chatService.getConversationMembers(activeConv.id);
                          setMembers(data);
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                  >
                    <Users size={18} className="text-slate-400" />
                  </button>
                  
                  {showMembers && (
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden">
                      <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">Group Members</span>
                        {activeConv.type === 'GROUP' && activeConv.type !== 'ANNOUNCEMENT' && (
                          <button
                            onClick={() => { setShowMembers(false); if(onOpenAddMember) onOpenAddMember(); }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                        {members.map(m => (
                          <button 
                            key={m.id} 
                            onClick={() => {
                              if (m.id !== currentUserId && onStartDirectChat) {
                                setShowMembers(false);
                                onStartDirectChat(m.id);
                              }
                            }}
                            disabled={m.id === currentUserId}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${m.id === currentUserId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'}`}
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                              {m.full_name ? m.full_name.charAt(0).toUpperCase() : "-"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {m.full_name || m.email} {m.id === currentUserId && <span className="text-slate-400 font-normal ml-1">(You)</span>}
                              </p>
                              <p className="text-xs text-slate-500 font-medium capitalize truncate mt-0.5">{(m.system_role || m.role || m.chat_role || "User").toLowerCase()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowMembers(false);
                }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  <MoreVertical size={20} />
                </button>
                {showDropdown && (
                  <div className="absolute top-12 right-0 w-48 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-50">
                    <button onClick={() => handleChatAction('EXPORT')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Download size={14}/> Export History</button>
                    <button onClick={() => handleChatAction('ARCHIVE')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Archive size={14}/> {activeConv.is_archived ? 'Unarchive Chat' : 'Archive Chat'}</button>
                    <button onClick={() => handleChatAction('LOCK')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Lock size={14}/> {activeConv.is_locked ? 'Unlock Chat' : 'Lock Chat'}</button>
                    {activeConv.type !== 'DIRECT' && activeConv.type !== 'ANNOUNCEMENT' && (
                      <button onClick={() => handleChatAction('LEAVE')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-orange-600">Leave Group</button>
                    )}
                    <div className="h-px bg-slate-100 my-1"></div>
                    {activeConv.type !== 'ANNOUNCEMENT' && (
                      <button onClick={() => handleChatAction('CLEAR')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"><Trash2 size={14}/> Clear History</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
        {displayMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            {showSearch ? <Search className="opacity-20 mb-4" size={48} /> : <MessageSquare className="opacity-20 mb-4" size={48} />}
            <p className="text-sm font-bold text-slate-500">{showSearch ? "No messages found." : "No messages yet."}</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-6">
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="px-4 text-xs font-bold text-slate-400 bg-white">
                  {date}
                </span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              
              {msgs.map((msg, idx) => (
                <MessageBubble 
                  key={msg.id || idx} 
                  message={msg} 
                  repliedMessage={msg.reply_to_id ? displayMessages.find(m => m.id === msg.reply_to_id) : null}
                  isOwnMessage={msg.sender_id === currentUserId}
                  currentUserId={currentUserId}
                  onAction={handleMessageAction}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} className="h-32 shrink-0" />
      </div>

      {/* Input Area */}
      {activeConv.type === 'ANNOUNCEMENT' && currentUserRole !== 'ADMIN' ? (
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-sm font-bold text-slate-500 flex items-center justify-center gap-2">
            <Lock size={14} /> Only Super Admins can send messages to this channel
          </p>
        </div>
      ) : (
      <div className="p-6 bg-white shrink-0 relative z-10 flex flex-col">
        {replyingTo && (
          <div className="max-w-4xl mx-auto w-full mb-2 bg-slate-50 border-l-4 border-blue-500 rounded-lg p-3 flex justify-between items-start relative overflow-hidden">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-blue-600 mb-1">{replyingTo.sender_name}</p>
              <p className="text-sm text-slate-600 truncate">{replyingTo.message || (replyingTo.file_url ? `[${replyingTo.message_type}]` : '...')}</p>
            </div>
            <button type="button" onClick={() => setReplyingTo(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 ml-2">
              <X size={16} />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="max-w-4xl mx-auto w-full flex items-end gap-3">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          
          <div className={`flex-1 bg-slate-50 border ${isRecording ? 'border-red-300 ring-4 ring-red-50 bg-red-50' : 'border-slate-200 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50'} rounded-[24px] flex items-center px-2 py-1.5 shadow-sm transition-all`}>
            
            {!isRecording && (
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition disabled:opacity-50 shrink-0"
              >
                <Paperclip size={20} />
              </button>
            )}

            {isRecording ? (
              <div className="flex-1 px-4 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-red-600 font-bold text-sm tracking-wide">Recording Voice Note...</span>
              </div>
            ) : (
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={uploading ? "Uploading file..." : "Type a message..."}
                disabled={uploading}
                className="flex-1 bg-transparent border-none outline-none px-3 text-[15px] text-slate-800 placeholder-slate-400 font-medium"
              />
            )}


            {isRecording ? (
              <button 
                type="button"
                onClick={stopRecording}
                className="p-2.5 text-red-500 hover:bg-red-100 rounded-full transition shrink-0 mr-1"
              >
                <Square size={20} className="fill-current" />
              </button>
            ) : inputText.length === 0 ? (
              <button 
                type="button"
                onClick={startRecording}
                disabled={uploading}
                className="p-2.5 text-blue-500 hover:bg-blue-100 cursor-pointer rounded-full transition shrink-0 mr-1"
              >
                <Mic size={20} />
              </button>
            ) : null}
          </div>

          {!isRecording && (
            <button 
              type="submit"
              disabled={!inputText.trim() || uploading}
              className="w-14 h-14 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              <Send size={20} className="ml-1" />
            </button>
          )}
        </form>
      </div>
      )}
    </div>
  );
}

export default ChatWindow;
