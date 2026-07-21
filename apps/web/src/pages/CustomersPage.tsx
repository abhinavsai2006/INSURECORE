import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Mail, Phone, MapPin, CheckCircle, ShieldCheck, FileCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const CustomersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    dob: '1992-05-15',
    gender: 'Male',
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', newCustomer);
      setIsModalOpen(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '+91 ',
        address: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        dob: '1992-05-15',
        gender: 'Male',
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to register customer profile');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer & Policyholder Directory</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Register new customer profiles, verify IRDAI KYC documents, and inspect policy counts.</p>
        </div>
        {user?.role !== 'CUSTOMER' && (
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="font-bold shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Register New Customer
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card className="p-4 flex items-center space-x-4 bg-white border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customers by name, email, phone, city, or pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <Card className="text-center py-12 text-slate-500 font-medium">No customer profiles match your search criteria.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => (
            <Card key={c.id} className="space-y-4 hover:border-blue-300 transition bg-white border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{c.city}, {c.state} ({c.pincode || '400001'})</p>
                  </div>
                </div>
                {c.kycVerified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <CheckCircle className="w-3 h-3 mr-1 text-blue-600" /> KYC Verified
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="truncate text-slate-900 font-semibold">{c.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-900 font-semibold">{c.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="truncate text-slate-700">{c.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Policies: <strong className="text-blue-600 font-bold">{c._count?.policies || 0}</strong></span>
                <span>Enrolled: {formatDate(c.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Register New Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Customer Profile">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Kumar Sharma"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-medium focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="rajesh@example.com"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Residential Address</label>
            <input
              type="text"
              required
              placeholder="Flat / House No, Street, Landmark"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-medium focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
              <input
                type="text"
                required
                value={newCustomer.city}
                onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
              <input
                type="text"
                required
                value={newCustomer.state}
                onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pincode</label>
              <input
                type="text"
                required
                value={newCustomer.pincode}
                onChange={(e) => setNewCustomer({ ...newCustomer, pincode: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-4 font-bold shadow-md">
            Save & Register Customer Profile
          </Button>
        </form>
      </Modal>
    </div>
  );
};
