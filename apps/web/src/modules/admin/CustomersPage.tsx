import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, CheckCircle, ArrowRight, ShieldCheck, AlertCircle, ShoppingCart, Eye, FileText, CheckCircle2, UserCheck, RefreshCw, Upload, Sparkles } from 'lucide-react';
import { Card, Button, Badge, Modal, api, formatDate, formatCurrency } from '../../shared';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const CustomersPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase">
            {user?.role === 'AGENT' ? 'Agent Sales CRM Desk' : 'Customer Management Desk'}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Customer Directory & Onboarding</h1>
          <p className="text-slate-500 text-sm font-medium">Search policyholder records, view active coverage contracts, and register new accounts.</p>
        </div>
        <Button
          onClick={() => navigate('/customers/new')}
          variant="primary"
          className="font-bold shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" /> + Register New Customer
        </Button>
      </div>

      <Card className="p-4 bg-white border-slate-200">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer ID (CUST-XXXX), legal name, email, phone (+91), or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </Card>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-md">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-sm">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
            Loading Customer Directory...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">No Customers Found</h3>
            <p className="text-xs text-slate-500 font-medium font-bold">Clear search or register a new customer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
                  <th className="p-4">Customer Name & ID</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">DigiLocker Status</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => navigate(`/customers/${cust.id}`)}
                  >
                    <td className="p-4">
                      <strong className="text-slate-900 text-sm block font-extrabold">{cust.name}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">CUST-{cust.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-900 block font-medium">{cust.email}</span>
                      <span className="text-[11px] text-slate-500 block">{cust.phone}</span>
                    </td>
                    <td className="p-4 text-slate-700">{cust.city || 'Mumbai'}, {cust.state || 'Maharashtra'}</td>
                    <td className="p-4"><Badge variant="active">VERIFIED</Badge></td>
                    <td className="p-4 text-slate-600">{formatDate(cust.createdAt)}</td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/customers/${cust.id}`)} className="font-bold text-xs">
                        View CRM Profile →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
