import React, { useState, useEffect } from 'react';

export default function App() {
  // Theme & UI States
  const [brightness, setBrightness] = useState('45%');
  const [theme, setTheme] = useState('dark');
  
  // MeeBhoomi & AgriStack State
  const [syncLoading, setSyncLoading] = useState(false);
  const [ccrcApplied, setCcrcApplied] = useState(false);
  const [landRecords, setLandRecords] = useState({
    farmerName: "Y. Prasad Rao",
    farmerId: "AP-90827364-5028",
    surveyNo: "442-A/1",
    khatauniId: "90283",
    landArea: "1.8 Hectares (~4.4 Acres)",
    ccrcStatus: "Tenant Verification Pending"
  });

  // Weather Alert State
  const [weatherAlert, setWeatherAlert] = useState({
    active: true,
    message: "Unseasonal heavy showers mapped this week. Delayed chemical inputs advised immediately by block agronomist offset."
  });

  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'bot', text: 'Namaste! I am Kisan-AgriPulse Mitra, representing the Digital Agriculture Mission. I am programmed with up-to-date MSP rates, government links like MeeBhoomi, soil management advice, and CCRC tenant regulations. Ask me anything!' }
  ]);

  // Handle MeeBhoomi Live Sync
  const handleMeeBhoomiSync = async () => {
    setSyncLoading(true);
    // Mimicking network call to server.ts
    setTimeout(() => {
      setSyncLoading(false);
      alert("MeeBhoomi Land Records Synced Successfully via AgriStack Verified ID!");
    }, 1200);
  };

  // Handle CCRC Application Action
  const handleCcrcApply = () => {
    setCcrcApplied(true);
    setLandRecords(prev => ({ ...prev, ccrcStatus: "Applied via Aadhaar - Under Review" }));
  };

  // Handle AI Chat Send
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Simulated local processing rule from backend logic
    setTimeout(() => {
      let reply = "I am processing your query regarding agriculture updates...";
      if (userMsg.toLowerCase().includes('ccrc') || userMsg.includes('????') || userMsg.includes('???????')) {
        reply = "?????? ??????? ???? ????, ?? CCRC ???? ????? ????????? ????????? ????. ??? ???????? ?????? '??????? ??????' ???? ?????? ????????? ???? ?? ?????? ?? ???????????.";
      } else if (userMsg.toLowerCase().includes('msp') || userMsg.includes('??')) {
        reply = "??????? ???? ?????? (Teja) ???????? MSP ?21500 ??????????? ????. ????? ??????????? ?????? ???? ????????? ?24500 ?? ??????????.";
      }
      setChatLog(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 800);
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-zinc-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`} style={{ filter: `brightness(${brightness === '45%' ? 0.9 : brightness === '15%' ? 0.7 : 1.1})` }}>
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center border-b border-zinc-700 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-500 tracking-wide">?? Kisan-AgriPulse</h1>
          <p className="text-sm text-slate-400">One Unified AI Hub For India's Farmers | Ideathon WorkSpace</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
          <label className="text-xs font-bold">Theme:</label>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-3 py-1 text-xs font-bold rounded bg-zinc-700 text-white uppercase">{theme}</button>
          <label className="text-xs font-bold">Brightness:</label>
          <select value={brightness} onChange={(e) => setBrightness(e.target.value)} className="bg-zinc-700 text-white text-xs px-2 py-1 rounded">
            <option value="15%">Soft (15%)</option>
            <option value="45%">Balanced (45%)</option>
            <option value="75%">Vivid (75%)</option>
          </select>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Identity & Land Registry Sync */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Farmer Identity */}
          <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-800/50 shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">GOVERNMENT AGRI-STACK GATEWAY</span>
            <h2 className="text-xl font-bold">{landRecords.farmerName}</h2>
            <p className="text-xs text-slate-400 mb-3">ID: {landRecords.farmerId}</p>
            <div className="text-sm space-y-1 text-slate-300 border-t border-zinc-700 pt-3">
              <p>?? <strong>Location:</strong> Nellore, Andhra Pradesh</p>
              <p>?? <strong>Land Area:</strong> {landRecords.landArea}</p>
              <p>?? <strong>Sowing Season:</strong> Kharif (Paddy, Cotton)</p>
            </div>
            <button onClick={handleMeeBhoomiSync} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded transition-colors">
              {syncLoading ? "Syncing API Databases..." : "?? Update & Sync MeeBhoomi Records"}
            </button>
          </div>

          {/* MeeBhoomi Sync Vault */}
          <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-800/50 shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-3">MeeBhoomi Sync Vault</span>
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900 rounded border border-zinc-700">
                <p className="text-xs font-semibold text-slate-300">Adangal Form (????? ??????)</p>
                <p className="text-xs text-slate-500">Survey No: {landRecords.surveyNo}, Nellore-Sadar</p>
              </div>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-700">
                <p className="text-xs font-semibold text-slate-300">1B Record (???? ????? 1B)</p>
                <p className="text-xs text-slate-500">Khatauni ID: {landRecords.khatauniId}</p>
              </div>
              <div className="p-3 bg-zinc-900 rounded border border-zinc-700 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-slate-300">CCRC Status Card</p>
                  <p className="text-xs text-amber-400">{landRecords.ccrcStatus}</p>
                </div>
                {!ccrcApplied && (
                  <button onClick={handleCcrcApply} className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded hover:bg-blue-500">Apply</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Live Alerts, MSP Pricing, and AI Mitra Chat */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* IMD Alert Dispatch */}
          {weatherAlert.active && (
            <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-xl text-amber-200 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="animate-pulse h-2 w-2 rounded-full bg-amber-400 inline-block"></span>
                <span className="text-xs font-bold tracking-wider uppercase">IMD BLOCK ALERT DISPATCH (NELLORE)</span>
              </div>
              <p className="text-sm mt-1">{weatherAlert.message}</p>
            </div>
          )}

          {/* AI Mitra Chatbot Simulator */}
          <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-800/50 flex flex-col flex-1 h-[400px]">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-2">?? Kisan-AgriPulse AI Mitra Chat</span>
            
            {/* Chat Output Log */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 mb-3 text-sm">
              {chatLog.map((msg, index) => (
                <div key={index} className={`p-3 rounded-lg max-w-[85%] ${msg.sender === 'bot' ? 'bg-zinc-800 text-slate-200 self-start' : 'bg-emerald-950 text-emerald-100 self-end ml-auto'}`}>
                  <strong>{msg.sender === 'bot' ? '?? AI Mitra: ' : '????? Farmer: '}</strong>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Prompts Helper */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => setChatInput("???? ??????? CCRC ?????? ??????? ?????????? ????????")} className="text-[11px] bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-slate-300">?? Ask about CCRC Benefits</button>
              <button onClick={() => setChatInput("?????? ???????? MSP ?? ????")} className="text-[11px] bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-slate-300">?? Ask about Chilli MSP</button>
            </div>

            {/* Chat Input Bar */}
            <div className="flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask in Hindi, Telugu, or English (e.g. CCRC status or MSP rates)..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              <button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded text-sm transition-colors">Send</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
