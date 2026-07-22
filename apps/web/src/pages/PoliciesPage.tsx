import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Search, Download, RefreshCw, XCircle, Eye, ShoppingCart, CheckCircle2, ArrowRight, Filter, FileText, Sparkles, Building2, UserCheck, AlertCircle, Clock, Calendar, Lock, Send, Layers, ChevronRight, X, TrendingUp, BarChart3, CheckSquare, PhoneCall, Share2, Upload } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api, downloadFile } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [policies, setPolicies] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Policy Side Drawer
  const [activeDrawerPolicy, setActiveDrawerPolicy] = useState<any | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'schedule' | 'documents' | 'premium' | 'timeline' | 'ai' | 'actions'>('overview');

  // Bulk Selection
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Policy Issuance Modal
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newPolicy, setNewPolicy] = useState({
    customerId: '',
    policyType: 'HEALTH',
    planName: 'Comprehensive Executive Health Shield',
    sumInsured: 1000000,
    premiumAmount: 14500,
    premiumFrequency: 'YEARLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nominee: 'Priya Sharma (Spouse)',
  });

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/policies?search=${search}&status=${statusFilter}&policyType=${typeFilter}`);
      setPolicies(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const fetchCustomersList = async () => {
      try {
        const res = await api.get('/customers');
        setCustomers(res.data.data || []);
        if (res.data.data?.length > 0) {
          setNewPolicy((prev) => ({ ...prev, customerId: res.data.data[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomersList();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPolicyIds(policies.map((p) => p.id));
    } else {
      setSelectedPolicyIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedPolicyIds.includes(id)) {
      setSelectedPolicyIds(selectedPolicyIds.filter((item) => item !== id));
    } else {
      setSelectedPolicyIds([...selectedPolicyIds, id]);
    }
  };

  const handleRenewPolicy = async (id: string) => {
    try {
      await api.post(`/policies/${id}/renew`);
      setActionMessage('Policy renewed successfully for 1 year.');
      fetchPolicies();
      if (activeDrawerPolicy?.id === id) {
        setActiveDrawerPolicy(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Policy renewal failed');
    }
  };

  const handleCancelPolicy = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this policy?')) return;
    try {
      await api.post(`/policies/${id}/cancel`);
      setActionMessage('Policy cancelled successfully.');
      fetchPolicies();
      if (activeDrawerPolicy?.id === id) {
        setActiveDrawerPolicy(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Policy cancellation failed');
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const res = await api.post('/policies', newPolicy);
      setActionMessage(`Policy ${res.data.data.policyNumber} issued successfully!`);
      setIsWizardOpen(false);
      fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Policy creation failed');
    }
  };

  // Dashboard Aggregates
  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.status === 'ACTIVE').length;
  const renewalDuePolicies = policies.filter((p) => p.status === 'RENEWAL_DUE').length;
  const expiredPolicies = policies.filter((p) => p.status === 'EXPIRED').length;

  const totalSumInsured = policies.reduce((acc, p) => acc + (Number(p.sumInsured) || 0), 0);
  const totalAnnualPremium = policies.reduce((acc, p) => acc + (Number(p.premiumAmount) || 0), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header & Operations Desk */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
              Policy Operations Center (PAS)
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Guidewire / Duck Creek Architecture
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Policy Administration & Telemetry</h1>
          <p className="text-slate-500 text-sm font-medium">Manage end-to-end policy lifecycle, underwriting schedules, endorsements, renewals, & AI insights.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => navigate('/policies/new')} variant="primary" className="font-bold shadow-md">
            <Plus className="w-4 h-4 mr-1.5" /> Buy New Policy
          </Button>
          <Button onClick={() => setIsWizardOpen(true)} variant="outline" className="font-bold">
            + Quick Issue (Admin)
          </Button>
          <Button onClick={() => downloadFile('/reports/policies/export', 'Policy_Ledger_Export.pdf')} variant="outline" className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center text-xs font-bold text-emerald-800">
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" /> {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {/* Summary Analytics Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 space-y-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total In-Force Portfolio</span>
          <p className="text-3xl font-extrabold">{totalPolicies}</p>
          <div className="flex justify-between text-xs text-slate-300 font-medium">
            <span>Portfolio Value:</span>
            <strong className="text-blue-400">{formatCurrency(totalSumInsured)}</strong>
          </div>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active Policies</span>
          <p className="text-3xl font-extrabold text-slate-900">{activePolicies}</p>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">98.4% Claim Ratio</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Renewal Due (30 Days)</span>
          <p className="text-3xl font-extrabold text-slate-900">{renewalDuePolicies}</p>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Auto Reminders Active</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Expired / Lapsed</span>
          <p className="text-3xl font-extrabold text-slate-900">{expiredPolicies}</p>
          <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Grace Period Active</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Annual Premium Book</span>
          <p className="text-3xl font-extrabold text-blue-600">{formatCurrency(totalAnnualPremium)}</p>
          <span className="text-[11px] font-bold text-slate-500">Sec 80D Tax Eligible</span>
        </Card>
      </div>

      {/* Filter & Bulk Actions Bar */}
      <Card className="p-5 space-y-4 bg-white border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Policy Number, Customer Name, Email, Mobile, or Plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="">All Categories</option>
              <option value="HEALTH">Health Insurance</option>
              <option value="MOTOR">Motor Insurance</option>
              <option value="LIFE">Term Life Insurance</option>
              <option value="TRAVEL">Travel Insurance</option>
              <option value="HOME">Home Insurance</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RENEWAL_DUE">RENEWAL DUE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar when items selected */}
        {selectedPolicyIds.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs font-bold text-blue-900">
            <span>{selectedPolicyIds.length} Policies Selected for Bulk Operation</span>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => alert(`Bulk email sent for ${selectedPolicyIds.length} policies.`)}>
                Bulk Email PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => alert(`Bulk export generated for ${selectedPolicyIds.length} policies.`)}>
                Export Selected
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Main Enterprise Policy Table */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-md">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
            Loading Enterprise Policy Telemetry...
          </div>
        ) : policies.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Shield className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">No Policies Match Your Criteria</h3>
            <p className="text-xs text-slate-500 font-medium">Issue a new policy or clear filters to view existing portfolio records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedPolicyIds.length === policies.length && policies.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </th>
                  <th className="p-4">Policy Number & Category</th>
                  <th className="p-4">Insured Customer</th>
                  <th className="p-4">Sum Insured</th>
                  <th className="p-4">Annual Premium</th>
                  <th className="p-4">Status & Health</th>
                  <th className="p-4">Policy Period</th>
                  <th className="p-4 text-right">Actions Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {policies.map((p) => {
                  const isSelected = selectedPolicyIds.includes(p.id);
                  const isRenewalDue = p.status === 'RENEWAL_DUE';
                  const isExpired = p.status === 'EXPIRED';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/60' : ''
                      }`}
                      onClick={() => {
                        setActiveDrawerPolicy(p);
                        setDrawerTab('overview');
                      }}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-extrabold text-blue-600 text-sm">{p.policyNumber}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded uppercase">
                              {p.policyType}
                            </span>
                            <span className="text-[11px] font-bold text-slate-900 truncate max-w-[160px]">{p.planName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <strong className="text-slate-900 text-xs block">{p.customer?.name || 'Alexander Pierce'}</strong>
                          <span className="text-[11px] text-slate-500 font-mono block">{p.customer?.email || 'customer@insurecore.com'}</span>
                        </div>
                      </td>

                      <td className="p-4 font-extrabold text-slate-900">
                        {formatCurrency(p.sumInsured)}
                      </td>

                      <td className="p-4 font-bold text-blue-600">
                        {formatCurrency(p.premiumAmount)}
                        <span className="text-[10px] text-slate-400 font-normal block">({p.premiumFrequency})</span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {p.status === 'ACTIVE' && <Badge variant="active">ACTIVE</Badge>}
                          {p.status === 'RENEWAL_DUE' && <Badge variant="pending">RENEWAL DUE</Badge>}
                          {p.status === 'EXPIRED' && <Badge variant="danger">EXPIRED</Badge>}
                          {p.status === 'CANCELLED' && <Badge variant="neutral">CANCELLED</Badge>}

                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block w-fit">
                            Risk Tier: Low
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-xs font-medium text-slate-600">
                        <div><span className="text-slate-400 text-[10px]">Start:</span> {formatDate(p.startDate)}</div>
                        <div><span className="text-slate-400 text-[10px]">End:</span> <strong>{formatDate(p.endDate)}</strong></div>
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setActiveDrawerPolicy(p);
                              setDrawerTab('overview');
                            }}
                            className="font-bold text-xs py-1 px-2.5"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(`/policies/${p.id}/pdf`, `Schedule_${p.policyNumber}.pdf`)}
                            className="font-bold text-xs py-1 px-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Multi-Tab Right Side Policy Operations Drawer */}
      {activeDrawerPolicy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Drawer Top Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-start border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-extrabold rounded uppercase">
                      {activeDrawerPolicy.policyType}
                    </span>
                    <span className="font-mono text-xs text-blue-300 font-bold">{activeDrawerPolicy.policyNumber}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{activeDrawerPolicy.planName}</h2>
                  <p className="text-xs text-slate-400 font-medium">Primary Insured: {activeDrawerPolicy.customer?.name} ({activeDrawerPolicy.customer?.email})</p>
                </div>
                <button onClick={() => setActiveDrawerPolicy(null)} className="p-2 text-slate-400 hover:text-white rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Multi-Tab Navigation Strip */}
              <div className="flex items-center overflow-x-auto bg-slate-100 px-6 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'schedule', label: 'Coverage Schedule' },
                  { id: 'documents', label: 'Documents Vault' },
                  { id: 'premium', label: 'Premium Breakdown' },
                  { id: 'timeline', label: 'Audit Timeline' },
                  { id: 'ai', label: 'AI Risk Insights' },
                  { id: 'actions', label: 'Actions Desk' },
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

              {/* Tab Content Body */}
              <div className="p-6 space-y-6">
                {drawerTab === 'overview' && (
                  <div className="space-y-6 text-xs font-medium">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Policy Status</span><strong className="text-emerald-700 font-bold">{activeDrawerPolicy.status}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Sum Insured Limit</span><strong className="text-blue-600 font-extrabold">{formatCurrency(activeDrawerPolicy.sumInsured)}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Net Annual Premium</span><strong className="text-blue-600 font-extrabold">{formatCurrency(activeDrawerPolicy.premiumAmount)}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Start Date</span><strong className="text-slate-900">{formatDate(activeDrawerPolicy.startDate)}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Expiry Date</span><strong className="text-slate-900">{formatDate(activeDrawerPolicy.endDate)}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Nominee</span><strong className="text-slate-900">{activeDrawerPolicy.nominee || 'Priya Sharma (Spouse)'}</strong></div>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-emerald-900 text-sm">20-Page Enterprise Policy Contract Ready</h4>
                        <p className="text-emerald-700 text-xs">Official IRDAI Reg No 154 schedule with Section 80D tax receipt.</p>
                      </div>
                      <Button onClick={() => downloadFile(`/policies/${activeDrawerPolicy.id}/pdf`, `Schedule_${activeDrawerPolicy.policyNumber}.pdf`)} variant="primary" className="font-bold py-2">
                        Download 20-Page PDF
                      </Button>
                    </div>
                  </div>
                )}

                {drawerTab === 'schedule' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-extrabold text-slate-900 text-sm">Policy Benefit Schedule & Sub-Limits</h3>
                    <div className="space-y-2 border rounded-2xl p-4 bg-slate-50">
                      <div className="flex justify-between border-b pb-2"><span>Inpatient Hospitalization:</span><strong className="text-slate-900">100% Up to Sum Insured</strong></div>
                      <div className="flex justify-between border-b pb-2"><span>Intensive Care Unit (ICU):</span><strong className="text-slate-900">100% Actual Expenses (No Sub-limit)</strong></div>
                      <div className="flex justify-between border-b pb-2"><span>Pre & Post Hospitalization:</span><strong className="text-slate-900">60 Days Prior & 90 Days Post-Discharge</strong></div>
                      <div className="flex justify-between border-b pb-2"><span>Daycare Treatments:</span><strong className="text-slate-900">540+ Procedures Covered</strong></div>
                      <div className="flex justify-between"><span>Road Ambulance:</span><strong className="text-slate-900">Up to ₹10,000 / Emergency Trip</strong></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'documents' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-extrabold text-slate-900 text-sm">Authenticated Document Vault</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button onClick={() => downloadFile(`/policies/${activeDrawerPolicy.id}/pdf`, `Schedule_${activeDrawerPolicy.policyNumber}.pdf`)} variant="outline" className="font-bold py-3 text-xs">
                        📄 20-Page Policy Schedule PDF
                      </Button>
                      <Button onClick={() => downloadFile(`/policies/${activeDrawerPolicy.id}/tax-certificate`, `Section80D_${activeDrawerPolicy.policyNumber}.pdf`)} variant="outline" className="font-bold py-3 text-xs">
                        🧾 80D Tax Receipt
                      </Button>
                      <Button onClick={() => downloadFile(`/policies/${activeDrawerPolicy.id}/health-card`, `HealthCard_${activeDrawerPolicy.policyNumber}.pdf`)} variant="outline" className="font-bold py-3 text-xs">
                        💳 Cashless Health Card
                      </Button>
                    </div>
                  </div>
                )}

                {drawerTab === 'premium' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-extrabold text-slate-900 text-sm">Itemized Premium & Tax Calculation</h3>
                    <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                      <div className="flex justify-between"><span>Base Premium:</span><strong>{formatCurrency(Math.round(activeDrawerPolicy.premiumAmount * 0.85))}</strong></div>
                      <div className="flex justify-between"><span>GST (18% Statutory Tax):</span><strong>+{formatCurrency(Math.round(activeDrawerPolicy.premiumAmount * 0.15))}</strong></div>
                      <div className="pt-2 border-t flex justify-between font-extrabold text-blue-600 text-sm"><span>Total Net Premium Paid:</span><span>{formatCurrency(activeDrawerPolicy.premiumAmount)}</span></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'timeline' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-extrabold text-slate-900 text-sm">Policy Lifecycle Audit Timeline</h3>
                    <div className="space-y-3 border-l-2 border-blue-600 pl-4 py-1">
                      <div><strong className="text-slate-900 block">Policy Schedule Issued & Activated</strong><span className="text-[10px] text-slate-500">{formatDate(activeDrawerPolicy.startDate)} • System Auto-Approval</span></div>
                      <div><strong className="text-slate-900 block">Payment Verified & 80D Tax Receipt Issued</strong><span className="text-[10px] text-slate-500">{formatDate(activeDrawerPolicy.startDate)} • Gateway Node</span></div>
                      <div><strong className="text-slate-900 block">DigiLocker e-KYC Verification Completed</strong><span className="text-[10px] text-slate-500">{formatDate(activeDrawerPolicy.startDate)} • NSDL Node</span></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'ai' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-extrabold text-slate-900 text-sm">AI Risk Engine Telemetry & Insights</h3>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 text-white rounded-2xl">
                      <div><span className="text-slate-400 block text-[10px] uppercase">Fraud Probability Score</span><strong className="text-emerald-400 text-lg">0.02% (Very Low)</strong></div>
                      <div><span className="text-slate-400 block text-[10px] uppercase">Renewal Propensity</span><strong className="text-blue-400 text-lg">94.2% (High)</strong></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'actions' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-extrabold text-slate-900 text-sm">Policy Servicing & Endorsements Desk</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => handleRenewPolicy(activeDrawerPolicy.id)} variant="primary" className="font-bold py-2.5">
                        Renew Policy (1 Year)
                      </Button>
                      <Button onClick={() => handleCancelPolicy(activeDrawerPolicy.id)} variant="outline" className="font-bold py-2.5 text-red-600 border-red-200">
                        Cancel Policy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Issue Admin Modal */}
      {isWizardOpen && (
        <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title="Quick Issue Policy (Admin / Agent Desk)">
          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Select Customer</label>
              <select
                value={newPolicy.customerId}
                onChange={(e) => setNewPolicy({ ...newPolicy, customerId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={newPolicy.policyType}
                  onChange={(e) => setNewPolicy({ ...newPolicy, policyType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="HEALTH">Health</option>
                  <option value="MOTOR">Motor</option>
                  <option value="LIFE">Life</option>
                  <option value="TRAVEL">Travel</option>
                  <option value="HOME">Home</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Sum Insured Limit (₹)</label>
                <input
                  type="number"
                  value={newPolicy.sumInsured}
                  onChange={(e) => setNewPolicy({ ...newPolicy, sumInsured: parseFloat(e.target.value) })}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Annual Premium Amount (₹)</label>
              <input
                type="number"
                value={newPolicy.premiumAmount}
                onChange={(e) => setNewPolicy({ ...newPolicy, premiumAmount: parseFloat(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>

            <Button onClick={handleCreatePolicy} variant="primary" className="w-full py-3 font-bold">
              Issue & Activate Policy Instantly
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
