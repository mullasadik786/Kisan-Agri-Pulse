import React, { useState } from 'react';

export default function App() {
  const [brightness, setBrightness] = useState('45%');
  const [theme, setTheme] = useState('dark');
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

  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'bot', text: 'Namaste! I am Kisan-AgriPulse Mitra, representing the Digital Agriculture Mission. Ask me about MSP rates, MeeBhoomi links, or CCRC regulations!' }
  ]);

  const handleMeeBhoomiSync = () => {
    setSyncLoading(true);
    setTimeout(() => {
      setSyncLoading(false);
      alert("MeeBhoomi Land Records Synced Successfully!");
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Processing your request with AgriPulse Database...";
      if (userMsg.includes('CCRC') || userMsg.includes('????')) {
        reply = "?????? ??????? ???? ????, ?? CCRC ???? ????? ????????? ????????? ????. ??? ???????? ?????? '??????? ??????' ???? ????????? ???? ??????????.";
      } else if (userMsg.includes('MSP') || userMsg.includes('??????')) {
        reply = "??????? ???? ?????? (Teja) ???????? MSP ?21500 ??????????? ????. ????? ??????????? ?????? ???? ????????? ?24500 ??????????.";
      }
      setChatLog(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 500);
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-zinc-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`} style={{ filter: `brightness(${brightness === '45%' ? 0.9 : brightness === '15%' ? 0.7 : 1.1})` }}>
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center border-b border-zinc-700 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-500 tracking-wide">?? Kisan-AgriPulse</h1>
          <p className="text-sm text-slate-400">One Unified AI Hub For India's Farmers | Ideathon WorkSpace</p>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-3 py-1 text-xs font-bold rounded bg-zinc-700 text-white uppercase">{theme}</button>
          <select value={brightness} onChange={(e) => setBrightness(e.target.value)} className="bg-zinc-700 text-white text-xs px-2 py-1 rounded">
            <option value="15%">Soft (15%)</option>
            <option value="45%">Balanced (45%)</option>
            <option value="75%">Vivid (75%)</option>
          </select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-800/50">
            <span className="text-xs font-bold text-emerald-400 block mb-2">GOVERNMENT AGRI-STACK GATEWAY</span>
            <h2 className="text-xl font-bold">{landRecords.farmerName}</h2>
            <p className="text-xs text-slate-400 mb-3">ID: {landRecords.farmerId}</p>
            <div className="text-sm space-y-1 text-slate-300 border-t border-zinc-700 pt-3">
              <p>?? <strong>Location:</strong> Nellore, Andhra Pradesh</p>
              <p>?? <strong>Land Area:</strong> {landRecords.landArea}</p>
              <p>?? <strong>Sowing Season:</strong> Kharif (Paddy, Cotton)</p>
            </div>
            <button onClick={handleMeeBhoomiSync} className="w-full mt-4 bg-emerald-600 text-white text-xs font-bold py-2 rounded">
              {syncLoading ? "Syncing..." : "?? Update & Sync MeeBhoomi Records"}
            </button>
          </div>

          <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-800/50">
            <span className="text-xs font-bold text-blue-400 block mb-3">MeeBhoomi Sync Vault</span>
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900 rounded border border-zinc-700">
                <p className="text-xs font-semibold text-slate-300">Adangal Form (????? ??????)</p>
                <p className="text-xs text-slate-500">Survey No: {landRecords.surveyNo}</p>
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
                {!ccrcApplied && <button onClick={() => { setCcrcApplied(true); setLandRecords(p => ({...p, ccrcStatus: "Applied via Aadhaar"})); }} className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded">Apply</button>}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-xl text-amber-200">
            <p className="text-xs font-bold">?? IMD BLOCK ALERT DISPATCH (NELLORE)</p>
            <p className="text-sm mt-1">Unseasonal heavy showers mapped this week. Delayed chemical inputs advised immediately.</p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-800/50 flex flex-col h-[350px]">
            <span className="text-xs font-bold text-purple-400 block mb-2">?? Kisan-AgriPulse AI Mitra Chat</span>
            <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-zinc-900 rounded-lg text-sm mb-3">
              {chatLog.map((msg, idx) => (
                <div key={idx} className={`p-2 rounded-lg max-w-[85%] ${msg.sender === 'bot' ? 'bg-zinc-800 text-slate-200' : 'bg-emerald-950 text-emerald-100 ml-auto text-right'}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setChatInput("???? ??????? CCRC ????")} className="text-[10px] bg-zinc-700 px-2 py-1 rounded text-slate-300">?? CCRC Benefits</button>
              <button onClick={() => setChatInput("?????? MSP ?? ????")} className="text-[10px] bg-zinc-700 px-2 py-1 rounded text-slate-300">?? Chilli MSP</button>
            </div>
            <div className="flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask AI Mitra..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm text-white" />
              <button onClick={handleSendMessage} className="bg-purple-600 text-white font-bold px-4 py-1 rounded text-sm">Send</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
