import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Database, Cpu, ArrowRight, Layers, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-height-screen w-full flex flex-col gradient-mesh">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/10">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">SMARTHEALTH</span>
            <span className="font-extrabold text-teal-600 text-lg ml-1 tracking-tight">NEXUS</span>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition duration-200 flex items-center gap-2 shadow-sm"
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-slate-700 font-medium text-sm hover:bg-white hover:border-slate-300 transition duration-200"
              >
                Log In
              </Link>
              <Link
                to="/login?register=true"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-medium text-sm hover:opacity-95 transition duration-200 shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 flex flex-col items-start text-left space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 font-semibold text-xs tracking-wide uppercase">
              <Cpu className="w-3.5 h-3.5" /> District Health Intelligence System
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              AI-Powered Intelligence <br />
              for <span className="medical-gradient-text">District Healthcare Systems</span>
            </h1>
            
            <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
              Connecting multiple Primary Health Centres (PHCs) and Community Health Centres (CHCs) to monitor medicine stock, beds, doctors, and patients, enabling real-time district-wide coordination.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <Link
                to={user ? "/dashboard" : "/login"}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold text-center hover:opacity-95 transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/15"
              >
                Enter Command Center <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md text-slate-700 font-semibold text-center hover:bg-slate-50 transition duration-200 flex items-center justify-center gap-2"
              >
                Explore Modules
              </a>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8 w-full border-t border-slate-200/60">
              <div>
                <span className="block text-2xl font-bold text-slate-800 tracking-tight">PHCs & CHCs</span>
                <span className="text-slate-500 text-sm">Unified Network</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-800 tracking-tight">Real-Time</span>
                <span className="text-slate-500 text-sm">Stock & Bed Telemetry</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-800 tracking-tight">Autonomous</span>
                <span className="text-slate-500 text-sm">AI Insights Ready</span>
              </div>
            </div>
          </div>

          {/* Graphical Right Panel */}
          <div className="md:col-span-5 flex justify-center animate-fade-in-up animation-delay-100">
            <div className="relative w-full max-w-md aspect-square">
              {/* Decorative glass elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-blue-500/15 rounded-3xl -rotate-3 border border-teal-500/10"></div>
              
              <div className="relative h-full glass-card rounded-3xl p-8 flex flex-col justify-between border-slate-200/80 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">NEXUS MAIN GATEWAY</span>
                  </div>
                  <Layers className="w-5 h-5 text-slate-400" />
                </div>

                {/* Central Visual Graphic */}
                <div className="my-8 flex flex-col items-center justify-center flex-1">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-teal-500/30 mb-6">
                    <Activity className="w-12 h-12 text-white animate-pulse" />
                  </div>
                  <h3 className="text-slate-800 font-bold text-lg text-center">Autonomous Coordination</h3>
                  <p className="text-slate-500 text-xs text-center max-w-xs mt-2">
                    Continuously synchronizing primary care data points across the district for centralized analysis and threat notifications.
                  </p>
                </div>

                {/* System Stats Block */}
                <div className="bg-slate-50/80 border border-slate-100/80 rounded-2xl p-4 flex justify-between items-center text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-medium">Gateway Protocol</span>
                      <span className="text-xs font-bold text-slate-700">AES-256 Auth Enabled</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-600 px-2 py-1 rounded bg-teal-50">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Modules Section */}
      <section id="features" className="w-full py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Command Architecture Modules
            </h2>
            <p className="text-slate-600 mt-2">
              Designed as a modular, scalable architecture to host future predictive intelligence frameworks.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">Resource Telemetry</h3>
              <p className="text-slate-500 text-sm mt-2">
                Live monitoring of beds, doctor availability, and outpatient queues across all district facilities.
              </p>
            </div>

            <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">Logistics Hub</h3>
              <p className="text-slate-500 text-sm mt-2">
                Tracking medicine inventories, critical vaccines, and supply chain logistics to prevent stock-outs.
              </p>
            </div>

            <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">Patient Allocation</h3>
              <p className="text-slate-500 text-sm mt-2">
                Managing transfer requests and clinical occupancy statuses during emergency outbreaks.
              </p>
            </div>

            <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">AI Predictive Engine</h3>
              <p className="text-slate-500 text-sm mt-2">
                (Future Module) Forecasting inventory shortages and disease outbreaks using machine learning algorithms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-100 text-center bg-slate-50/50 text-slate-500 text-sm">
        <p>© 2026 SmartHealth Nexus. Built for global health intelligence competitions.</p>
      </footer>
    </div>
  );
}
