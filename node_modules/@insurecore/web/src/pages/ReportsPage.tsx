import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api, downloadFile } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/reports/overview');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#f59e0b', '#ef4444'];

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Generating analytics engine...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Analytics & Reports</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Audit policy retention, claims ratios, and download business report exports.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="primary" onClick={() => downloadFile('/reports/export/excel', 'InsureCore_Report.xlsx')}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Excel (.XLSX)
          </Button>

          <Button variant="secondary" onClick={() => downloadFile('/reports/export/pdf', 'InsureCore_Report.pdf')}>
            <FileText className="w-4 h-4 mr-2" /> Download PDF Summary
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase">Active Policies</span>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{data?.kpis?.activePolicies || 0}</h3>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase">Enrolled Customers</span>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{data?.kpis?.totalCustomers || 0}</h3>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase">Open Claims</span>
          <h3 className="text-3xl font-bold text-amber-600 mt-2">{data?.kpis?.openClaims || 0}</h3>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase">Gross Premium Collected</span>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(data?.kpis?.totalPremiumCollected || 0)}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Policy Count by Category</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.policiesByType || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Claims Status Breakdown</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.claimsByStatus || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {data?.claimsByStatus?.map((e: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
