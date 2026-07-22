import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, FileText, Users, AlertCircle, ArrowUpRight, Plus, Download, CheckCircle, ShieldCheck, UserCheck, Headphones, CheckSquare, PlusCircle, Sparkles, RefreshCw, Lock, FolderOpen, BarChart3 } from 'lucide-react';
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
  const role = user?.role || 'CUSTOMER';
  const [data, setData] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [repRes, polRes, claimRes] = await Promise.all([
          api.get('/reports/overview').catch(() => ({ data: { data: null } })),
          api.get('/policies?limit=5').catch(() => ({ data: { data: [] } })),
          api.get('/claims?limit=5').catch(() => ({ data: { data: [] } })),
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

  // 1. SUPER ADMIN DASHBOARD
  if (role === 'SUPER_ADMIN') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase">
              Super Admin Executive Portal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Global System Control & Governance</h1>
            <p className="text-slate-500 text-sm font-medium">Enterprise telemetry, user management, solvency metrics, and audit logs.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/users">
              <Button variant="primary" className="font-bold">
                <UserCheck className="w-4 h-4 mr-2" /> Manage Staff & Roles
              </Button>
            </Link>
            <Link to="/audit-logs">
              <Button variant="outline" className="font-bold">Audit Logs</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">Solvency Ratio</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">1.98x</h3>
            <p className="text-xs text-slate-500 mt-1">IRDAI Mandate: 1.50x</p>
          </Card>
          <Card className="bg-white border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">Written Premium YTD</span>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-2">₹450.8 Cr</h3>
            <p className="text-xs text-emerald-600 mt-1 font-bold">+18.4% YoY Growth</p>
          </Card>
          <Card className="bg-white border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Staff Accounts</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">142</h3>
            <p className="text-xs text-slate-500 mt-1">Agents, Underwriters & Claims</p>
          </Card>
          <Card className="bg-white border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">System Security</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">ISO 27001</h3>
            <p className="text-xs text-emerald-600 mt-1 font-bold">256-Bit SSL Encrypted</p>
          </Card>
        </div>
      </div>
    );
  }

  // 2. ADMIN DASHBOARD (Enterprise Insurance Workspace Layout)
  if (role === 'ADMIN') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
            Operational Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">Insurance Administration Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Manage daily insurance operations, customer onboarding, policy issuance, KYC verification, claims processing, and renewals from a single operational workspace.
          </p>
        </div>

        {/* Section 1: Operational Overview KPIs */}
        <div>
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Operational Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="bg-white border-slate-200 hover:border-blue-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Policies</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5">6</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-blue-600 font-bold mt-2">Active Customer Contracts</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-amber-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pending KYC Reviews</span>
                  <h3 className="text-3xl font-extrabold text-amber-600 mt-1.5">14</h3>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">Documents Awaiting Verification</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-rose-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Claims Pending Review</span>
                  <h3 className="text-3xl font-extrabold text-rose-600 mt-1.5">2</h3>
                </div>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">Claims Requiring Assessment</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-purple-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Renewals Due</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5">8</h3>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <RefreshCw className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-amber-600 font-bold mt-2">Policies Expiring Within 30 Days</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-emerald-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Premiums Collected</span>
                  <h3 className="text-3xl font-extrabold text-blue-600 mt-1.5">₹16,088</h3>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-emerald-600 font-bold mt-2">This Month Collection Ledger</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-indigo-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pending Applications</span>
                  <h3 className="text-3xl font-extrabold text-purple-600 mt-1.5">5</h3>
                </div>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">Applications Awaiting Underwriting</p>
            </Card>
          </div>
        </div>

        {/* Section 2: Operational Work Queue */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Operational Work Queue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Queue Item 1 */}
            <Card className="bg-white border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" /> KYC Verification Queue
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                    Pending: 14
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-6 list-disc font-medium">
                  <li>Review newly uploaded Aadhaar and PAN documents</li>
                  <li>Verify or reject proof submissions</li>
                  <li>Request document re-upload when required</li>
                </ul>
              </div>
              <Link to="/documents" className="mt-4">
                <Button variant="outline" className="w-full text-xs font-bold py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700">
                  Review KYC Queue (14 Pending)
                </Button>
              </Link>
            </Card>

            {/* Queue Item 2 */}
            <Card className="bg-white border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <PlusCircle className="w-4 h-4 text-blue-600 mr-2" /> Policy Issuance Queue
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
                    Pending: 5
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-6 list-disc font-medium">
                  <li>Review approved customer proposals</li>
                  <li>Generate official policy schedules</li>
                  <li>Activate policies after payment confirmation</li>
                </ul>
              </div>
              <Link to="/policies/new" className="mt-4">
                <Button variant="primary" className="w-full text-xs font-bold py-2 shadow-xs">
                  Issue Policy Wizard (5 Pending)
                </Button>
              </Link>
            </Card>

            {/* Queue Item 3 */}
            <Card className="bg-white border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <FileText className="w-4 h-4 text-rose-600 mr-2" /> Claims Assessment Desk
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
                    Pending: 2
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-6 list-disc font-medium">
                  <li>Review submitted claim applications</li>
                  <li>Verify hospital bills & garage repair evidence</li>
                  <li>Forward to Claims Officer or approve cashless payout</li>
                </ul>
              </div>
              <Link to="/claims" className="mt-4">
                <Button variant="outline" className="w-full text-xs font-bold py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-700">
                  Assess Claims Board (2 Pending)
                </Button>
              </Link>
            </Card>

            {/* Queue Item 4 */}
            <Card className="bg-white border-slate-200 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    <RefreshCw className="w-4 h-4 text-purple-600 mr-2" /> Policy Renewals Desk
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800">
                    Due: 8
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-6 list-disc font-medium">
                  <li>Identify policies nearing 30-day expiry</li>
                  <li>Send automated renewal notice reminders</li>
                  <li>Process renewal payments & issue renewed policy PDF</li>
                </ul>
              </div>
              <Link to="/policies" className="mt-4">
                <Button variant="outline" className="w-full text-xs font-bold py-2 bg-slate-50 hover:bg-purple-50 hover:text-purple-700">
                  Process Renewals (8 Due)
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Section 3: Quick Operations Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Quick Operations Desk</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/customers">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">➕ Register Customer</h4>
                <p className="text-[11px] text-slate-500 font-medium">Create a new customer profile with state & contact verification.</p>
              </Card>
            </Link>

            <Link to="/policies/new">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">📄 Issue Policy</h4>
                <p className="text-[11px] text-slate-500 font-medium">Issue a policy for an approved customer application.</p>
              </Card>
            </Link>

            <Link to="/documents">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">✅ Verify KYC</h4>
                <p className="text-[11px] text-slate-500 font-medium">Review and validate customer identity proof documents.</p>
              </Card>
            </Link>

            <Link to="/policies">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">📋 Manage Policies</h4>
                <p className="text-[11px] text-slate-500 font-medium">Search, update, renew, suspend, or cancel active contracts.</p>
              </Card>
            </Link>

            <Link to="/claims">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">⚖️ Manage Claims</h4>
                <p className="text-[11px] text-slate-500 font-medium">Process pending cashless claims and upload adjudication decisions.</p>
              </Card>
            </Link>

            <Link to="/customers">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">👥 Customer Directory</h4>
                <p className="text-[11px] text-slate-500 font-medium">Search customer records, active coverage, and claims history.</p>
              </Card>
            </Link>

            <Link to="/documents">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">📂 Document Vault</h4>
                <p className="text-[11px] text-slate-500 font-medium">View and organize encrypted policy contracts & proofs.</p>
              </Card>
            </Link>

            <Link to="/reports">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">📊 Reports & Analytics</h4>
                <p className="text-[11px] text-slate-500 font-medium">View premium collection metrics and claims loss ratio.</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Section 4 & 5: Recent Activity Audit & Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <Card className="lg:col-span-2 bg-white border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Recent Operational Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Activity Event</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-3 text-slate-500 font-mono">09:15 AM</td>
                    <td className="py-3 px-3 font-bold text-slate-900">Customer "Rajesh Kumar" registered</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase text-[10px]">Completed</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500 font-mono">09:40 AM</td>
                    <td className="py-3 px-3 font-bold text-slate-900">Health Policy POL-2026-000012 issued</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase text-[10px]">Completed</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500 font-mono">10:10 AM</td>
                    <td className="py-3 px-3 font-bold text-slate-900">Aadhaar verified for Priya Sharma</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase text-[10px]">Completed</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500 font-mono">10:35 AM</td>
                    <td className="py-3 px-3 font-bold text-slate-900">Motor claim CLM-2026-0012 submitted</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-extrabold uppercase text-[10px]">Pending Review</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-slate-500 font-mono">11:20 AM</td>
                    <td className="py-3 px-3 font-bold text-slate-900">Policy renewal payment received</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase text-[10px]">Completed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Alerts & Notifications */}
          <Card className="bg-white border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <AlertCircle className="w-4 h-4 text-amber-600 mr-2" /> Alerts & Notifications
            </h3>
            <ul className="space-y-3 text-xs font-medium text-slate-700">
              <li className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>High-priority claim CLM-2026-0012 awaiting review</span>
              </li>
              <li className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>KYC documents pending review for &gt;48 hours</span>
              </li>
              <li className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>8 policies expiring within next 7 days</span>
              </li>
              <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>IRDAI Compliance Audit telemetry synced</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  // 3. AGENT DASHBOARD (Professional Insurance CRM & Advisor Workspace)
  if (role === 'AGENT') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {user?.name || 'John Miller'} 👋</h1>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                Licensed Insurance Advisor
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Manage your customer portfolio, submit policy proposals, track renewals, monitor sales performance, and view commission earnings.
            </p>
          </div>
          <Link to="/policies/new">
            <Button variant="primary" className="font-bold shadow-md">
              <PlusCircle className="w-4 h-4 mr-2" /> Create Policy Proposal
            </Button>
          </Link>
        </div>

        {/* Performance Overview (7 Key Metric Cards) */}
        <div>
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Performance Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="bg-white border-slate-200 hover:border-blue-300 transition">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Assigned Customers</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">128</h3>
              <p className="text-xs text-blue-600 font-bold mt-1.5">128 Active Customers</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-blue-300 transition">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Policies</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">214</h3>
              <p className="text-xs text-blue-600 font-bold mt-1.5">214 Policies Under Management</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-amber-300 transition">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pending Proposals</span>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">9</h3>
              <p className="text-xs text-slate-500 font-medium mt-1.5">9 Awaiting Underwriting Review</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-purple-300 transition">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Renewals Due This Month</span>
              <h3 className="text-3xl font-extrabold text-purple-600 mt-1">16</h3>
              <p className="text-xs text-purple-600 font-bold mt-1.5">16 Customer Policies</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-emerald-300 transition">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Monthly Premium Collected</span>
              <h3 className="text-3xl font-extrabold text-blue-600 mt-1">₹8,45,000</h3>
              <p className="text-xs text-emerald-600 font-bold mt-1.5">Collected YTD</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-emerald-300 transition">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Monthly Commission</span>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">₹42,500</h3>
              <p className="text-xs text-emerald-600 font-bold mt-1.5">84% Target Achieved</p>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-indigo-300 transition">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Target Achievement</span>
              <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">84%</h3>
              <p className="text-xs text-indigo-600 font-bold mt-1.5">₹42,500 Earned</p>
            </Card>
          </div>
        </div>

        {/* My Daily Tasks & Proposal Pipeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Tasks */}
          <Card className="lg:col-span-2 bg-white border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center">
              <CheckSquare className="w-4 h-4 text-blue-600 mr-2" /> My Daily Tasks Checklist
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-slate-700">
              <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Follow up on pending policy proposals (9 Pending)</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">HIGH</span>
              </li>
              <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Contact customers with upcoming renewals (16 Due)</span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">DUE SOON</span>
              </li>
              <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Complete pending KYC submissions for new customers</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">ACTION NEEDED</span>
              </li>
              <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Upload missing customer address & vehicle documents</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">PENDING</span>
              </li>
              <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Respond to medical underwriting queries for proposal #84920</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">URGENT</span>
              </li>
            </ul>
          </Card>

          {/* Proposal Pipeline */}
          <Card className="bg-white border-slate-200 space-y-3">
            <h3 className="text-base font-bold text-slate-900 mb-2">Proposal Pipeline</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700">Draft</span>
                <span className="font-extrabold text-slate-900">3</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <span className="font-bold">Submitted</span>
                <span className="font-extrabold text-blue-700">9</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
                <span className="font-bold">Underwriting Review</span>
                <span className="font-extrabold text-purple-700">5</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="font-bold">Approved</span>
                <span className="font-extrabold text-emerald-700">18</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold">Rejected</span>
                <span className="font-extrabold text-rose-700">2</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions (8 Advisor Cards) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Advisor Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/customers">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">➕ Register New Customer</h4>
                <p className="text-[11px] text-slate-500 font-medium">Onboard a new client into your agent portfolio.</p>
              </Card>
            </Link>

            <Link to="/policies/new">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">📝 Create Policy Proposal</h4>
                <p className="text-[11px] text-slate-500 font-medium">Submit new insurance proposal to underwriting.</p>
              </Card>
            </Link>

            <Link to="/customers">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">👥 View My Customers</h4>
                <p className="text-[11px] text-slate-500 font-medium">Search & manage your assigned customer base.</p>
              </Card>
            </Link>

            <Link to="/policies">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">📄 View My Policies</h4>
                <p className="text-[11px] text-slate-500 font-medium">Track active customer insurance contracts.</p>
              </Card>
            </Link>

            <Link to="/documents">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">📤 Upload Documents</h4>
                <p className="text-[11px] text-slate-500 font-medium">Upload Aadhaar, PAN, & medical proofs.</p>
              </Card>
            </Link>

            <Link to="/policies">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">🔄 Follow Up on Renewals</h4>
                <p className="text-[11px] text-slate-500 font-medium">Send renewal reminders & track payments.</p>
              </Card>
            </Link>

            <Link to="/reports">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">💰 View Commission Statement</h4>
                <p className="text-[11px] text-slate-500 font-medium">Inspect monthly commission payouts.</p>
              </Card>
            </Link>

            <Link to="/reports">
              <Card className="hover:border-blue-400 transition bg-white p-4 space-y-2 cursor-pointer h-full border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs">📊 Sales Performance Report</h4>
                <p className="text-[11px] text-slate-500 font-medium">Review sales target progress & growth analytics.</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Upcoming Renewals Table & Commission Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Renewals */}
          <Card className="lg:col-span-2 bg-white border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Upcoming Renewals</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Policy Type</th>
                    <th className="py-2.5 px-3">Renewal Date</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Rajesh Kumar</td>
                    <td className="py-3 px-3 font-bold text-blue-600">Health</td>
                    <td className="py-3 px-3 text-slate-500">28 Jul 2026</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-extrabold uppercase text-[10px]">Follow-up Required</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Priya Sharma</td>
                    <td className="py-3 px-3 font-bold text-blue-600">Motor</td>
                    <td className="py-3 px-3 text-slate-500">30 Jul 2026</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold uppercase text-[10px]">Reminder Sent</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Amit Verma</td>
                    <td className="py-3 px-3 font-bold text-blue-600">Life</td>
                    <td className="py-3 px-3 text-slate-500">02 Aug 2026</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-extrabold uppercase text-[10px]">Pending Payment</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Commission Summary */}
          <Card className="bg-white border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Commission Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">This Month</span>
                <span className="font-extrabold text-emerald-600 text-sm">₹42,500</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">Last Month</span>
                <span className="font-extrabold text-slate-900 text-sm">₹38,200</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">Year-to-Date</span>
                <span className="font-extrabold text-blue-600 text-sm">₹4,86,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold">Pending Commission</span>
                <span className="font-extrabold text-amber-700 text-sm">₹12,300</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 4. CLAIMS OFFICER DASHBOARD
  if (role === 'CLAIMS_OFFICER') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 uppercase">
              Claims Adjudication Desk
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Claims Adjudication Queue</h1>
            <p className="text-slate-500 text-sm font-medium">Verify hospital bills, review repair evidence, and approve cashless settlements.</p>
          </div>
          <Link to="/claims">
            <Button variant="primary" className="font-bold">
              <FileText className="w-4 h-4 mr-2" /> Adjudicate Claims Queue
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Adjudication</span>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-2">8 Tickets</h3>
          </Card>
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">Claim Settlement Ratio</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">98.4%</h3>
          </Card>
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">Total Settled YTD</span>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-2">₹145.2 Cr</h3>
          </Card>
        </div>
      </div>
    );
  }

  // 5. UNDERWRITER DASHBOARD
  if (role === 'UNDERWRITER') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 uppercase">
              Underwriting & Risk Assessment
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Risk Evaluation Queue</h1>
            <p className="text-slate-500 text-sm font-medium">Evaluate medical disclosures, vehicle inspection reports, and set premium loading.</p>
          </div>
          <Link to="/policies">
            <Button variant="primary" className="font-bold">Review Proposal Queue</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">Proposals Under Review</span>
            <h3 className="text-3xl font-extrabold text-purple-600 mt-2">6 Applications</h3>
          </Card>
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">Average Approval Time</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">2.4 Hours</h3>
          </Card>
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">Approved This Month</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">142 Policies</h3>
          </Card>
        </div>
      </div>
    );
  }

  // 6. CUSTOMER SUPPORT DASHBOARD
  if (role === 'CUSTOMER_SUPPORT') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase">
              Helpdesk & Grievance Portal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Customer Support Desk</h1>
            <p className="text-slate-500 text-sm font-medium">Search customer records, track active grievances, and inspect policy details.</p>
          </div>
          <Link to="/customers">
            <Button variant="primary" className="font-bold">
              <Headphones className="w-4 h-4 mr-2" /> Customer Lookup Desk
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">Open Support Tickets</span>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-2">24 Tickets</h3>
          </Card>
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">SLA Resolution Rate</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">99.1%</h3>
          </Card>
          <Card>
            <span className="text-xs font-bold text-slate-500 uppercase">Grievance Escalations</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">0 Escalate</h3>
          </Card>
        </div>
      </div>
    );
  }

  // 7. CUSTOMER DASHBOARD
  const activePolicies = policies.filter((p) => p.status === 'ACTIVE');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name}! 👋</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage your active insurance policies, 1-click claims, and tax exemption receipts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/policies/new">
            <Button variant="primary" className="font-bold shadow-md">
              <Sparkles className="w-4 h-4 mr-2" /> Buy New Coverage
            </Button>
          </Link>
          <Link to="/claims">
            <Button variant="outline" className="font-bold">File Claim</Button>
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claims Filed</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{claims.length}</h3>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">80D Tax Status</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Tax Receipts Ready
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
};
