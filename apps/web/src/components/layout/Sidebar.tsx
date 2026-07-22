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
  PlusCircle,
  ShieldCheck,
  Headphones,
  CheckSquare,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'CUSTOMER';

  const superAdminNav = [
    { name: 'Executive Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Staff & Roles', path: '/users', icon: UserCheck },
    { name: 'Customer Database', path: '/customers', icon: Users },
    { name: 'Policy Contracts', path: '/policies', icon: Shield },
    { name: 'Claims Oversight', path: '/claims', icon: FileText },
    { name: 'Financial Payments', path: '/payments', icon: CreditCard },
    { name: 'Document Vault', path: '/documents', icon: FolderOpen },
    { name: 'Executive Analytics', path: '/reports', icon: BarChart3 },
    { name: 'System Audit Logs', path: '/audit-logs', icon: History },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  const adminNavGroups = [
    {
      group: 'Dashboard',
      items: [
        { name: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Customer Management',
      items: [
        { name: 'Customers Directory', path: '/customers', icon: Users },
      ],
    },
    {
      group: 'Policy Management',
      items: [
        { name: 'Issue New Policy', path: '/policies/new', icon: PlusCircle },
        { name: 'Active Policies', path: '/policies', icon: Shield },
      ],
    },
    {
      group: 'KYC Management',
      items: [
        { name: 'Pending Verification', path: '/documents', icon: ShieldCheck },
      ],
    },
    {
      group: 'Claims Management',
      items: [
        { name: 'Pending Claims', path: '/claims', icon: FileText },
      ],
    },
    {
      group: 'Document Management',
      items: [
        { name: 'Document Vault', path: '/documents', icon: FolderOpen },
      ],
    },
    {
      group: 'Reports',
      items: [
        { name: 'Premium Collection', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      group: 'System',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const agentNav = [
    { name: 'Agent Desk Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customer Portfolio', path: '/customers', icon: Users },
    { name: 'Submit Policy Proposal', path: '/policies/new', icon: PlusCircle },
    { name: 'Active Customer Policies', path: '/policies', icon: Shield },
    { name: 'Upload Customer KYC', path: '/documents', icon: FolderOpen },
    { name: 'Commission Reports', path: '/reports', icon: BarChart3 },
  ];

  const customerNav = [
    { name: 'My Account Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Buy New Coverage', path: '/policies/new', icon: Sparkles },
    { name: 'My Active Policies', path: '/policies', icon: Shield },
    { name: 'File & Track Claims', path: '/claims', icon: FileText },
    { name: 'Pay Premium & Receipts', path: '/payments', icon: CreditCard },
    { name: 'My KYC Documents', path: '/documents', icon: FolderOpen },
    { name: 'Account Settings', path: '/settings', icon: Settings },
  ];

  const claimsOfficerNav = [
    { name: 'Claims Queue Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Adjudicate Claims', path: '/claims', icon: FileText },
    { name: 'Verify Claim Evidence', path: '/documents', icon: FolderOpen },
    { name: 'Settlement Payments', path: '/payments', icon: CreditCard },
    { name: 'Claims Ratio Reports', path: '/reports', icon: BarChart3 },
  ];

  const underwriterNav = [
    { name: 'Underwriting Desk', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Proposal Review Queue', path: '/policies', icon: Shield },
    { name: 'Issue Approved Policy', path: '/policies/new', icon: PlusCircle },
    { name: 'Risk Assessment KYC', path: '/documents', icon: ShieldCheck },
    { name: 'Underwriting Reports', path: '/reports', icon: BarChart3 },
  ];

  const supportNav = [
    { name: 'Helpdesk Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customer Directory Lookup', path: '/customers', icon: Users },
    { name: 'Policy Contract Search', path: '/policies', icon: Shield },
    { name: 'Claims Status Lookup', path: '/claims', icon: Headphones },
    { name: 'Document Vault View', path: '/documents', icon: FolderOpen },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 border-r border-slate-800">
      <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3 sticky top-0 bg-slate-900 z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide">INSURECORE</h1>
            <p className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">{role.replace('_', ' ')}</p>
          </div>
        </div>

        {/* ADMIN Grouped Navigation */}
        {role === 'ADMIN' ? (
          <div className="p-4 space-y-4">
            {adminNavGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
                  {grp.group}
                </span>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* Standard Role Navigation */
          <nav className="p-4 space-y-1">
            {(role === 'SUPER_ADMIN'
              ? superAdminNav
              : role === 'AGENT'
              ? agentNav
              : role === 'CLAIMS_OFFICER'
              ? claimsOfficerNav
              : role === 'UNDERWRITER'
              ? underwriterNav
              : role === 'CUSTOMER_SUPPORT'
              ? supportNav
              : customerNav
            ).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>

      {/* Role Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="bg-slate-800/70 rounded-xl p-3 flex items-center space-x-3 border border-slate-700/60">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-extrabold text-white">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin Account'}</p>
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider">
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
