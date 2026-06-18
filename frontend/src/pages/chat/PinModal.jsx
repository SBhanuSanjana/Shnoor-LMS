import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { chatService } from "../../services/chatService";

function PinModal({ isOpen, onClose, mode = "SET" }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "SET") {
        await chatService.setPin(pin);
        alert("PIN updated successfully!");
        onClose();
      } else {
        await chatService.verifyPin(pin);
        // We'll pass success back via a callback if needed
        onClose(true); 
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid PIN");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <KeyRound size={24} />
            </div>
            <button onClick={() => onClose()} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {mode === "SET" ? "Set Chat PIN" : "Enter PIN"}
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-6">
            {mode === "SET" ? "Create a 4-6 digit PIN to lock your private chats." : "This chat is locked. Enter your PIN to view."}
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold tracking-widest text-center focus:outline-none focus:border-blue-500 focus:bg-white mb-2"
              autoFocus
              maxLength={6}
            />
            {error && <p className="text-red-500 text-xs text-center font-bold mb-4">{error}</p>}
            
            <button
              type="submit"
              disabled={!pin}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors mt-4 disabled:opacity-50"
            >
              {mode === "SET" ? "Save PIN" : "Unlock Chat"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PinModal;
