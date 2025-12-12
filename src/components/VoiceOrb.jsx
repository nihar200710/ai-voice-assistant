import { motion } from "framer-motion";

export const VoiceOrb = ({ isListening }) => {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Background Glow */}
      <motion.div
        animate={isListening ? { scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0.1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl"
      />
      
      {/* Core Orb */}
      <motion.div
        animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-xl shadow-purple-500/20 flex items-center justify-center border border-white/10"
      >
        {isListening ? (
             <div className="flex gap-1 h-4 items-center">
                 {[1, 2, 3].map((i) => (
                    <motion.div 
                        key={i}
                        animate={{ height: [10, 24, 10] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-white rounded-full"
                    />
                 ))}
             </div>
        ) : (
             <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        )}
      </motion.div>
    </div>
  );
};