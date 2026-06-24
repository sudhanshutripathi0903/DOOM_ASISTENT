import React, { useState, useEffect, useRef } from 'react';
import './index.css';

interface HistoryItem {
  type: 'user' | 'ai';
  text: string;
}

function App() {
  // States for Security and UI Flow
  const [pin, setPin] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isSlidingOut, setIsSlidingOut] = useState<boolean>(false);
  const [isChatStarted, setIsChatStarted] = useState<boolean>(false);
  
  const [command, setCommand] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'ai', text: 'Greetings, Commander. I am AATOS, your orbital intelligence core. Security protocols initialized.' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Security Verification and Sliding Gate Effect
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "2005") {
      setIsSlidingOut(true); // Start sliding transition
      setTimeout(() => {
        setIsUnlocked(true); // Destroy lock screen from DOM
      }, 600);
    } else {
      alert("❌ ACCESS DENIED: ENCRYPTION KEY MISMATCH");
      setPin('');
    }
  };

  // API Execution Command
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    if (!isChatStarted) setIsChatStarted(true); // Push input field to bottom like Gemini

    const userMove: HistoryItem = { type: 'user', text: command };
    setHistory(prev => [...prev, userMove]);
    const currentCmd = command;
    setCommand('');
    setIsLoading(true);

    try {
      const response = await fetch('https://open-claw-backend.onrender.com/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: currentCmd, 
          token: "2005" 
        })
      });
      const data = await response.json();
      setHistory(prev => [...prev, { type: 'ai', text: data.feedback || data.error }]);
    } catch (err: any) {
      setHistory(prev => [...prev, { type: 'ai', text: `System Core Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="scanlines relative min-h-screen w-full bg-[#050508] text-gray-200 font-rajdhani overflow-x-hidden flex flex-col z-10">
      
      {/* 🔐 SECURITY PIN SCREEN MASKING */}
      {!isUnlocked && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a12]/95 backdrop-blur-2xl transition-all duration-600 ease-in-out ${isSlidingOut ? 'translate-x-full opacity-0' : 'translate-x-0'}`}>
          <div className="text-center p-8 rounded-2xl border border-cyan-500/20 bg-space-900 max-w-sm w-full mx-4 shadow-2xl shadow-cyan-500/10">
            <h2 className="font-orbitron text-xl font-bold tracking-widest text-white mb-2">AATOS CORE LOCK</h2>
            <p className="text-xs font-mono text-cyan-400/60 uppercase tracking-widest mb-6">Enter Authorization Token</p>
            <form onSubmit={handlePinSubmit} className="flex items-center gap-2 border border-cyan-400/30 rounded-xl px-4 py-2 bg-black/40">
              <input 
                type="password" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••" 
                className="w-full bg-transparent border-none outline-none text-center font-mono text-2xl tracking-[0.5em] text-cyan-400"
              />
              <button type="submit" className="p-2 text-cyan-400 hover:text-white transition-colors">
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header class="glass-panel border-b border-cyan-500/10 sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                  <h1 class="font-orbitron text-xl font-bold tracking-wider text-white">AATOS<span class="text-cyan-400">AI</span></h1>
                  <p class="text-[10px] font-mono text-cyan-400/60 tracking-[0.3em] uppercase hidden sm:block">Orbital Intelligence Terminal</p>
              </div>
              <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5">
                      <div class="status-dot"></div>
                      <span class="text-xs font-mono text-cyan-400/80">CORE SECURE</span>
                  </div>
                  <div class="w-9 h-9 rounded-full border border-cyan-400/30 bg-cyan-500/10 flex items-center justify-center font-orbitron font-bold text-cyan-400">S</div>
              </div>
          </div>
      </header>

      {/* SPACE RINGS BACKDROP */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div class="orbital-ring w-[400px] h-[400px]" style={{ animationDuration: '20s' }}></div>
          <div class="orbital-ring w-[700px] h-[700px] border-purple-400/10" style={{ animationDuration: '35s', animationDirection: 'reverse' }}></div>
      </div>

      {/* 🚀 MAIN CONTENT BODY */}
      <main className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-4 z-10 relative">
        
        {/* UPPER HERO VIEW (Fades out when chat starts) */}
        {!isChatStarted && (
          <div className="text-center my-auto py-8">
            <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              AATOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">INTELLIGENCE</span>
            </h1>
            <p className="text-gray-400 text-base max-w-md mx-auto font-rajdhani">
              Harness the power of real-time server synthesis with elite space telemetry node interfaces.
            </p>
          </div>
        )}

        {/* 💬 CHAT BOX (Occupies space when chat expands) */}
        {isChatStarted && (
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[65vh] mb-4 mt-2">
            {history.map((item, index) => (
              <div key={index} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`holo-card rounded-xl p-4 max-w-2xl text-base ${item.type === 'user' ? 'border-r-4 border-r-cyan-400 bg-cyan-500/5' : 'border-l-4 border-l-purple-500 bg-purple-500/5'}`}>
                  <div className="flex items-center gap-2 mb-1.5 font-orbitron text-xs font-bold text-cyan-400">
                    <span>{item.type === 'user' ? 'COMMANDER' : 'AATOS CORE'}</span>
                  </div>
                  <p className="text-gray-200 font-rajdhani leading-relaxed whitespace-pre-line">{item.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="holo-card rounded-xl p-4 w-32 flex items-center justify-center">
                  <span className="text-xs font-mono text-cyan-400 animate-pulse">THINKING...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* 🎛️ MOVING INTERFACE INPUT CONTROL BOX (Gemini Style Box Movement) */}
        <div className={`w-full transition-all duration-500 ease-in-out ${!isChatStarted ? 'my-auto max-w-2xl mx-auto' : 'mt-auto'}`}>
          <div className="glass-panel border border-cyan-500/20 rounded-2xl p-4 shadow-2xl">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input 
                type="text" 
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Ask anything about the cosmos, code, or operational vectors..." 
                className="flex-1 bg-space-900/60 border border-cyan-500/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 transition-all outline-none"
              />
              <button type="submit" className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all group shadow-lg">
                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
