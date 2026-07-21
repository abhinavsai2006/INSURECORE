import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, FileText, Users, AlertCircle, ArrowUpRight, Plus, Download, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { api, downloadFile } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
          const [repRes, polRes, claimRes] = await Promise.all([
            api.get('/reports/overview'),
            api.get('/policies?limit=5'),
            api.get('/claims?limit=5'),
          ]);
          setData(repRes.data.data);
          setPolicies(polRes.data.data || []);
          setClaims(claimRes.data.data || []);
        } else {
          const [polRes, claimRes] = await Promise.all([
            api.get('/policies'),
            api.get('/claims'),
          ]);
          setPolicies(polRes.data.data || []);
          setClaims(claimRes.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#f59e0b', '#ef4444'];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  // CUSTOMER DASHBOARD
  if (user?.role === 'CUSTOMER') {
    const activePolicies = policies.filter((p) => p.status === 'ACTIVE');

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user.name}! 👋</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage your active insurance policies, claims, and premium receipts.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/claims">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" /> File New Claim
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="secondary">Pay Premium</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Policies</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{activePolicies.length}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claims Submitted</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{claims.length}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">KYC Status</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Verified Customer
              </span>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">My Policy Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((p) => (
              <Card key={p.id} className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{p.policyType} POLICY</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{p.planName}</h3>
                    <p className="text-xs text-slate-500 mt-1">Policy No: <span className="font-mono text-slate-800 font-semibold">{p.policyNumber}</span></p>
                  </div>
                  <Badge variant={p.status === 'ACTIVE' ? 'active' : 'pending'}>{p.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 my-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Sum Insured</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(p.sumInsured)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Annual Premium</span>
                    <p className="text-base font-bold text-blue-600 mt-0.5">{formatCurrency(p.premiumAmount)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Coverage End: {formatDate(p.endDate)}</span>
                  <button
                    onClick={() => downloadFile(`/policies/${p.id}/pdf`, `Schedule_${p.policyNumber}.pdf`)}
                    className="text-blue-600 hover:underline flex items-center font-bold"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Schedule PDF
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ADMIN & AGENT DASHBOARD
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">InsureCore Executive Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Real-time telemetry across policies, premium revenues, and claim reviews.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/policies">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" /> Issue New Policy
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => downloadFile('/reports/export/excel', 'InsureCore_Report.xlsx')}>
            <Download className="w-4 h-4 mr-2" /> Export Excel Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Policies</span>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-3">{data?.kpis?.activePolicies || 0}</h3>
          <p className="text-xs text-blue-600 mt-2 font-bold flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> +12% from last month
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-3">{data?.kpis?.totalCustomers || 0}</h3>
          <p className="text-xs text-blue-600 mt-2 font-bold flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified accounts
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Claim Tickets</span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-3">{data?.kpis?.openClaims || 0}</h3>
          <p className="text-xs text-amber-600 mt-2 font-bold">Pending agent review</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Premium Revenue</span>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-3">{formatCurrency(data?.kpis?.totalPremiumCollected || 0)}</h3>
          <p className="text-xs text-slate-500 mt-2 font-semibold">Total collected YTD</p>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Premium Collection Trend (12 Months)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthlyPremium || []}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                  formatter={(val: any) => [formatCurrency(val), 'Premium']}
                />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Claims Distribution</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.claimsByStatus || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                  {data?.claimsByStatus?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Issued Policies</h3>
            <Link to="/policies" className="text-xs text-blue-600 hover:underline font-bold">View All</Link>
          </div>
          <div className="space-y-3">
            {policies.map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{p.policyNumber}</p>
                  <p className="text-xs text-slate-500">{p.planName} • {p.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{formatCurrency(p.premiumAmount)}</p>
                  <Badge variant={p.status === 'ACTIVE' ? 'active' : 'pending'}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Claim Applications</h3>
            <Link to="/claims" className="text-xs text-blue-600 hover:underline font-bold">View Board</Link>
          </div>
          <div className="space-y-3">
            {claims.map((cl) => (
              <div key={cl.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{cl.claimNumber}</p>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{cl.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(cl.claimAmount)}</p>
                  <Badge variant={cl.status === 'APPROVED' ? 'active' : cl.status === 'REJECTED' ? 'danger' : 'pending'}>
                    {cl.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
