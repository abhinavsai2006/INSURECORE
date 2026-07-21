import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Clock, LayoutGrid, List, Upload, Shield, Eye, AlertCircle, ArrowRight } from 'lucide-react';
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

  // New Claim Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [claimFile, setClaimFile] = useState<File | null>(null);
  const [newClaim, setNewClaim] = useState({
    policyId: '',
    claimAmount: 1500,
    reason: 'Emergency Hospitalization & Medical Expenses',
    description: '',
  });

  // Action / Detail Modal state
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number>(0);

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/claims');
      setClaims(res.data.data || []);
    } catch (err) {
      console.error(err);
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
        setPolicies(res.data.data || []);
        if (res.data.data?.length > 0) {
          setNewClaim((prev) => ({ ...prev, policyId: res.data.data[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isSubmitModalOpen) fetchUserPolicies();
  }, [isSubmitModalOpen]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const claimRes = await api.post('/claims', newClaim);
      const createdClaim = claimRes.data.data;

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
      setSelectedClaim(null);
      setActionNotes('');
      fetchClaims();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Status update failed');
    }
  };

  const columns = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED'];

  const getStepProgressIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 1;
      case 'UNDER_REVIEW': return 2;
      case 'APPROVED': return 3;
      case 'SETTLED': return 4;
      case 'REJECTED': return -1;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Claims Processing & Tracking Desk</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Verify supporting medical bills, inspect evidence documents, and adjust settlement payouts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex space-x-1 shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4 mr-1" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4 mr-1" /> Table
            </button>
          </div>

          <Button onClick={() => setIsSubmitModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> File New Claim
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colClaims = claims.filter((c) => c.status === col);
            return (
              <div key={col} className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4 min-w-[240px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col.replace('_', ' ')}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-blue-700 border border-slate-200">
                    {colClaims.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {colClaims.map((cl) => (
                    <Card
                      key={cl.id}
                      onClick={() => {
                        setSelectedClaim(cl);
                        setApprovedAmount(cl.approvedAmount || cl.claimAmount);
                      }}
                      className="p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition relative group bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{cl.claimNumber}</span>
                        <span className="text-xs font-extrabold text-blue-600">{formatCurrency(cl.claimAmount)}</span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2 font-medium mb-3">{cl.reason}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                        <span className="truncate max-w-[120px]">{cl.policy?.customer?.name}</span>
                        <span>{formatDate(cl.submissionDate)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-bold">
              <tr>
                <th className="px-6 py-4">Claim Number</th>
                <th className="px-6 py-4">Policy & Customer</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Claimed Amount</th>
                <th className="px-6 py-4">Approved Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map((cl) => (
                <tr
                  key={cl.id}
                  onClick={() => {
                    setSelectedClaim(cl);
                    setApprovedAmount(cl.approvedAmount || cl.claimAmount);
                  }}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{cl.claimNumber}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{cl.policy?.customer?.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{cl.policy?.policyNumber}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-700 font-medium max-w-xs truncate">{cl.reason}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(cl.claimAmount)}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{cl.approvedAmount ? formatCurrency(cl.approvedAmount) : '—'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={cl.status === 'APPROVED' ? 'active' : cl.status === 'REJECTED' ? 'danger' : 'pending'}>
                      {cl.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Claim Detail & Visual Progress Tracker Modal */}
      <Modal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)} title={`Claim Details & Verification — ${selectedClaim?.claimNumber}`}>
        {selectedClaim && (
          <div className="space-y-5 text-slate-800">
            {/* Visual Step Tracker Bar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Claim Settlement Lifecycle</p>

              {selectedClaim.status === 'REJECTED' ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-rose-600" /> Claim Ticket Rejected after Underwriting Review
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs font-bold">
                  {['Submitted', 'Under Review', 'Approved', 'Disbursed'].map((step, idx) => {
                    const activeIdx = getStepProgressIndex(selectedClaim.status);
                    const isDone = activeIdx >= idx + 1;
                    return (
                      <div key={step} className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isDone ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className={isDone ? 'text-blue-700 font-bold' : 'text-slate-400'}>{step}</span>
                        {idx < 3 && <div className={`w-8 md:w-12 h-0.5 ${isDone ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Policy & Coverage Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 font-medium">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-blue-600">{selectedClaim.policy?.policyType} POLICY COVERAGE</span>
                <span className="font-mono font-bold text-slate-900">{selectedClaim.policy?.policyNumber}</span>
              </div>
              <p>Policyholder: <strong className="text-slate-900">{selectedClaim.policy?.customer?.name} ({selectedClaim.policy?.customer?.email})</strong></p>
              <p>Claimed Payout: <strong className="text-blue-600">{formatCurrency(selectedClaim.claimAmount)}</strong></p>
              <p>Claim Reason: <span className="text-slate-900 font-semibold">{selectedClaim.reason}</span></p>
              {selectedClaim.description && <p>Description: <span className="text-slate-600">{selectedClaim.description}</span></p>}
            </div>

            {/* Attached Evidence Documents */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Attached Evidence Documents</p>
              {selectedClaim.documents && selectedClaim.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedClaim.documents.map((doc: any) => (
                    <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{doc.fileName}</span>
                      <a
                        href={`/api/v1/documents/${doc.id}/file`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-bold flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View File
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No evidence document attached to this claim.</p>
              )}
            </div>

            {/* Agent Action Desk */}
            {user?.role !== 'CUSTOMER' && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Approved Settlement Payout ($)</label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Underwriter Review Notes</label>
                  <textarea
                    rows={2}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter review decision notes..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="secondary" onClick={() => handleUpdateStatus('UNDER_REVIEW')} className="text-xs font-bold">
                    Mark Under Review
                  </Button>
                  <Button variant="primary" onClick={() => handleUpdateStatus('APPROVED')} className="text-xs font-bold">
                    Approve Payout
                  </Button>
                  <Button variant="danger" onClick={() => handleUpdateStatus('REJECTED')} className="text-xs font-bold">
                    Reject Claim
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* File New Claim Modal with Document Uploader */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="File New Insurance Claim Ticket">
        <form onSubmit={handleSubmitClaim} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Active Policy</label>
            <select
              value={newClaim.policyId}
              onChange={(e) => setNewClaim({ ...newClaim, policyId: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>{p.policyNumber} — {p.planName} ({p.policyType})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Estimated Claim Amount ($)</label>
            <input
              type="number"
              required
              value={newClaim.claimAmount}
              onChange={(e) => setNewClaim({ ...newClaim, claimAmount: parseFloat(e.target.value) })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason for Claim</label>
            <input
              type="text"
              required
              value={newClaim.reason}
              onChange={(e) => setNewClaim({ ...newClaim, reason: e.target.value })}
              placeholder="e.g., Emergency Hospitalization & Surgery"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Incident Description</label>
            <textarea
              rows={2}
              value={newClaim.description}
              onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium"
            />
          </div>

          {/* Integrated Evidence Document Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Attach Supporting Medical / Repair Bill (PDF/JPG)</label>
            <input
              type="file"
              onChange={(e) => setClaimFile(e.target.files ? e.target.files[0] : null)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 font-bold shadow-md">
            Submit Claim Ticket
          </Button>
        </form>
      </Modal>
    </div>
  );
};
