import { useRef, useEffect, useState } from "react";
import { useVoiceAssistant } from "./hooks/useVoiceAssistant";
import { VoiceOrb } from "./components/VoiceOrb";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const { 
    isListening, 
    transcript, 
    messages, 
    startListening, 
    stopListening, 
    processMessage, 
    isLoading 
  } = useVoiceAssistant();

  const [inputText, setInputText] = useState("");
  const bottomRef = useRef(null);

  // 1. Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isLoading, isListening]);

  // 2. Sync Voice to Input Box (Live Preview)
  useEffect(() => {
    if (isListening && transcript) {
        setInputText(transcript);
    }
  }, [isListening, transcript]);

  // 3. ✅ THE FIX: Auto-Clear Input when Message Sends
  useEffect(() => {
    // Check if the latest message is from the user
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
        setInputText(""); // Wipe the box clean
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    processMessage(inputText);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-screen bg-background text-white overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-purple-500'}`} />
           <span className="font-semibold tracking-widest text-xs text-gray-400">
              {isListening ? "LISTENING..." : "AI ASSISTANT"}
           </span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-white text-black rounded-tr-sm font-medium'
                    : 'bg-surface border border-white/5 text-gray-300 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading Indicator */}
        {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-surface border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center h-[46px]">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
                </div>
            </motion.div>
        )}

        {/* Live "Ghost Text" Floating Bubble */}
        {isListening && transcript && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex justify-end"
             >
                <div className="max-w-[80%] px-5 py-3 rounded-2xl text-lg font-light bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 backdrop-blur-md animate-pulse">
                    {transcript}
                    <span className="animate-blink">|</span>
                </div>
             </motion.div>
        )}
        
        <div ref={bottomRef} />
      </main>

      {/* Footer / Input Area */}
      <footer className="p-4 pb-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
            
            {/* The Voice Orb */}
            <motion.div 
               animate={inputText.length > 0 && !isListening ? { scale: 0.5, opacity: 0.5 } : { scale: 1, opacity: 1 }}
               onClick={isListening ? stopListening : startListening} 
               className="cursor-pointer transition-transform hover:scale-105 active:scale-95 mb-2"
            >
                <VoiceOrb isListening={isListening} />
            </motion.div>

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="relative w-full flex items-center gap-2">
                <div className="relative flex-1 group">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Type a message..."}
                        className={`w-full bg-surface/50 border hover:border-white/20 focus:border-purple-500/50 rounded-full px-6 py-3 pl-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all shadow-lg backdrop-blur-sm ${isListening ? 'border-purple-500/50 ring-1 ring-purple-500/20' : 'border-white/10'}`}
                    />
                    <Sparkles className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isListening ? 'text-purple-400 animate-spin-slow' : 'text-white/20'}`} />
                </div>
                
                <button 
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-3 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-white/10"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>

            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-medium h-4">
                {isListening ? "Listening..." : isLoading ? "Thinking..." : "Tap Orb to Speak"}
            </p>
        </div>
      </footer>
    </div>
  );
}

export default App;