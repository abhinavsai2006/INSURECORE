import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Clock, LayoutGrid, List, Upload, Shield, Eye, AlertCircle, ArrowRight, Search, Filter, Sparkles, Building2, UserCheck, AlertTriangle, CheckCircle, XCircle, Send, X, Download, FileCheck, Layers, RefreshCw, DollarSign, Activity, CheckSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api, downloadFile } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const ClaimsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [claims, setClaims] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Claim Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [claimFile, setClaimFile] = useState<File | null>(null);
  const [newClaim, setNewClaim] = useState({
    policyId: '',
    claimAmount: 150000,
    reason: 'Emergency Hospitalization & Inpatient Medical Surgery',
    description: 'Admitted to Apollo Hospital for laparoscopic surgery under TPA cashless approval.',
  });

  // Action / Detail Drawer state
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'timeline' | 'documents' | 'medical' | 'survey' | 'settlement' | 'ai' | 'actions'>('overview');
  const [actionNotes, setActionNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number>(0);

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/claims');
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setClaims(list);
    } catch (err) {
      console.error(err);
      setClaims([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    const fetchUserPolicies = async () => {
      try {
        const res = await api.get('/policies?status=ACTIVE');
        const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setPolicies(list);
        if (list.length > 0) {
          setNewClaim((prev) => ({ ...prev, policyId: list[0].id }));
        }
      } catch (err) {
        console.error(err);
        setPolicies([]);
      }
    };
    if (isSubmitModalOpen) fetchUserPolicies();
  }, [isSubmitModalOpen]);

  const safeClaims = Array.isArray(claims) ? claims : [];

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const claimRes = await api.post('/claims', newClaim);
      const createdClaim = claimRes.data?.data;

      // Upload file if selected
      if (claimFile && createdClaim) {
        const formData = new FormData();
        formData.append('file', claimFile);
        formData.append('docCategory', 'CLAIM_EVIDENCE');
        formData.append('claimId', createdClaim.id);
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsSubmitModalOpen(false);
      setClaimFile(null);
      setActionMessage(`Claim ${createdClaim?.claimNumber || ''} submitted successfully under 20-min TPA SLA.`);
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Claim submission failed');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedClaim) return;
    try {
      await api.patch(`/claims/${selectedClaim.id}/status`, {
        status: newStatus,
        reviewNotes: actionNotes,
        approvedAmount: newStatus === 'APPROVED' ? approvedAmount || selectedClaim.claimAmount : null,
      });
      setActionMessage(`Claim ${selectedClaim.claimNumber} status updated to ${newStatus}.`);
      setSelectedClaim(null);
      setActionNotes('');
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Claim status update failed');
    }
  };

  const filteredClaims = safeClaims.filter((c) => {
    const matchesSearch =
      (c.claimNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.reason || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.policy?.policyNumber && c.policy.policyNumber.toLowerCase().includes(search.toLowerCase())) ||
      (c.policy?.customer?.name && c.policy.customer.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesType = !typeFilter || c.policy?.policyType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <Badge variant="pending">SUBMITTED</Badge>;
      case 'UNDER_REVIEW': return <Badge variant="info">UNDER REVIEW</Badge>;
      case 'APPROVED': return <Badge variant="active">APPROVED</Badge>;
      case 'SETTLED': return <Badge variant="active">SETTLED</Badge>;
      case 'REJECTED': return <Badge variant="danger">REJECTED</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const kanbanColumns = [
    { id: 'SUBMITTED', title: '1. Submitted / Intimated', count: filteredClaims.filter((c) => c.status === 'SUBMITTED').length },
    { id: 'UNDER_REVIEW', title: '2. Medical & TPA Review', count: filteredClaims.filter((c) => c.status === 'UNDER_REVIEW').length },
    { id: 'APPROVED', title: '3. Approved (Pending Pay)', count: filteredClaims.filter((c) => c.status === 'APPROVED').length },
    { id: 'SETTLED', title: '4. Settled & Disbursed', count: filteredClaims.filter((c) => c.status === 'SETTLED').length },
    { id: 'REJECTED', title: '5. Rejected / Flagged', count: filteredClaims.filter((c) => c.status === 'REJECTED').length },
  ];

  const totalClaimAmount = safeClaims.reduce((acc, c) => acc + (Number(c.claimAmount) || 0), 0);
  const totalSettledAmount = safeClaims.filter((c) => c.status === 'SETTLED' || c.status === 'APPROVED').reduce((acc, c) => acc + (Number(c.approvedAmount || c.claimAmount) || 0), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Command Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
              Claims Operations & Settlement Center
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Guidewire ClaimCenter Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">Claims Processing & Settlement Administration</h1>
          <p className="text-slate-500 text-sm font-medium">Lifecycle tracking, medical reviews, TPA cashless pre-authorizations, surveyor audits, & instant disbursements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setIsSubmitModalOpen(true)} variant="primary" className="font-bold shadow-md">
            <Plus className="w-4 h-4 mr-1.5" /> + File New Claim
          </Button>
          <Button onClick={() => downloadFile('/reports/export/pdf', 'Claims_Executive_Report.pdf')} variant="outline" className="font-bold">
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

      {/* Summary Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 space-y-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Claims Volume</span>
          <p className="text-3xl font-extrabold">{safeClaims.length}</p>
          <span className="text-[11px] text-blue-400 font-bold block">{formatCurrency(totalClaimAmount)} Requested</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Under Active Review</span>
          <p className="text-3xl font-extrabold text-slate-900">{safeClaims.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length}</p>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Avg SLA: 1.2 Days</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Settled & Approved</span>
          <p className="text-3xl font-extrabold text-slate-900">{claims.filter((c) => c.status === 'SETTLED' || c.status === 'APPROVED').length}</p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{formatCurrency(totalSettledAmount)}</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Claim Settlement Ratio</span>
          <p className="text-3xl font-extrabold text-blue-600">98.4%</p>
          <span className="text-[10px] text-slate-500">IRDAI Audited Rate</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Fraud Anomaly Telemetry</span>
          <p className="text-3xl font-extrabold text-slate-900">0.02%</p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">AI Risk Filter Active</span>
        </Card>
      </div>

      {/* Filter & View Mode Bar */}
      <Card className="p-4 space-y-3 bg-white border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Claim Number, Policy Number, Customer Name, or Hospital..."
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
              <option value="HEALTH">Health Claims</option>
              <option value="MOTOR">Motor Claims</option>
              <option value="LIFE">Life Claims</option>
              <option value="TRAVEL">Travel Claims</option>
              <option value="HOME">Home Claims</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="SETTLED">SETTLED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-100">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1 transition ${
                  viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1 transition ${
                  viewMode === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colClaims = filteredClaims.filter((c) => c.status === col.id);
            return (
              <div key={col.id} className="bg-slate-100 border border-slate-200 rounded-2xl p-4 space-y-3 min-w-[240px]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">{col.title}</h3>
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {col.count}
                  </span>
                </div>

                <div className="space-y-3">
                  {colClaims.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-medium bg-white/50 rounded-xl border border-dashed border-slate-200">
                      No claims in queue
                    </div>
                  ) : (
                    colClaims.map((claim) => (
                      <Card
                        key={claim.id}
                        className="p-4 space-y-3 bg-white border-slate-200 text-xs shadow-xs hover:border-blue-600 hover:shadow-md transition cursor-pointer"
                        onClick={() => {
                          setSelectedClaim(claim);
                          setApprovedAmount(claim.approvedAmount || claim.claimAmount);
                          setDrawerTab('overview');
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-extrabold text-blue-600 text-sm">{claim.claimNumber}</span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-extrabold uppercase">
                            Within SLA
                          </span>
                        </div>

                        <div>
                          <strong className="text-slate-900 block text-xs">{claim.policy?.customer?.name || 'Alexander Pierce'}</strong>
                          <span className="text-[11px] text-slate-500 font-mono block">Policy: {claim.policy?.policyNumber}</span>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Claimed Amount</span>
                          <p className="text-base font-extrabold text-slate-900">{formatCurrency(claim.claimAmount)}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px]">
                          <span className="text-slate-500 font-medium">{formatDate(claim.submissionDate)}</span>
                          <Button size="sm" variant="outline" className="font-bold text-[10px] py-0.5 px-2">
                            View Details →
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden border-slate-200 bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
                  <th className="p-4">Claim Number</th>
                  <th className="p-4">Policy No & Insured</th>
                  <th className="p-4">Reason / Diagnosis</th>
                  <th className="p-4">Claim Amount</th>
                  <th className="p-4">Approved Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Intimation Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setApprovedAmount(claim.approvedAmount || claim.claimAmount);
                      setDrawerTab('overview');
                    }}
                  >
                    <td className="p-4 font-mono font-extrabold text-blue-600 text-sm">{claim.claimNumber}</td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <strong className="text-slate-900 block">{claim.policy?.customer?.name}</strong>
                        <span className="text-[11px] text-slate-500 font-mono block">{claim.policy?.policyNumber}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 max-w-[200px] truncate">{claim.reason}</td>
                    <td className="p-4 font-extrabold text-slate-900">{formatCurrency(claim.claimAmount)}</td>
                    <td className="p-4 font-extrabold text-emerald-700">{claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '—'}</td>
                    <td className="p-4">{getStatusBadge(claim.status)}</td>
                    <td className="p-4 text-slate-600">{formatDate(claim.submissionDate)}</td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="primary" className="font-bold text-xs py-1 px-3">
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Multi-Tab Claim Operations Drawer */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="bg-slate-900 text-white p-6 flex justify-between items-start border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-blue-400 font-bold">{selectedClaim.claimNumber}</span>
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{selectedClaim.reason}</h2>
                  <p className="text-xs text-slate-400 font-medium">Policy No: {selectedClaim.policy?.policyNumber} • Insured: {selectedClaim.policy?.customer?.name}</p>
                </div>
                <button onClick={() => setSelectedClaim(null)} className="p-2 text-slate-400 hover:text-white rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Tab Header */}
              <div className="flex items-center overflow-x-auto bg-slate-100 px-6 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'timeline', label: 'Audit Timeline' },
                  { id: 'documents', label: 'Documents Vault' },
                  { id: 'medical', label: 'Medical Review' },
                  { id: 'survey', label: 'Surveyor Assessment' },
                  { id: 'settlement', label: 'Financial Settlement' },
                  { id: 'ai', label: 'AI Risk Engine' },
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

              <div className="p-6 space-y-6">
                {drawerTab === 'overview' && (
                  <div className="space-y-6 text-xs font-medium">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border rounded-2xl">
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Claimed Amount</span><strong className="text-slate-900 font-extrabold text-base">{formatCurrency(selectedClaim.claimAmount)}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Approved Limit</span><strong className="text-emerald-700 font-extrabold text-base">{selectedClaim.approvedAmount ? formatCurrency(selectedClaim.approvedAmount) : 'Pending'}</strong></div>
                      <div><span className="text-slate-500 block text-[10px] uppercase font-bold">TPA Desk SLA</span><strong className="text-blue-600 font-bold">Within SLA (20 Min)</strong></div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-blue-900">
                      <strong className="text-sm block">Apollo Network Hospital Approval Active</strong>
                      <p>Admitted for inpatient surgical treatment under IRDAI cashless rules.</p>
                    </div>
                  </div>
                )}

                {drawerTab === 'timeline' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-extrabold text-slate-900 text-sm">Claim Audit Lifecycle Timeline</h3>
                    <div className="space-y-3 border-l-2 border-blue-600 pl-4 py-1">
                      <div><strong className="text-slate-900 block">Claim Submitted & Intimated</strong><span className="text-[10px] text-slate-500">{formatDate(selectedClaim.submissionDate)} • TPA Desk</span></div>
                      <div><strong className="text-slate-900 block">Medical Audit & ICD Coding Passed</strong><span className="text-[10px] text-slate-500">{formatDate(selectedClaim.submissionDate)} • Medical Reviewer</span></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'actions' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-extrabold text-slate-900 text-sm">Claim Determination & Settlement Actions</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Approved Settlement Amount (₹)</label>
                        <input
                          type="number"
                          value={approvedAmount}
                          onChange={(e) => setApprovedAmount(parseFloat(e.target.value))}
                          className="w-full border rounded-xl p-2.5 text-xs font-extrabold text-emerald-700"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Reviewer Notes</label>
                        <textarea
                          rows={3}
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          placeholder="Add medical auditor remarks, hospital TPA notes, or settlement authorization..."
                          className="w-full border rounded-xl p-3 text-xs font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button onClick={() => handleUpdateStatus('APPROVED')} variant="primary" className="font-bold py-3">
                          Approve Claim ({formatCurrency(approvedAmount || selectedClaim.claimAmount)})
                        </Button>
                        <Button onClick={() => handleUpdateStatus('REJECTED')} variant="outline" className="font-bold py-3 text-red-600 border-red-200">
                          Reject Claim
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File New Claim Modal */}
      {isSubmitModalOpen && (
        <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="File New Insurance Claim">
          <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Select Policy</label>
              <select
                value={newClaim.policyId}
                onChange={(e) => setNewClaim({ ...newClaim, policyId: e.target.value })}
                className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold"
              >
                {policies.map((pol) => (
                  <option key={pol.id} value={pol.id}>{pol.policyNumber} — {pol.planName} ({pol.policyType})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Requested Claim Amount (₹)</label>
              <input
                type="number"
                value={newClaim.claimAmount}
                onChange={(e) => setNewClaim({ ...newClaim, claimAmount: parseFloat(e.target.value) })}
                className="w-full border rounded-xl p-2.5 text-xs font-extrabold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Reason for Claim</label>
              <input
                type="text"
                value={newClaim.reason}
                onChange={(e) => setNewClaim({ ...newClaim, reason: e.target.value })}
                className="w-full border rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Upload Discharge Summary / Invoice Proof</label>
              <input
                type="file"
                onChange={(e) => setClaimFile(e.target.files?.[0] || null)}
                className="w-full border rounded-xl p-2 text-xs font-bold"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 font-bold">
              Submit Claim for TPA Cashless Approval
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
