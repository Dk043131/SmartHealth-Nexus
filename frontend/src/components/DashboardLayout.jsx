import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Activity, 
  LayoutDashboard, 
  Building2, 
  Package, 
  Users, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Lock,
  ChevronDown,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Bed,
  Stethoscope,
  Ambulance,
  Bell,
  FileText,
  Cpu,
  MessageSquare,
  Server,
  Settings,
  Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1200);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'DISTRICT_ADMIN':
        return {
          text: 'District Admin',
          classes: 'bg-indigo-50 border-indigo-200 text-indigo-700'
        };
      case 'PHC_STAFF':
        return {
          text: 'PHC/CHC Staff',
          classes: 'bg-teal-50 border-teal-200 text-teal-700'
        };
      case 'GOV_HEALTH_OFFICER':
        return {
          text: 'Health Officer',
          classes: 'bg-blue-50 border-blue-200 text-blue-700'
        };
      default:
        return {
          text: 'Staff',
          classes: 'bg-slate-50 border-slate-200 text-slate-700'
        };
    }
  };

  const badge = getRoleBadge(user?.role);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      disabled: false
    },
    {
      name: 'Hospitals',
      icon: Building2,
      path: '/dashboard/hospitals',
      disabled: false
    },
    {
      name: 'Bed Capacity',
      icon: Bed,
      path: '/dashboard/beds',
      disabled: false
    },
    {
      name: 'Doctor Attendance',
      icon: Stethoscope,
      path: '/dashboard/doctors',
      disabled: false
    },
    {
      name: 'Ambulance Monitor',
      icon: Ambulance,
      path: '/dashboard/ambulances',
      disabled: false
    },
    {
      name: 'Inventory Logistics',
      icon: Package,
      path: '/dashboard/inventory',
      disabled: false
    },
    {
      name: 'Patient Telemetry',
      icon: Users,
      path: '/dashboard/patients',
      disabled: false
    },
    {
      name: 'Alert Center',
      icon: Bell,
      path: '/dashboard/alerts',
      disabled: false
    },
    {
      name: 'Reporting Hub',
      icon: FileText,
      path: '/dashboard/reports',
      disabled: false
    },
    {
      name: 'AI Insights Engine',
      icon: TrendingUp,
      path: '/dashboard/ai-insights',
      disabled: false
    },
    {
      name: 'Resource Optimization',
      icon: Cpu,
      path: '/dashboard/optimization',
      disabled: false
    },
    {
      name: 'AI Trust & Auditing',
      icon: ShieldCheck,
      path: '/dashboard/ai-transparency',
      disabled: false
    },
    {
      name: 'AI Healthcare Copilot',
      icon: MessageSquare,
      path: '/dashboard/copilot',
      disabled: false
    },
    {
      name: 'Citizen Portal',
      icon: Building2,
      path: '/dashboard/citizen',
      disabled: false
    },
    {
      name: 'Sync Center',
      icon: RefreshCw,
      path: '/dashboard/sync',
      disabled: false
    },
    {
      name: 'Security Activity',
      icon: Lock,
      path: '/dashboard/security',
      disabled: false
    },
    {
      name: 'System Operations',
      icon: Server,
      path: '/dashboard/operations',
      disabled: false
    },
    {
      name: 'System Settings',
      icon: Settings,
      path: '/dashboard/admin',
      disabled: false
    },
    {
      name: 'Export Center',
      icon: FileText,
      path: '/dashboard/export',
      disabled: false
    },
    {
      name: 'Hackathon Demo Mode',
      icon: Monitor,
      path: '/dashboard/demo',
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between w-full">
        {/* Left: Mobile hamburger + Project name */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 md:hidden transition"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center shadow-md shadow-teal-500/10">
              <Activity className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm tracking-tight">SmartHealth</span>
              <span className="font-extrabold text-teal-600 text-sm ml-0.5 tracking-tight">Nexus</span>
            </div>
          </div>

          {/* System Health Pulse Indicator */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-800 ml-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">District Core: Online</span>
            <span className="sm:hidden">Online</span>
          </div>

          {/* Sync Trigger button */}
          <button 
            onClick={triggerSync}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            title="Sync telemetry data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>

        {/* Right: User menu & details */}
        <div className="flex items-center gap-4">
          {/* User Role Badge */}
          {user && (
            <span className={`px-2.5 py-0.5 border rounded-full text-xs font-semibold uppercase tracking-wider ${badge.classes}`}>
              {badge.text}
            </span>
          )}

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200/60 rounded-xl transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold text-sm">
                {user?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-slate-700 leading-tight">{user?.name}</span>
                <span className="block text-[10px] text-slate-400 leading-none">{user?.email}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <>
                {/* Backdrop closer */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileDropdownOpen(false)}
                />
                
                {/* Dropdown Card */}
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200/80 shadow-xl py-2 z-50 animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-slate-100 text-left">
                    <span className="block text-xs font-semibold text-slate-400">Account Credentials</span>
                    <span className="block text-xs font-bold text-slate-700 truncate mt-0.5">{user?.name}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{user?.email}</span>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50/50 flex items-center gap-2 font-semibold transition"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (Sidebar hidden on mobile, visible on medium screens) */}
        <aside className="w-64 border-r border-slate-200/60 bg-white/70 backdrop-blur-md hidden md:flex flex-col p-4 shrink-0 justify-between">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block pl-3">
              District Telemetry
            </span>
            <nav className="space-y-1">
              {menuItems.map((item, idx) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <div key={idx} className="relative">
                    {item.disabled ? (
                      <div 
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed opacity-60 text-sm"
                        title={`${item.name} is a future module`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[8px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Future
                          </span>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                          isActive 
                            ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-600' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Bottom Security Info Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <div className="flex gap-2">
              <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="block text-[11px] font-bold text-slate-700">Protected Node</span>
                <span className="block text-[9px] text-slate-400 mt-0.5">District Level Auth Node #01</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop Closer */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer body */}
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white flex flex-col p-5 shadow-2xl animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm">SmartHealth</span>
                    <span className="font-extrabold text-teal-600 text-sm ml-0.5">Nexus</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block pl-3 mb-2">
                District Telemetry
              </span>

              <nav className="flex-1 space-y-1">
                {menuItems.map((item, idx) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <div key={idx}>
                      {item.disabled ? (
                        <div 
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 cursor-not-allowed opacity-60 text-sm"
                          title="Future module placeholder"
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComponent className="w-4 h-4 shrink-0" />
                            <span>{item.name}</span>
                          </div>
                          <span className="text-[8px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                            Future
                          </span>
                        </div>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                            isActive 
                              ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-600' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>

              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 mt-auto rounded-xl text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-bold transition"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </aside>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
