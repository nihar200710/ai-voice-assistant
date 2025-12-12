import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ YOUR WORKING KEY
// ✅ Secure Method (Reads from .env file)
// ✅ Secure Method (Reads from .env file)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const useVoiceAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I am listening. Pause for a second to send your message." }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const silenceTimer = useRef(null); // ⏱️ TIMER FOR AUTO-SEND

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        console.log("🎤 Microphone STARTED.");
      };

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        
        setTranscript(text);
        transcriptRef.current = text;

        // ⏱️ SILENCE DETECTION LOGIC ⏱️
        // 1. Clear the old timer (because you just spoke a new word)
        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        // 2. Set a new timer. If you don't speak for 1.5 seconds, we stop.
        silenceTimer.current = setTimeout(() => {
            console.log("🛑 Silence detected. Auto-sending...");
            if (recognitionRef.current) recognitionRef.current.stop();
        }, 1500); // <--- CHANGE THIS NUMBER (1500ms = 1.5 seconds) to make it faster/slower
      };

      recognitionRef.current.onend = () => {
        console.log("🛑 Microphone STOPPED.");
        setIsListening(false);
        const finalText = transcriptRef.current;
        
        // Clear any remaining timer
        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        if (finalText) {
          processMessage(finalText);
          setTranscript("");
          transcriptRef.current = "";
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech Error:", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const processMessage = useCallback(async (text) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(text);
      const response = await result.response;
      const aiText = response.text();

      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error." }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return alert("Browser not supported");
    transcriptRef.current = "";
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current); // Clear timer if stopped manually
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  return { isListening, transcript, messages, startListening, stopListening, processMessage, isLoading };
};