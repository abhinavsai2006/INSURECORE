import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Mail, Phone, Lock, Search, Filter, CheckCircle2, Eye, KeyRound, Copy, Building, ShieldAlert, ArrowRight, Activity, Users, Award, Download, X, Layers, Sparkles, CheckSquare, RefreshCw, Smartphone, Laptop, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { api, downloadFile } from '../lib/api';
import { formatDate } from '../lib/utils';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'org' | 'rbac' | 'security'>('directory');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Selected Employee Drawer
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'rbac' | 'security' | 'kpi' | 'audit' | 'documents' | 'actions'>('overview');

  // Create Staff Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creationStep, setCreationStep] = useState<'form' | 'success'>('form');
  const [createdStaffDetails, setCreatedStaffDetails] = useState<any>(null);

  const [newStaff, setNewStaff] = useState({
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@insurecore.com',
    phone: '+91 98200 11223',
    employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
    branch: 'BKC Regional Headquarters, Mumbai',
    role: 'AGENT',
    password: 'Pass#' + Math.floor(10000 + Math.random() * 90000) + '!',
    permissions: {
      viewPolicies: true,
      createPolicies: true,
      approvePolicies: true,
      manageClaims: false,
      exportReports: true,
    },
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users');
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setUsers(list);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePermissionToggle = (key: string) => {
    setNewStaff({
      ...newStaff,
      permissions: {
        ...newStaff.permissions,
        [key as keyof typeof newStaff.permissions]: !newStaff.permissions[key as keyof typeof newStaff.permissions],
      },
    });
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/users', newStaff);
      setCreatedStaffDetails({
        ...newStaff,
        id: res.data.data?.id,
      });
      setCreationStep('success');
      setActionMessage(`Employee ${newStaff.name} (${newStaff.employeeId}) onboarded cleanly.`);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to create staff account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.patch(`/users/${id}/toggle-active`);
      setActionMessage('Employee status updated successfully.');
      fetchUsers();
      if (selectedStaff?.id === id) {
        setSelectedStaff({ ...selectedStaff, isActive: !selectedStaff.isActive });
      }
    } catch (err) {
      alert('Failed to update account status');
    }
  };



  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus =
      !statusFilter || (statusFilter === 'active' ? u.isActive : !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case 'SUPER_ADMIN': return <Badge variant="danger">SUPER ADMIN</Badge>;
      case 'ADMIN': return <Badge variant="active">ADMINISTRATOR</Badge>;
      case 'AGENT': return <Badge variant="info">INSURANCE AGENT</Badge>;
      case 'CUSTOMER': return <Badge variant="neutral">CUSTOMER</Badge>;
      default: return <Badge variant="neutral">{roleStr}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Command Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
              Enterprise Identity & Workforce Center
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Okta / Entra ID Security Framework
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">Workforce Governance & Identity Management</h1>
          <p className="text-slate-500 text-sm font-medium">Manage employees, underwriters, field agents, claims officers, regional managers, & RBAC security credentials.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => { setIsCreateModalOpen(true); setCreationStep('form'); }} variant="primary" className="font-bold shadow-md">
            <Plus className="w-4 h-4 mr-1.5" /> + Onboard Employee
          </Button>
          <Button onClick={() => downloadFile('/reports/export/pdf', 'Workforce_Audit_Report.pdf')} variant="outline" className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Export Audit Log
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center text-xs font-bold text-emerald-800">
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" /> {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {/* Summary Dashboard Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 space-y-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
          <p className="text-3xl font-extrabold">{safeUsers.length}</p>
          <span className="text-[11px] text-blue-400 font-bold block">Across 12 Regional Branches</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active Staff Accounts</span>
          <p className="text-3xl font-extrabold text-slate-900">{safeUsers.filter((u) => u.isActive).length}</p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">99.8% Active Ratio</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Field Agents</span>
          <p className="text-3xl font-extrabold text-slate-900">{safeUsers.filter((u) => u.role === 'AGENT').length}</p>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Licence IRDAI-AG-2026</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Administrators & Officers</span>
          <p className="text-3xl font-extrabold text-slate-900">{safeUsers.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}</p>
          <span className="text-[11px] font-bold text-slate-500">Underwriting & Claims</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Security Health Score</span>
          <p className="text-3xl font-extrabold text-emerald-700">99.8%</p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">MFA & 256-Bit SSL</span>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 space-y-3 bg-white border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search employee by Name, Employee ID, Email, or Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Administrator</option>
              <option value="AGENT">Insurance Agent</option>
              <option value="CUSTOMER">Customer Account</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Enterprise Employee Directory Table */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-md">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
            Loading Enterprise Identity Directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">No Staff Accounts Found</h3>
            <p className="text-xs text-slate-500 font-medium">Clear search filters or onboard a new employee to populate the directory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
                  <th className="p-4">Employee Profile</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Branch & Location</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setDrawerTab('overview');
                    }}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                          {staff.name ? staff.name.split(' ').map((n: string) => n[0]).join('') : 'EM'}
                        </div>
                        <div>
                          <strong className="text-slate-900 text-sm block font-extrabold">{staff.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono block">EMP-{staff.id.slice(0, 6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">{getRoleBadge(staff.role)}</td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-900 font-medium block">{staff.email}</span>
                        <span className="text-[11px] text-slate-500 block">{staff.phone || '+91 98765 43210'}</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <span className="font-bold text-slate-900 block">BKC Headquarters</span>
                      <span className="text-[10px] text-slate-500">Mumbai, Maharashtra</span>
                    </td>

                    <td className="p-4">
                      {staff.isActive ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full border border-emerald-200">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full">
                          LOCKED
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-600">{formatDate(staff.createdAt)}</td>

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setDrawerTab('overview');
                          }}
                          className="font-bold text-xs py-1 px-2.5"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(staff.id)}
                          className="font-bold text-xs py-1 px-2 text-slate-700"
                        >
                          {staff.isActive ? 'Lock' : 'Unlock'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Multi-Tab Employee Profile Drawer */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Top Drawer Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-start border-b border-slate-800">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                    {selectedStaff.name ? selectedStaff.name.split(' ').map((n: string) => n[0]).join('') : 'EM'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-extrabold text-white">{selectedStaff.name}</h2>
                      {getRoleBadge(selectedStaff.role)}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">EMP-{selectedStaff.id.slice(0, 8).toUpperCase()} • BKC Regional HQ, Mumbai</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStaff(null)} className="p-2 text-slate-400 hover:text-white rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Multi-Tab Navigation */}
              <div className="flex items-center overflow-x-auto bg-slate-100 px-6 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'rbac', label: 'RBAC Permissions' },
                  { id: 'security', label: 'Security & Sessions' },
                  { id: 'kpi', label: 'KPI Performance' },
                  { id: 'audit', label: 'Activity Log' },
                  { id: 'documents', label: 'Employee Vault' },
                  { id: 'actions', label: 'Servicing Desk' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                      drawerTab === t.id ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="p-6 space-y-6 text-xs font-medium">
                {drawerTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border rounded-2xl">
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span><strong className="text-slate-900">{selectedStaff.email}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Mobile Phone</span><strong className="text-slate-900">{selectedStaff.phone || '+91 98200 11223'}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Branch Office</span><strong className="text-slate-900">BKC Regional Office, Mumbai</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Account Status</span><strong className="text-emerald-700 font-bold">{selectedStaff.isActive ? 'Active' : 'Locked'}</strong></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'rbac' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Role-Based Access Control (RBAC)</h3>
                    <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                      <div className="flex justify-between items-center"><span>View Policies & Schedules:</span><Badge variant="active">ALLOWED</Badge></div>
                      <div className="flex justify-between items-center"><span>Issue & Activate Policies:</span><Badge variant="active">ALLOWED</Badge></div>
                      <div className="flex justify-between items-center"><span>Underwriting Limit:</span><strong className="text-blue-600 font-extrabold">₹50,00,000 / Policy</strong></div>
                      <div className="flex justify-between items-center"><span>Claim Settlement Authority:</span><strong className="text-blue-600 font-extrabold">₹10,00,000 / Claim</strong></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'security' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Security & Trusted Session History</h3>
                    <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                      <div className="flex justify-between"><span>Multi-Factor Auth (2FA):</span><strong className="text-emerald-400">ENABLED (Okta Verify)</strong></div>
                      <div className="flex justify-between"><span>Last Login IP:</span><strong className="text-blue-300 font-mono">192.168.1.104 (Mumbai)</strong></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'actions' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">Identity Servicing & Account Controls</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => handleToggleActive(selectedStaff.id)} variant="primary" className="font-bold py-2.5">
                        {selectedStaff.isActive ? 'Lock Account' : 'Unlock Account'}
                      </Button>
                      <Button onClick={() => alert('Temporary password reset link sent to staff email.')} variant="outline" className="font-bold py-2.5">
                        Reset Password
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Wizard Modal */}
      {isCreateModalOpen && (
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Onboard New Employee / Agent (Okta Entra ID)">
          {creationStep === 'form' ? (
            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input type="text" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full border rounded-xl p-2.5 font-bold" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Corporate Email</label>
                  <input type="email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full border rounded-xl p-2.5 font-bold" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Role</label>
                  <select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full border rounded-xl p-2.5 font-bold">
                    <option value="AGENT">Insurance Agent</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} variant="primary" className="w-full py-3 font-bold">
                {isSubmitting ? 'Creating Employee Record...' : 'Onboard & Generate Credentials'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-4 text-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-extrabold text-slate-900">Employee Account Provisioned</h3>
              <p className="text-slate-500 font-medium">Credentials generated for <strong className="text-slate-900">{createdStaffDetails?.name}</strong>.</p>
              <Button onClick={() => setIsCreateModalOpen(false)} variant="primary" className="w-full py-2.5 font-bold">
                Done & Return to Directory
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
