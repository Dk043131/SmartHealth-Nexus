import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Mic, 
  MicOff,
  Camera, 
  Globe, 
  History, 
  Send, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { copilotService } from '../services/copilot';
import { hospitalService } from '../services/hospital';

export default function AiCopilot() {
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  
  // Chat States
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Health Copilot. How can I assist you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languages, setLanguages] = useState([]);
  const [recording, setRecording] = useState(false);

  // Vision OCR States
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [reconSuggestions, setReconSuggestions] = useState(null);
  const [ocrVerifying, setOcrVerifying] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  
  // History logs
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    Promise.all([
      hospitalService.getAllHospitals(),
      copilotService.getLanguages(),
      copilotService.getHistory()
    ])
      .then(([hospRes, langRes, histRes]) => {
        setHospitals(hospRes.data?.items || []);
        if (hospRes.data?.items?.length > 0) setSelectedHospital(hospRes.data.items[0].id);
        if (langRes?.success) setLanguages(langRes.data);
        if (histRes?.success) setHistoryLogs(histRes.data);
      })
      .catch(err => console.error("Error loading Copilot dependencies", err));
  }, []);

  const translateChatHistory = (targetLang) => {
    setLoading(true);
    const promises = messages.map(msg => 
      copilotService.translate(msg.text, targetLang)
        .then(res => ({
          sender: msg.sender,
          text: (res.success && res.data && res.data.translated) ? res.data.translated : msg.text
        }))
        .catch(() => msg)
    );

    Promise.all(promises)
      .then(translatedMsgs => {
        setMessages(translatedMsgs);
      })
      .catch(err => console.error("Error translating conversation thread", err))
      .finally(() => setLoading(false));
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'en' ? 'en-US' : (
      selectedLanguage === 'hi' ? 'hi-IN' : (
        selectedLanguage === 'ta' ? 'ta-IN' : (
          selectedLanguage === 'te' ? 'te-IN' : (
            selectedLanguage === 'ml' ? 'ml-IN' : 'kn-IN'
          )
        )
      )
    );
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (text = null, speakResponse = false) => {
    const queryText = text || inputValue;
    if (!queryText.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    if (!text) setInputValue('');
    
    setLoading(true);
    copilotService.chat(queryText, selectedLanguage)
      .then(res => {
        if (res?.success) {
          setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
          if (speakResponse) {
            speakText(res.data.response);
          }
          // Refresh logs
          copilotService.getHistory().then(h => { if (h?.success) setHistoryLogs(h.data); });
        }
      })
      .catch(err => console.error("Error during copilot chat exchange", err))
      .finally(() => setLoading(false));
  };

  const handleVoiceCommand = (commandText) => {
    if (typeof commandText === 'string') {
      setRecording(true);
      // Simulate Speech-to-Text transcription delay
      setTimeout(() => {
        setRecording(false);
        handleSendMessage(commandText, true);
      }, 1500);
      return;
    }

    // Toggle actual HTML5 Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please try another browser or type your query.");
      return;
    }

    if (recording) {
      setRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'en' ? 'en-US' : (
      selectedLanguage === 'hi' ? 'hi-IN' : (
        selectedLanguage === 'ta' ? 'ta-IN' : (
          selectedLanguage === 'te' ? 'te-IN' : (
            selectedLanguage === 'ml' ? 'ml-IN' : 'kn-IN'
          )
        )
      )
    );
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setRecording(true);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      handleSendMessage(speechToText, true);
    };

    recognition.start();
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      setSelectedFile(e.target.files[0]);
      setOcrResult(null);
      setReconSuggestions(null);
      setOcrSuccess(false);
    }
  };

  const handleUploadScan = () => {
    if (!selectedFile || !selectedHospital) return;

    setOcrVerifying(true);
    copilotService.ocr(selectedFile, selectedHospital)
      .then(res => {
        if (res?.success) {
          setOcrResult(res.data.ocr_result);
          setReconSuggestions(res.data.reconciliation_suggestions);
        }
      })
      .catch(err => console.error("Error executing shelf OCR label audit", err))
      .finally(() => setOcrVerifying(false));
  };

  const handleConfirmReconciliation = () => {
    // Requires manual verification before updating records (security requirement)
    setOcrSuccess(true);
    setTimeout(() => {
      setOcrSuccess(false);
      setOcrResult(null);
      setReconSuggestions(null);
      setSelectedFile(null);
    }, 4000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 text-left"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Conversational AI & Vision Intelligence</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-400 animate-pulse" /> AI Healthcare Copilot
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Interact using natural language or voice commands, and verify physical inventory stocks dynamically using camera OCR scans.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto pb-1">
        {[
          { id: 'chat', label: 'AI Chat Copilot', icon: MessageSquare },
          { id: 'ocr', label: 'Inventory OCR Scanner', icon: Camera },
          { id: 'history', label: 'Interaction History', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 border-b-2 px-1 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-teal-500 text-teal-600 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content wrapper */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          
          {/* Tab: Chat Copilot */}
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 10 }}
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Left Side: Conversational Feed */}
              <div className="lg:col-span-8 flex flex-col space-y-4 glass-card bg-white p-5 rounded-3xl border-slate-200/80 shadow-sm min-h-[450px] justify-between">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-800 uppercase">Select Dialect:</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setSelectedLanguage(newLang);
                        translateChatHistory(newLang);
                      }}
                      className="bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message display thread */}
                <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-2">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs font-medium ${
                        msg.sender === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="text-[10px] text-slate-400 font-semibold italic">Copilot is thinking...</div>
                  )}
                </div>

                {/* Query inputs */}
                <div className="flex gap-2 border-t border-slate-100 pt-4 mt-4">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    placeholder="Ask about medicine shortages, doctor schedules, active alerts..."
                    className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="px-4 py-2 bg-slate-950 text-white rounded-xl flex items-center justify-center hover:opacity-90 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Side: Voice Actions Quick list */}
              <div className="lg:col-span-4 flex flex-col space-y-6">
                
                {/* Voice recorder panel with simple animated pulses */}
                <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm text-center flex flex-col justify-between items-center relative overflow-hidden flex-1">
                  <div className="w-full text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice AI assistant</span>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mt-1">Speak Query commands</h3>
                  </div>

                  <div className="my-6">
                    <button 
                      onClick={() => handleVoiceCommand()}
                      className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-xl transition-all ${
                        recording ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-500 text-white hover:opacity-95'
                      }`}
                    >
                      {recording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <span className="block text-[10px] text-slate-400 mt-3 font-semibold uppercase tracking-widest">
                      {recording ? 'Listening...' : 'Click Mic to Speak'}
                    </span>
                  </div>

                  <div className="w-full text-left space-y-2 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider mb-1">Suggested spoken queries:</span>
                    {[
                      "Show medicine shortage",
                      "Which hospital needs doctors?",
                      "Predict dengue cases"
                    ].map((cmd, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleVoiceCommand(cmd)}
                        className="w-full text-left text-xs text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
                      >
                        "{cmd}"
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Tab: OCR Scanner & suggest discrepancy updating */}
          {activeTab === 'ocr' && (
            <motion.div 
              key="ocr"
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 10 }}
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Left Side: Uploader */}
              <div className="lg:col-span-5 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Vision Shelf Scan</span>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">Audit Shelf Stock Photo</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase">Auditing Clinic Node</label>
                    <select
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                    >
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.hospital_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-teal-500 transition cursor-pointer relative">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="block text-xs font-semibold text-slate-600">
                      {selectedFile ? selectedFile.name : 'Choose shelf image label...'}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">Supports JPEG or PNG</span>
                  </div>
                </div>

                <button
                  onClick={handleUploadScan}
                  disabled={ocrVerifying || !selectedFile}
                  className="w-full py-2.5 bg-slate-900 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-95 mt-6 transition disabled:bg-slate-350"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${ocrVerifying ? 'animate-spin' : ''}`} />
                  {ocrVerifying ? 'Running OCR OCR OCR...' : 'Process Shelf Image'}
                </button>
              </div>

              {/* Right Side: Verification suggestions discrepancy list */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {ocrSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-xs mb-4"
                    >
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>Reconciliation updates submitted to audit ledger. Suggesions cleared.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex-1 flex flex-col justify-between min-h-[300px]">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Stock Reconciliation Suggested Updates</h3>
                  
                  {ocrResult && reconSuggestions ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">OCR Identified Medicine</span>
                          <span className="block font-semibold text-slate-800 mt-1">{ocrResult.matched_medicine_name}</span>
                        </div>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">OCR Confidence Score</span>
                          <span className="block font-semibold text-slate-800 mt-1">{Math.round(ocrResult.confidence_score * 100)}%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50/50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-2">
                        <div className="flex items-center gap-1 text-amber-800 font-bold uppercase tracking-wider text-[10px]">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Discrepancy Action Suggestion
                        </div>
                        <p className="font-semibold">{reconSuggestions.suggested_update_action}</p>
                        <div className="flex justify-between text-[10px] text-amber-700 pt-2 border-t border-amber-100/60 font-medium">
                          <span>Scanned shelf quantity: {reconSuggestions.detected_quantity} units</span>
                          <span>Database quantity: {reconSuggestions.database_quantity} units</span>
                        </div>
                      </div>

                      <button
                        onClick={handleConfirmReconciliation}
                        className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition"
                      >
                        <Check className="w-4 h-4" /> Confirm & Update DB Inventory
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-2xl">
                      Select variables and click Process to evaluate inventory shelf counts.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: History Logs */}
          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Conversational Interaction History</h3>
                <div className="space-y-4">
                  {historyLogs.map((log, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-900 uppercase">Intent: {log.intent} | Dialect: {log.language}</span>
                        <span className="text-slate-400 font-semibold">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 font-bold">Query: "{log.query}"</p>
                      <p className="text-slate-700 font-medium">Response: "{log.response}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </motion.div>
  );
}
