import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, CheckCircle, ArrowRight, ShieldCheck, AlertCircle, ShoppingCart, Eye, FileText, CheckCircle2, UserCheck, RefreshCw, Upload, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../lib/api';
import { formatDate, formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const CustomersPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regStep, setRegStep] = useState<'form' | 'success'>('form');
  const [agentStep, setAgentStep] = useState<number>(1);
  const [formError, setFormError] = useState('');
  const [createdCustomer, setCreatedCustomer] = useState<any>(null);
  const [generatedProposalId, setGeneratedProposalId] = useState('');

  // Selected Profile Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Form Fields
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    dob: '1992-05-15',
    gender: 'Male',
    occupation: 'Salaried Professional',
    maritalStatus: 'Married',
    aadhaarNo: 'XXXX-XXXX-8492',
    panNo: 'ABCDE1234F',
    kycFile: null as File | null,
    insuranceType: 'HEALTH',
    coverageRequired: 1000000,
    budget: 15000,
    planName: 'Comprehensive Executive Health Shield',
    nomineeName: 'Priya Sharma',
    nomineeRelation: 'Spouse',
    agentNotes: 'Client interested in zero co-pay cashless hospitalization cover.',
  });

  const indianStates = [
    'Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu', 'Gujarat',
    'Telangana', 'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Haryana',
    'Kerala', 'Madhya Pradesh', 'Punjab', 'Bihar'
  ];

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/customers');
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setCustomers(list);
    } catch (err) {
      console.error(err);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/customers', {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        city: newCustomer.city,
        state: newCustomer.state,
        pincode: newCustomer.pincode,
        dob: newCustomer.dob,
        gender: newCustomer.gender,
      });

      const cust = res.data?.data;
      setCreatedCustomer(cust);
      setGeneratedProposalId(`PROP-2026-${Math.floor(100000 + Math.random() * 900000)}`);
      setRegStep('success');
      fetchCustomers();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Customer registration failed.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      addressLine2: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      dob: '1992-05-15',
      gender: 'Male',
      occupation: 'Salaried Professional',
      maritalStatus: 'Married',
      aadhaarNo: 'XXXX-XXXX-8492',
      panNo: 'ABCDE1234F',
      kycFile: null,
      insuranceType: 'HEALTH',
      coverageRequired: 1000000,
      budget: 15000,
      planName: 'Comprehensive Executive Health Shield',
      nomineeName: 'Priya Sharma',
      nomineeRelation: 'Spouse',
      agentNotes: 'Client interested in zero co-pay cashless hospitalization cover.',
    });
    setFormError('');
    setAgentStep(1);
    setRegStep('form');
  };

  const safeCustomers = Array.isArray(customers) ? customers : [];

  const filteredCustomers = safeCustomers.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filter & Live Search Card */}
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

      {/* Customer Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="text-center py-16 text-slate-500 font-medium bg-white rounded-3xl border border-slate-200">
          No customer profiles match your search criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((c) => (
            <Card key={c.id} className="space-y-4 hover:border-blue-300 transition bg-white border-slate-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">CUST-{c.id.substring(0, 8)}</span>
                    </div>
                  </div>
                  {c.kycVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle className="w-3 h-3 mr-1 text-blue-600" /> KYC Verified
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
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
                    <span className="truncate text-slate-700">{c.city}, {c.state || 'Maharashtra'} ({c.pincode || '400001'})</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Active Policies: <strong className="text-blue-600 font-bold">{c._count?.policies || 0}</strong></span>
                  <span>Enrolled: {formatDate(c.createdAt)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => navigate(`/policies/new?customerId=${c.id}`)}
                    className="py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center justify-center space-x-1 transition shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{user?.role === 'AGENT' ? 'Create Proposal' : 'Buy Policy'}</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Customer Profile Detail Modal */}
      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={`Customer Profile — ${selectedCustomer?.name}`}>
        {selectedCustomer && (
          <CustomerProfileTabs customer={selectedCustomer} onBuyPolicy={(id: string) => {
            setSelectedCustomer(null);
            navigate(`/policies/new?customerId=${id}`);
          }} />
        )}
      </Modal>

      {/* AGENT & ADMIN GUIDED REGISTRATION & PROPOSAL WIZARD MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={regStep === 'form' ? `Register New Customer & Policy Proposal (Step ${agentStep} of 6)` : '✅ Registration & Proposal Created'}
      >
        {regStep === 'form' ? (
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* STEP 1: CUSTOMER INFORMATION */}
            {agentStep === 1 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase">Step 1 — Personal Contact Details</label>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar Sharma"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
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
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number (+91)</label>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={newCustomer.dob}
                      onChange={(e) => setNewCustomer({ ...newCustomer, dob: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
                    <select
                      value={newCustomer.gender}
                      onChange={(e) => setNewCustomer({ ...newCustomer, gender: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <Button type="button" onClick={() => setAgentStep(2)} variant="primary" className="w-full font-bold py-2.5 shadow-md mt-2">
                  Continue to Address Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* STEP 2: ADDRESS DETAILS */}
            {agentStep === 2 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase">Step 2 — Residential Address</label>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Address Line 1</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat / House No, Street, Building"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
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
                    <select
                      value={newCustomer.state}
                      onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-900 text-xs font-bold focus:border-blue-600 focus:outline-none"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
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

                <div className="flex space-x-2 pt-2">
                  <Button type="button" onClick={() => setAgentStep(1)} variant="outline" className="w-1/3 font-bold py-2">Back</Button>
                  <Button type="button" onClick={() => setAgentStep(3)} variant="primary" className="w-2/3 font-bold py-2 shadow-md">Continue to Identity & KYC <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* STEP 3: IDENTITY & KYC UPLOAD */}
            {agentStep === 3 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase">Step 3 — Identity Numbers & KYC Document Upload</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      required
                      value={newCustomer.aadhaarNo}
                      onChange={(e) => setNewCustomer({ ...newCustomer, aadhaarNo: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      required
                      value={newCustomer.panNo}
                      onChange={(e) => setNewCustomer({ ...newCustomer, panNo: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Attach KYC Scans (Aadhaar / PAN PDF)</label>
                  <input
                    type="file"
                    onChange={(e) => setNewCustomer({ ...newCustomer, kycFile: e.target.files ? e.target.files[0] : null })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium"
                  />
                  <p className="text-[10px] text-amber-700 font-bold mt-1">Status: Pending DigiLocker / Underwriting Verification</p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button type="button" onClick={() => setAgentStep(2)} variant="outline" className="w-1/3 font-bold py-2">Back</Button>
                  <Button type="button" onClick={() => setAgentStep(4)} variant="primary" className="w-2/3 font-bold py-2 shadow-md">Continue to Needs Assessment <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* STEP 4: INSURANCE NEEDS ASSESSMENT */}
            {agentStep === 4 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase">Step 4 — Insurance Needs & Budget Assessment</label>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Insurance Category</label>
                  <select
                    value={newCustomer.insuranceType}
                    onChange={(e) => setNewCustomer({ ...newCustomer, insuranceType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold focus:border-blue-600 focus:outline-none"
                  >
                    <option value="HEALTH">Health Protection Shield</option>
                    <option value="MOTOR">Full Auto Motor Comprehensive</option>
                    <option value="LIFE">Term Life Security Reserve</option>
                    <option value="TRAVEL">International Travel Shield</option>
                    <option value="HOME">Home & Structure Protect</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Required Sum Insured (₹)</label>
                    <input
                      type="number"
                      value={newCustomer.coverageRequired}
                      onChange={(e) => setNewCustomer({ ...newCustomer, coverageRequired: parseInt(e.target.value) || 500000 })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Annual Budget (₹)</label>
                    <input
                      type="number"
                      value={newCustomer.budget}
                      onChange={(e) => setNewCustomer({ ...newCustomer, budget: parseInt(e.target.value) || 15000 })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button type="button" onClick={() => setAgentStep(3)} variant="outline" className="w-1/3 font-bold py-2">Back</Button>
                  <Button type="button" onClick={() => setAgentStep(5)} variant="primary" className="w-2/3 font-bold py-2 shadow-md">Generate Recommended Quote <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* STEP 5: PRODUCT RECOMMENDATION & QUOTE */}
            {agentStep === 5 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase">Step 5 — Recommended Product & Premium Breakdown</label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900">{newCustomer.planName}</span>
                    <span className="font-extrabold text-blue-600 text-sm">{formatCurrency(newCustomer.budget)}/yr</span>
                  </div>
                  <p>Sum Insured: <strong className="text-slate-900">{formatCurrency(newCustomer.coverageRequired)}</strong></p>
                  <p>Base Premium: <strong>₹12,712</strong> | GST 18%: <strong>₹2,288</strong></p>
                  <p className="text-emerald-600 font-bold">5% No-Claim Bonus (NCB) Discount Applied</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nominee Full Name & Relationship</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nominee Legal Name"
                      value={newCustomer.nomineeName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, nomineeName: e.target.value })}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Relationship (Spouse/Child)"
                      value={newCustomer.nomineeRelation}
                      onChange={(e) => setNewCustomer({ ...newCustomer, nomineeRelation: e.target.value })}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button type="button" onClick={() => setAgentStep(4)} variant="outline" className="w-1/3 font-bold py-2">Back</Button>
                  <Button type="button" onClick={() => setAgentStep(6)} variant="primary" className="w-2/3 font-bold py-2 shadow-md">Review & Create Proposal <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & SUBMIT PROPOSAL */}
            {agentStep === 6 && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-800 uppercase">Step 6 — Final Review & Proposal Submission</label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
                  <p>Customer Profile: <strong className="text-slate-900">{newCustomer.name} ({newCustomer.email})</strong></p>
                  <p>Phone / City: <strong className="text-slate-900">{newCustomer.phone} • {newCustomer.city}, {newCustomer.state}</strong></p>
                  <p>Selected Insurance: <strong className="text-blue-600 font-bold">{newCustomer.planName}</strong></p>
                  <p>Coverage Limit: <strong className="text-slate-900">{formatCurrency(newCustomer.coverageRequired)}</strong></p>
                  <p>Annual Premium Quote: <strong className="text-blue-600 font-bold">{formatCurrency(newCustomer.budget)}</strong></p>
                  <p>Nominee: <strong className="text-slate-900">{newCustomer.nomineeName} ({newCustomer.nomineeRelation})</strong></p>
                  <p>Assigned Advisor: <strong className="text-slate-900">{user?.name || 'Agent John Miller'}</strong></p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button type="button" onClick={() => setAgentStep(5)} variant="outline" className="w-1/3 font-bold py-2.5">Back</Button>
                  <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-2/3 font-bold py-2.5 shadow-md">
                    Submit Proposal to Underwriting
                  </Button>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* SUCCESS SCREEN (CUSTOMER CREATED & PROPOSAL SUBMITTED TO UNDERWRITING) */
          <div className="space-y-5 text-xs font-medium text-slate-800">
            {/* Header Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">✅ Customer Registered & Proposal Submitted</h4>
                  <p className="text-[11px] text-emerald-700">Proposal sent to Underwriting Desk for risk review & policy schedule generation.</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-amber-500 text-white uppercase shadow-xs">UNDERWRITING REVIEW</span>
            </div>

            {/* Generated Proposal Details */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Proposal Summary</span>
                <span className="font-mono font-bold text-blue-600">{generatedProposalId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Customer ID: <strong className="font-mono text-blue-600">CUST-{createdCustomer?.id?.substring(0, 8) || 'DBB39B9C'}</strong></div>
                <div>Customer Name: <strong className="text-slate-900">{createdCustomer?.name}</strong></div>
                <div>Plan Selected: <strong className="text-slate-900">{newCustomer.planName}</strong></div>
                <div>Annual Premium: <strong className="text-blue-600 font-bold">{formatCurrency(newCustomer.budget)}</strong></div>
                <div>KYC Proof Status: <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-extrabold text-[10px] uppercase border border-amber-200">Pending Underwriting Verification</span></div>
                <div>Assigned Advisor: <strong className="text-slate-900">{user?.name || 'Agent John Miller'}</strong></div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => { const cust = createdCustomer; setIsModalOpen(false); setSelectedCustomer(cust); }}
                className="text-xs font-bold py-2 justify-center bg-white"
              >
                👤 View Customer Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => { resetForm(); setAgentStep(1); setRegStep('form'); }}
                className="text-xs font-bold py-2 justify-center bg-white"
              >
                + Create Another Proposal
              </Button>
              <Button
                variant="primary"
                onClick={() => { setIsModalOpen(false); navigate('/dashboard'); }}
                className="text-xs font-bold py-2 justify-center shadow-md"
              >
                Track Proposal Status
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const CustomerProfileTabs: React.FC<{ customer: any; onBuyPolicy: (id: string) => void }> = ({ customer, onBuyPolicy }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'info' | 'policies' | 'claims' | 'kyc' | 'activity'>('info');

  const [kycDocs, setKycDocs] = useState([
    { id: 'k1', docType: 'Aadhaar Card (DigiLocker)', status: 'VERIFIED', uploadedOn: '2026-07-20', fileName: 'Aadhaar_Verified.pdf' },
    { id: 'k2', docType: 'PAN Card Verification', status: 'PENDING', uploadedOn: '2026-07-21', fileName: 'PAN_Card.jpg' },
    { id: 'k3', docType: 'Residential Address Proof', status: 'VERIFIED', uploadedOn: '2026-07-20', fileName: 'Electricity_Bill.pdf' },
  ]);

  const handleUpdateKycStatus = (docId: string, newStatus: string) => {
    setKycDocs(prev => prev.map(k => k.id === docId ? { ...k, status: newStatus } : k));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 pb-2 overflow-x-auto">
        {[
          { id: 'info', label: 'Personal Information' },
          { id: 'policies', label: 'Policies' },
          { id: 'claims', label: 'Claims' },
          { id: 'kyc', label: 'KYC Documents' },
          { id: 'activity', label: 'Activity Log' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === t.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-slate-700">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-mono font-bold text-blue-600">CUST-{customer.id.substring(0, 8)}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 uppercase">
              {customer.kycVerified ? 'KYC VERIFIED' : 'PENDING KYC'}
            </span>
          </div>
          <p>Full Legal Name: <strong className="text-slate-900">{customer.name}</strong></p>
          <p>Email Address: <strong className="text-slate-900">{customer.email}</strong></p>
          <p>Mobile Number: <strong className="text-slate-900">{customer.phone}</strong></p>
          <p>Address: <strong className="text-slate-900">{customer.address}, {customer.city}, {customer.state} ({customer.pincode})</strong></p>
          <p>Date of Birth: <strong className="text-slate-900">{customer.dob || '1992-05-15'}</strong></p>
          <p>Gender: <strong className="text-slate-900">{customer.gender || 'Male'}</strong></p>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-2">
          <p className="font-bold text-slate-900">Active Insurance Contracts ({customer._count?.policies || 1})</p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex justify-between font-bold text-slate-900">
              <span>POL-2026-000001</span>
              <span className="text-blue-600 font-bold">ACTIVE</span>
            </div>
            <p className="text-slate-600">Comprehensive Executive Health Shield (₹10 Lakh Cover)</p>
            <p className="text-[11px] text-slate-500">Annual Premium: ₹1,450 / Year</p>
          </div>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="space-y-2">
          <p className="font-bold text-slate-900">Claim Evidence History</p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
            <div className="flex justify-between font-bold text-slate-900">
              <span>CLM-2026-0012</span>
              <span className="text-emerald-600 font-bold">APPROVED</span>
            </div>
            <p>Apollo Hospitals Pre-Authorization Settlement (₹45,000)</p>
          </div>
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="space-y-3">
          <p className="font-bold text-slate-900">Uploaded KYC Proofs & Verification</p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="p-2">Document Type</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Uploaded</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kycDocs.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-900">{k.docType}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        k.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : k.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="p-2 text-slate-500">{k.uploadedOn}</td>
                    <td className="p-2 text-right space-x-1">
                      {user?.role !== 'AGENT' && k.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleUpdateKycStatus(k.id, 'VERIFIED')}
                          className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]"
                        >
                          Verify
                        </button>
                      )}
                      {user?.role !== 'AGENT' && k.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateKycStatus(k.id, 'REJECTED')}
                          className="px-2 py-1 bg-rose-600 text-white font-bold rounded text-[10px]"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-slate-600">
          <p className="font-bold text-slate-900">Recent Customer Activity Trail</p>
          <ul className="space-y-1 text-[11px] list-disc list-inside">
            <li>Profile Registered by Agent</li>
            <li>DigiLocker KYC Proof Linked</li>
            <li>Policy Proposal Submitted to Underwriting</li>
          </ul>
        </div>
      )}

      <Button onClick={() => onBuyPolicy(customer.id)} variant="primary" className="w-full font-bold py-2.5 mt-2">
        <ShoppingCart className="w-4 h-4 mr-2" /> {user?.role === 'AGENT' ? 'Create Policy Proposal' : 'Buy Policy'}
      </Button>
    </div>
  );
};
