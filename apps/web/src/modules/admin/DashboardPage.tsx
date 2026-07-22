import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, FileText, Users, AlertCircle, ArrowUpRight, Plus, Download, CheckCircle, ShieldCheck, UserCheck, Headphones, CheckSquare, PlusCircle, Sparkles, RefreshCw, Lock, FolderOpen, BarChart3, Activity, Clock, CheckCircle2, TrendingUp, AlertTriangle, Zap, Server, Send, Eye, X, Filter } from 'lucide-react';
import { Card } from '../../shared';
import { Button } from '../../shared';
import { Badge } from '../../shared';
import { useAuthStore } from '../../store/authStore';
import { api, downloadFile } from '../../shared';
import { formatCurrency, formatDate } from '../../shared';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role || 'CUSTOMER';

  const [data, setData] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'command' | 'analytics' | 'queues' | 'ai' | 'compliance'>('command');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [repRes, polRes, claimRes] = await Promise.all([
        api.get('/reports/overview').catch(() => ({ data: { data: null } })),
        api.get('/policies?limit=6').catch(() => ({ data: { data: [] } })),
        api.get('/claims?limit=6').catch(() => ({ data: { data: [] } })),
      ]);
      setData(repRes.data.data);
      setPolicies(polRes.data.data || []);
      setClaims(claimRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#10b981', '#f59e0b', '#ef4444'];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 18400000 },
    { month: 'Feb', revenue: 21200000 },
    { month: 'Mar', revenue: 24500000 },
    { month: 'Apr', revenue: 22800000 },
    { month: 'May', revenue: 28900000 },
    { month: 'Jun', revenue: 31200000 },
    { month: 'Jul', revenue: 34800000 },
  ];

  const policyTypeDist = [
    { name: 'Health Insurance', value: 45 },
    { name: 'Motor Insurance', value: 25 },
    { name: 'Term Life', value: 15 },
    { name: 'Travel Pass', value: 10 },
    { name: 'Home Shield', value: 5 },
  ];

  const workQueues = [
    { id: 'q1', title: 'Pending e-KYC Queue', count: 4, items: [
      { name: 'Rajesh Sharma', type: 'Health', sla: 'Within SLA', priority: 'High' },
      { name: 'Priya Patel', type: 'Motor', sla: 'Within SLA', priority: 'Normal' },
    ]},
    { id: 'q2', title: 'Medical Underwriting', count: 3, items: [
      { name: 'Vikram Malhotra', type: 'Life (₹1.5 Cr)', sla: 'Under Review', priority: 'Urgent' },
      { name: 'Sunita Rao', type: 'Health (₹50L)', sla: 'Within SLA', priority: 'Normal' },
    ]},
    { id: 'q3', title: 'Claims Assessment Desk', count: 3, items: [
      { name: 'Amit Kumar', type: 'Apollo Hospital (₹1.8L)', sla: 'TPA Approved', priority: 'High' },
      { name: 'Meera Deshmukh', type: 'Fortis Hospital (₹85k)', sla: 'Under Audit', priority: 'Normal' },
    ]},
    { id: 'q4', title: 'Fraud Anomaly Telemetry', count: 2, items: [
      { name: 'Claim CLM-2026-0042', type: 'Reimbursement', sla: 'Flagged (0.02%)', priority: 'Urgent' },
    ]},
    { id: 'q5', title: 'Renewal Servicing Queue', count: 5, items: [
      { name: 'Anil Mehta', type: 'Motor Zero-Dep', sla: 'Due in 3 Days', priority: 'High' },
    ]},
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-white rounded-3xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header & Mission Control Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
              Insurance Operations Command Center
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              100% Operational • Solvency 2.10x
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">Mission Control & Operational Telemetry</h1>
          <p className="text-slate-500 text-sm font-medium">Centralized control for underwriting, policy issuance, e-KYC, claims settlement, renewals, & AI risk engines.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => navigate('/policies/new')} variant="primary" className="font-bold shadow-md">
            <Plus className="w-4 h-4 mr-1.5" /> Buy / Issue Policy
          </Button>
          <Button onClick={() => navigate('/customers/new')} variant="outline" className="font-bold">
            + Register Customer
          </Button>
          <Button onClick={() => navigate('/claims')} variant="outline" className="font-bold">
            + Submit Claim
          </Button>
          <Button onClick={() => downloadFile('/reports/export/pdf', 'Executive_Command_Telemetry.pdf')} variant="outline" className="font-bold">
            <Download className="w-4 h-4 mr-1.5" /> Export Report
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center text-xs font-bold text-emerald-800">
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" /> {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center overflow-x-auto bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-slate-700">
        {[
          { id: 'command', label: 'Mission Command Center', icon: Activity },
          { id: 'queues', label: 'Work Queues (Kanban)', icon: CheckSquare },
          { id: 'analytics', label: 'Revenue & Sales Telemetry', icon: BarChart3 },
          { id: 'ai', label: 'AI Risk & Fraud Insights', icon: Sparkles },
          { id: 'compliance', label: 'IRDAI Compliance & Health', icon: ShieldCheck },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === t.id ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MISSION COMMAND CENTER & 24-METRIC DASHBOARD */}
      {activeTab === 'command' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 space-y-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Written Premium YTD</span>
              <p className="text-3xl font-extrabold text-white">₹450.8 Cr</p>
              <div className="flex justify-between text-xs text-emerald-400 font-bold pt-1">
                <span>+18.4% YoY Growth</span>
                <span>IRDAI Audited</span>
              </div>
            </Card>

            <Card className="p-5 space-y-2 bg-white border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Policy Portfolio</span>
              <p className="text-3xl font-extrabold text-slate-900">{data?.kpis?.activePolicies || 12840}</p>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">98.4% Claim Ratio</span>
            </Card>

            <Card className="p-5 space-y-2 bg-white border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Monthly Premium Collection</span>
              <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(data?.kpis?.totalPremiumCollected || 24800000)}</p>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">99.2% Gateway Success</span>
            </Card>

            <Card className="p-5 space-y-2 bg-white border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Claims Settlement Ratio</span>
              <p className="text-3xl font-extrabold text-slate-900">98.4%</p>
              <span className="text-[11px] font-bold text-slate-600">Avg Settlement: 1.2 Days</span>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
