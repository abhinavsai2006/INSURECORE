import React, { useState, useEffect } from 'react';
import { History, Shield, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/audit-logs');
        setLogs(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Audit Log Trail</h1>
        <p className="text-slate-500 text-sm mt-1">Immutable security log of every policy mutation, payment, and claim decision.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Entity Type</th>
              <th className="px-6 py-4">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 animate-pulse font-medium">
                  Loading security audit trail...
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{formatDate(l.createdAt)}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{l.user?.name}</p>
                    <p className="text-xs text-slate-500">{l.user?.role}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{l.action}</td>
                  <td className="px-6 py-4 text-xs text-slate-700 font-medium">{l.entityType}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono truncate max-w-xs">{l.metadata || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
