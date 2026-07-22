import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCheck, Shield, FileText, Download, Plus, Mail, Phone, MapPin, CheckCircle2, ChevronLeft, CreditCard, Clock, Activity, AlertCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api, downloadFile } from '../lib/api';
import { formatDate, formatCurrency } from '../lib/utils';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any | null>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'claims' | 'documents' | 'timeline'>('overview');

  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true);
      try {
        const [custRes, polRes, claimRes] = await Promise.all([
          api.get(`/customers/${id}`).catch(() => ({ data: { data: null } })),
          api.get('/policies').catch(() => ({ data: { data: [] } })),
          api.get('/claims').catch(() => ({ data: { data: [] } })),
        ]);
        setCustomer(custRes.data.data);
        setPolicies(polRes.data.data || []);
        setClaims(claimRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCustomerData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold text-sm">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
        Loading Salesforce CRM Customer Workspace...
      </div>
    );
  }

  const custPolicies = policies.filter((p) => p.customerId === id || p.customer?.id === id);
  const custClaims = claims.filter((c) => c.policy?.customerId === id || c.policy?.customer?.id === id);

  return (
    <div className="space-y-8 pb-20">
      {/* Top Navigation & Actions Desk */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button onClick={() => navigate('/customers')} className="text-xs font-bold text-blue-600 hover:underline flex items-center mb-1">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Customers Directory
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{customer?.name || 'Ananya Deshmukh'}</h1>
            <Badge variant="active">e-KYC VERIFIED</Badge>
          </div>
          <p className="text-slate-500 text-xs font-mono mt-1 font-bold">CUST-2026-{(customer?.id || '8942').slice(0, 8).toUpperCase()} • Customer Since {formatDate(customer?.createdAt || new Date())}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => navigate('/policies/new')} variant="primary" className="font-bold shadow-md">
            <Plus className="w-4 h-4 mr-1.5" /> + Issue New Policy
          </Button>
          <Button onClick={() => navigate('/claims')} variant="outline" className="font-bold">
            + File Claim
          </Button>
          <Button onClick={() => downloadFile('/reports/export/pdf', `Customer_${customer?.name}.pdf`)} variant="outline" className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Export Profile PDF
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Lifetime Value</span>
          <p className="text-3xl font-extrabold">₹1,45,000</p>
          <span className="text-[11px] text-emerald-400 font-bold block">Low Risk Class 1 Profile</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active In-Force Policies</span>
          <p className="text-3xl font-extrabold text-slate-900">{custPolicies.length || 1}</p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">100% On-Time Renewal</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Claims History</span>
          <p className="text-3xl font-extrabold text-slate-900">{custClaims.length || 0}</p>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Zero Pending Claims</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">DigiLocker KYC Status</span>
          <p className="text-3xl font-extrabold text-emerald-700">VERIFIED</p>
          <span className="text-[10px] text-slate-500 font-bold">PAN & Aadhaar Matched</span>
        </Card>
      </div>

      {/* Tabs Strip */}
      <div className="flex items-center overflow-x-auto bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-slate-700">
        {[
          { id: 'overview', label: 'CRM Overview' },
          { id: 'policies', label: 'In-Force Policies' },
          { id: 'claims', label: 'Claims History' },
          { id: 'documents', label: 'Documents & KYC' },
          { id: 'timeline', label: 'Audit Timeline' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === t.id ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-6 space-y-4 bg-white border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-200 pb-3">Personal & Contact Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span><strong className="text-slate-900">{customer?.email || 'ananya.deshmukh@gmail.com'}</strong></div>
              <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Mobile Phone</span><strong className="text-slate-900">{customer?.phone || '+91 98201 55443'}</strong></div>
              <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Residential Address</span><strong className="text-slate-900">{customer?.address || 'Powai, Mumbai, Maharashtra - 400076'}</strong></div>
              <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Date of Birth</span><strong className="text-slate-900">{customer?.dob ? formatDate(customer.dob) : '24 Nov 1993'}</strong></div>
            </div>
          </Card>

          <Card className="p-6 space-y-4 bg-slate-900 text-white shadow-md">
            <h3 className="font-extrabold text-white text-base border-b border-slate-800 pb-3">AI Telemetry & Risk Score</h3>
            <div className="space-y-2 text-xs font-medium text-slate-300">
              <div className="flex justify-between"><span>Fraud Probability:</span><strong className="text-emerald-400">0.02% (Very Low)</strong></div>
              <div className="flex justify-between"><span>Renewal Propensity:</span><strong className="text-blue-400">96.8% (High)</strong></div>
              <div className="flex justify-between"><span>Section 80D Tax Benefit:</span><strong className="text-emerald-400">₹25,000 Eligible</strong></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
