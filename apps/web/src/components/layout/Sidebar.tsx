import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Users,
  FileText,
  CreditCard,
  FolderOpen,
  BarChart3,
  History,
  Settings,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'CUSTOMER';

  const adminNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Agents & Users', path: '/users', icon: UserCheck },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Policies', path: '/policies', icon: Shield },
    { name: 'Claims Board', path: '/claims', icon: FileText },
    { name: 'Premium Tracking', path: '/payments', icon: CreditCard },
    { name: 'Documents', path: '/documents', icon: FolderOpen },
    { name: 'Executive Reports', path: '/reports', icon: BarChart3 },
    { name: 'Audit Logs', path: '/audit-logs', icon: History },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  const agentNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Customers', path: '/customers', icon: Users },
    { name: 'Policies', path: '/policies', icon: Shield },
    { name: 'Claims Review', path: '/claims', icon: FileText },
    { name: 'Premiums', path: '/payments', icon: CreditCard },
    { name: 'Documents', path: '/documents', icon: FolderOpen },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const customerNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Policies', path: '/policies', icon: Shield },
    { name: 'File & Track Claims', path: '/claims', icon: FileText },
    { name: 'Pay Premiums', path: '/payments', icon: CreditCard },
    { name: 'My Documents', path: '/documents', icon: FolderOpen },
    { name: 'Profile & Settings', path: '/settings', icon: Settings },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'AGENT' ? agentNav : customerNav;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">INSURECORE</h1>
            <p className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase">Enterprise Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/70 rounded-xl p-3 flex items-center space-x-3 border border-slate-700/60">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
            {user?.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
