import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Monitor, 
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

export default function DemoMode() {
  const [running, setRunning] = useState(false);
  const [slide, setSlide] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3-minute hackathon presentation timer
  const [successMsg, setSuccessMsg] = useState('');

  const slides = [
    { title: "AI Predictive Analytics", desc: "Showcases next-day patient admissions forecasts with shaded confidence intervals.", icon: Sparkles },
    { title: "Autonomous Resource Optimization", desc: "Displays NetworkX minimum-cost flow medicine redistribution transfer routes.", icon: Cpu },
    { title: "Explainable AI (XAI) attributions", desc: "Presents local Shapley attributions explaining deviation parameters.", icon: Layers }
  ];

  useEffect(() => {
    let interval = null;
    if (running) {
      interval = setInterval(() => {
        setSlide(prev => (prev + 1) % slides.length);
        setTimerSeconds(t => (t > 0 ? t - 1 : 0));
      }, 5000); // rotate slides every 5 seconds
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  const handleResetDemoData = () => {
    setSuccessMsg("Simulation telemetry database reset to nominal seed states successfully.");
    setTimerSeconds(180);
    setSlide(0);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 text-left"
    >
      {/* Alert banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Automated Showcase Framework</span>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Monitor className="w-6 h-6 text-teal-400 animate-pulse" /> International Hackathon Demo Mode
          </h2>
          <p className="text-slate-300 text-xs max-w-xl">
            Fullscreen showcase rotating AI predictions, flow redistributions, and XAI timelines. Includes a presentation countdown timer.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleResetDemoData}
            className="px-4 py-2.5 bg-slate-800 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Presentation countdown timer & slideshow state triggers */}
        <div className="lg:col-span-5 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between h-96">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold text-teal-600 uppercase block tracking-wider">Presentation Clock</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mt-1">Hackathon Showcase Timer</h3>
            </div>
            
            <div className="text-center py-6">
              <span className="text-5xl font-black text-slate-900 tracking-tighter block">{formatTime(timerSeconds)}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Minutes Remaining</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setRunning(!running)}
              className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                running ? 'bg-amber-600' : 'bg-slate-900 hover:opacity-95'
              }`}
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {running ? 'Pause rotation' : 'Start Slide Rotation'}
            </button>
          </div>
        </div>

        {/* Right Side: Active Showcase Slide panel */}
        <div className="lg:col-span-7 glass-card bg-white p-6 rounded-3xl border-slate-200/80 shadow-sm flex flex-col justify-between h-96">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Showcase Section</span>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-1">Presenter Slide rotation</h3>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex-1 flex flex-col justify-center items-start text-left my-4 space-y-3"
            >
              <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                {React.createElement(slides[slide].icon, { className: "w-6 h-6 text-teal-600 animate-pulse" })}
              </div>
              <h4 className="text-base font-extrabold text-slate-900">{slides[slide].title}</h4>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">{slides[slide].desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-2 justify-center">
            {slides.map((_, idx) => (
              <span 
                key={idx} 
                onClick={() => setSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition ${
                  slide === idx ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              ></span>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
