import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertTriangle, Download, Plus, CheckCircle2, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api, downloadFile } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const [payRes, overRes] = await Promise.all([
        api.get('/payments'),
        user?.role !== 'CUSTOMER' ? api.get('/payments/overdue') : Promise.resolve({ data: { data: [] } }),
      ]);
      setPayments(payRes.data.data || []);
      setOverdue(overRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleMarkPaid = async (id: string) => {
    try {
      await api.post(`/payments/${id}/mark-paid`, { method: 'UPI' });
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Premium Payments & Tax Ledger</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Pay due premiums online, download 80D tax exemption certificates, and generate official receipts.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/checkout')}>
          <Plus className="w-4 h-4 mr-2" /> Launch Premium Checkout Gateway
        </Button>
      </div>

      {/* Tax Benefit Highlight Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-blue-900">
          <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Income Tax Benefit under Section 80D & Section 80C</h4>
            <p className="text-xs text-blue-700 font-medium">All health and life insurance premium receipts are eligible for tax deduction up to ₹50,000 per financial year.</p>
          </div>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-amber-800">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Overdue Premium Alert ({overdue.length} policies)</h4>
              <p className="text-xs text-amber-700 font-medium">Multiple policies require immediate payment collection to maintain active coverage.</p>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-bold">
            <tr>
              <th className="px-6 py-4">Policy Number</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Amount Due</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Method & Reference</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500 animate-pulse font-medium">
                  Loading premium ledger...
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{p.policy?.policyNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{p.policy?.customer?.name}</td>
                  <td className="px-6 py-4 font-extrabold text-blue-600">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">{formatDate(p.dueDate)}</td>
                  <td className="px-6 py-4 text-xs text-slate-700 font-medium">
                    {p.method || '—'} {p.transactionRef && <span className="font-mono text-slate-400">({p.transactionRef})</span>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={p.paymentStatus === 'PAID' ? 'active' : p.paymentStatus === 'OVERDUE' ? 'danger' : 'pending'}>
                      {p.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {p.paymentStatus === 'PAID' ? (
                      <button
                        onClick={() => downloadFile(`/payments/${p.id}/receipt`, `Receipt_${p.id}.pdf`)}
                        className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-xs text-blue-700 font-bold border border-blue-200"
                        title="Download 80D Tax Receipt PDF"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> 80D Tax Receipt
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/checkout?policyId=${p.policyId}`)}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold shadow-xs"
                      >
                        Pay Online
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
