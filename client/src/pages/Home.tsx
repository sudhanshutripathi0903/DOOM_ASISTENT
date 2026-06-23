import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const [logs, setLogs] = useState<Array<{ text: string; type: "user" | "system" | "warning" }>>([]);
  const [command, setCommand] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-Login check if PIN already exists
  useEffect(() => {
    const savedKey = localStorage.getItem("agent_key");
    if (savedKey === "2005") {
      setAuthKey(savedKey);
      setIsAuthorized(true);
      setLogs([{ text: "🔐 AUTO-AUTHENTICATED: ACCESS GRANTED TO HUMAN_BOSS.", type: "system" }]);
    } else {
      setLogs([{ text: "⚠️ CRITICAL ERR: SYSTEM LOCKED. ENTER 4-DIGIT SECURE PIN.", type: "warning" }]);
    }
  }, []);

  useEffect(() => {
    const bootLines = [
      "INITIALIZING CORES...",
      "ESTABLISHING SECURE TUNNEL...",
      "CONNECTING TO CLOUD NODE...",
      "DECRYPTING SYSTEM PROTOCOLS...",
      "AGENT ACTIVE AND STANDING BY.",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < bootLines.length) {
        setLogs((prev) => [...prev, { text: bootLines[index], type: "system" }]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff66";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [logs]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authKey === "2005") {
      localStorage.setItem("agent_key", authKey);
      setIsAuthorized(true);
      setLogs((prev) => [...prev, { text: "🔓 ACCESS UNLOCKED. WELCOME BACK.", type: "system" }]);
    } else {
      setLogs((prev) => [...prev, { text: "❌ INVALID PIN. ACCESS DENIED.", type: "warning" }]);
    }
  };

  const handleExecute = async () => {
    if (!command.trim() || !isAuthorized) return;
    setLogs((prev) => [...prev, { text: `C:\\USER\\HUMAN> ${command}`, type: "user" }]);
    const currentCmd = command;
    setCommand("");
    setIsProcessing(true);

    try {
      const response = await fetch('https://open-claw-backend.onrender.com/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: currentCmd, token: authKey })
      });
      const data = await response.json();
      
      if (response.ok) {
        setLogs((prev) => [...prev, { text: data.feedback, type: "system" }]);
      } else {
        setLogs((prev) => [...prev, { text: data.error, type: "warning" }]);
      }
    } catch (error) {
      setLogs((prev) => [...prev, { text: "⚠️ CONNECTION FAILED: Server offline.", type: "warning" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'black', color: '#00ff66', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }} />
      
      {/* Top Header */}
      <div style={{ padding: '10px', borderBottom: '1px solid #00ff66', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
        <div>[SYSTEM://CREATIVE_HUMAN_AGNT_v2.6]</div>
        <div>[SYS_STATUS: {isAuthorized ? "ONLINE" : "LOCKED"}]</div>
      </div>

      {/* PIN Box - Sirf tab dikhega jab user login nahi hoga */}
      {!isAuthorized && (
        <form onSubmit={handlePinSubmit} style={{ padding: '10px', borderBottom: '1px solid #00ff66', background: '#050508', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px' }}>[ENTER 4-DIGIT PIN]: </span>
          <input 
            type="password" 
            maxLength={4}
            value={authKey} 
            onChange={(e) => setAuthKey(e.target.value)} 
            placeholder="••••" 
            style={{ background: 'black', border: '1px solid #00ff66', color: '#00ff66', fontSize: '11px', padding: '2px 5px', width: '60px', textAlign: 'center', outline: 'none' }} 
          />
          <button type="submit" style={{ background: 'transparent', border: '1px solid #00ff66', color: '#00ff66', padding: '2px 10px', fontSize: '11px', cursor: 'pointer' }}>
            [UNLOCK]
          </button>
        </form>
      )}

      {/* Terminal Logs View */}
      <div ref={streamRef} style={{ flex: 1, overflowY: 'auto', padding: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {logs.map((log, idx) => (
          <div key={idx} style={{ color: log.type === 'user' ? '#00ffe0' : log.type === 'warning' ? '#ff0033' : '#00ff66' }}>
            {log.text}
          </div>
        ))}
      </div>

      {/* Bottom Command Box */}
      <div style={{ padding: '10px', borderTop: '1px solid #00ff66', background: 'rgba(0,0,0,0.9)', display: 'flex', gap: '5px' }}>
        <span style={{ fontWeight: 'bold' }}>&gt;</span>
        <input 
          type="text" 
          value={command} 
          disabled={!isAuthorized}
          onChange={(e) => setCommand(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleExecute()} 
          placeholder={isAuthorized ? "TYPE COMMAND HERE..." : "SYSTEM LOCKED. UNLOCK ABOVE FIRST."} 
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#00ff66', outline: 'none', fontSize: '12px' }} 
        />
        <button onClick={handleExecute} disabled={!isAuthorized} style={{ background: 'transparent', border: '1px solid #00ff66', color: '#00ff66', padding: '2px 10px', fontSize: '11px', cursor: 'pointer' }}>
          [EXECUTE]
        </button>
      </div>
    </div>
  );
}