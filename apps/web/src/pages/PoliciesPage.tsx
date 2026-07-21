import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, Download, RefreshCw, XCircle, Eye, ShoppingCart, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api, downloadFile } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const PoliciesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [policies, setPolicies] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Policy Detail Modal
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  // Buy Policy Catalog Modal state
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Issuance Wizard Modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newPolicy, setNewPolicy] = useState({
    customerId: '',
    policyType: 'HEALTH',
    planName: 'Comprehensive Executive Health Shield',
    sumInsured: 250000,
    premiumAmount: 1450,
    premiumFrequency: 'YEARLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nominee: '',
  });

  const availablePlans = [
    {
      type: 'HEALTH',
      name: 'Comprehensive Health Shield',
      coverage: 250000,
      premium: 1450,
      features: ['Cashless Hospitalization', 'Zero Co-Pay', 'Pre & Post Care Coverage', 'Global Ambulance Service'],
    },
    {
      type: 'MOTOR',
      name: 'Full Auto Comprehensive Protection',
      coverage: 75000,
      premium: 890,
      features: ['Zero Depreciation', '24/7 Roadside Assistance', 'Engine & Gearbox Protect', 'Personal Accident Cover'],
    },
    {
      type: 'LIFE',
      name: 'Term Life Security Reserve',
      coverage: 1000000,
      premium: 2100,
      features: ['Guaranteed Death Benefit', 'Critical Illness Rider', 'Tax Savings Certificate', 'Flexible Nominee Transfer'],
    },
    {
      type: 'HOME',
      name: 'Structural & Contents Guardian',
      coverage: 500000,
      premium: 650,
      features: ['Fire & Flood Protection', 'Burglary & Theft Replacement', 'Structure Reconstruction', 'Alternative Housing Allowance'],
    },
    {
      type: 'TRAVEL',
      name: 'Global Voyager Pass',
      coverage: 100000,
      premium: 320,
      features: ['Medical Evacuation', 'Flight Cancellation Refund', 'Lost Baggage Coverage', '24/7 Global Helpline'],
    },
  ];

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/policies?search=${search}&status=${statusFilter}&policyType=${typeFilter}`);
      setPolicies(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const fetchCustomersList = async () => {
      try {
        const res = await api.get('/customers?limit=100');
        setCustomers(res.data.data || []);
        if (res.data.data?.length > 0) {
          setNewPolicy((prev) => ({ ...prev, customerId: res.data.data[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isWizardOpen) fetchCustomersList();
  }, [isWizardOpen]);

  const handleIssuePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If customer is buying for themselves
      const customerId = user?.role === 'CUSTOMER' ? user.customerId : newPolicy.customerId;
      if (!customerId) {
        alert('Please select or register a valid customer profile');
        return;
      }

      await api.post('/policies', {
        ...newPolicy,
        customerId,
      });

      setIsWizardOpen(false);
      setIsBuyModalOpen(false);
      setSelectedPlan(null);
      setWizardStep(1);
      fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Policy issuance failed');
    }
  };

  const handleSelectPlanToBuy = (plan: any) => {
    setNewPolicy({
      ...newPolicy,
      policyType: plan.type,
      planName: plan.name,
      sumInsured: plan.coverage,
      premiumAmount: plan.premium,
    });
    setSelectedPlan(plan);
    setIsBuyModalOpen(true);
  };

  const handleRenew = async (id: string) => {
    if (!confirm('Renew this policy for an additional 12-month coverage term?')) return;
    try {
      await api.post(`/policies/${id}/renew`);
      fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Renewal failed');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this active policy?')) return;
    try {
      await api.post(`/policies/${id}/cancel`);
      fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Cancellation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Policy Management & Catalog</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Browse plans, purchase coverage, and manage active contracts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setIsBuyModalOpen(true)}>
            <ShoppingCart className="w-4 h-4 mr-2 text-blue-600" /> Browse Plan Catalog
          </Button>
          {user?.role !== 'CUSTOMER' && (
            <Button variant="primary" onClick={() => setIsWizardOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Issue Policy Wizard
            </Button>
          )}
        </div>
      </div>

      {/* Plan Catalog Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" /> Available Insurance Coverage Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availablePlans.slice(0, 3).map((plan) => (
            <Card key={plan.name} className="flex flex-col justify-between hover:border-blue-300 transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                    {plan.type}
                  </span>
                  <span className="text-lg font-extrabold text-blue-600">{formatCurrency(plan.premium)}<span className="text-xs text-slate-500 font-normal">/yr</span></span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Coverage Limit: <strong className="text-slate-900">{formatCurrency(plan.coverage)}</strong></p>

                <ul className="mt-3 space-y-1.5 text-xs text-slate-600 font-medium">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSelectPlanToBuy(plan)}
                className="mt-4 w-full text-xs font-bold"
              >
                Purchase Plan <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search policies by number or plan name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="RENEWAL_DUE">RENEWAL_DUE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none"
          >
            <option value="">All Policy Types</option>
            <option value="HEALTH">HEALTH</option>
            <option value="LIFE">LIFE</option>
            <option value="MOTOR">MOTOR</option>
            <option value="HOME">HOME</option>
            <option value="TRAVEL">TRAVEL</option>
          </select>
        </div>
      </Card>

      {/* Policy Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Policy Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type & Plan</th>
                <th className="px-6 py-4">Sum Insured</th>
                <th className="px-6 py-4">Premium</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 animate-pulse font-medium">
                    Loading policies database...
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No matching policy records found.
                  </td>
                </tr>
              ) : (
                policies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{p.policyNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{p.customer?.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{p.customer?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-blue-600">{p.policyType}</span>
                      <p className="text-xs text-slate-700 font-medium truncate max-w-xs">{p.planName}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(p.sumInsured)}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(p.premiumAmount)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={p.status === 'ACTIVE' ? 'active' : p.status === 'RENEWAL_DUE' ? 'pending' : 'neutral'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPolicy(p)}
                        className="inline-flex items-center px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => downloadFile(`/policies/${p.id}/pdf`, `Schedule_${p.policyNumber}.pdf`)}
                        className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-xs text-blue-700 font-bold border border-blue-200"
                        title="Download Schedule PDF"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF
                      </button>

                      {user?.role !== 'CUSTOMER' && p.status !== 'CANCELLED' && (
                        <>
                          <button
                            onClick={() => handleRenew(p.id)}
                            className="inline-flex items-center px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-xs text-blue-700 font-semibold"
                            title="Renew Policy"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCancel(p.id)}
                            className="inline-flex items-center px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-xs text-rose-700 font-semibold"
                            title="Cancel Policy"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Policy Detail Modal */}
      <Modal isOpen={!!selectedPolicy} onClose={() => setSelectedPolicy(null)} title={`Policy Contract — ${selectedPolicy?.policyNumber}`}>
        {selectedPolicy && (
          <div className="space-y-4 text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-blue-600 uppercase">{selectedPolicy.policyType} COVERAGE</span>
                <Badge variant={selectedPolicy.status === 'ACTIVE' ? 'active' : 'pending'}>{selectedPolicy.status}</Badge>
              </div>
              <p>Plan Title: <strong className="text-slate-900">{selectedPolicy.planName}</strong></p>
              <p>Policyholder: <strong className="text-slate-900">{selectedPolicy.customer?.name} ({selectedPolicy.customer?.email})</strong></p>
              <p>Sum Insured: <strong className="text-slate-900">{formatCurrency(selectedPolicy.sumInsured)}</strong></p>
              <p>Annual Premium: <strong className="text-blue-600">{formatCurrency(selectedPolicy.premiumAmount)}</strong> ({selectedPolicy.premiumFrequency})</p>
              <p>Coverage Term: <strong className="text-slate-900">{formatDate(selectedPolicy.startDate)} to {formatDate(selectedPolicy.endDate)}</strong></p>
              <p>Primary Nominee: <strong className="text-slate-900">{selectedPolicy.nominee || 'N/A'}</strong></p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={() => downloadFile(`/policies/${selectedPolicy.id}/pdf`, `Schedule_${selectedPolicy.policyNumber}.pdf`)}
                className="w-full font-bold"
              >
                <Download className="w-4 h-4 mr-2" /> Download Certificate PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Buy Policy Catalog Modal */}
      <Modal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} title="Select & Purchase Insurance Policy">
        <form onSubmit={handleIssuePolicy} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Coverage Category</label>
            <select
              value={newPolicy.policyType}
              onChange={(e) => {
                const type = e.target.value;
                const match = availablePlans.find((p) => p.type === type) || availablePlans[0];
                setNewPolicy({
                  ...newPolicy,
                  policyType: type,
                  planName: match.name,
                  sumInsured: match.coverage,
                  premiumAmount: match.premium,
                });
              }}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
            >
              <option value="HEALTH">HEALTH INSURANCE</option>
              <option value="MOTOR">MOTOR AUTOMOBILE</option>
              <option value="LIFE">TERM LIFE</option>
              <option value="HOME">HOME & CONTENTS</option>
              <option value="TRAVEL">GLOBAL TRAVEL</option>
            </select>
          </div>

          {user?.role !== 'CUSTOMER' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Customer</label>
              <select
                value={newPolicy.customerId}
                onChange={(e) => setNewPolicy({ ...newPolicy, customerId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Plan Title</label>
            <input
              type="text"
              required
              value={newPolicy.planName}
              onChange={(e) => setNewPolicy({ ...newPolicy, planName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sum Insured ($)</label>
              <input
                type="number"
                required
                value={newPolicy.sumInsured}
                onChange={(e) => setNewPolicy({ ...newPolicy, sumInsured: parseFloat(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Annual Premium ($)</label>
              <input
                type="number"
                required
                value={newPolicy.premiumAmount}
                onChange={(e) => setNewPolicy({ ...newPolicy, premiumAmount: parseFloat(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Primary Nominee Beneficiary</label>
            <input
              type="text"
              value={newPolicy.nominee}
              onChange={(e) => setNewPolicy({ ...newPolicy, nominee: e.target.value })}
              placeholder="e.g. Spouse / Relative Name"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 font-bold shadow-md">
            Confirm & Purchase Active Policy
          </Button>
        </form>
      </Modal>

      {/* Admin Wizard Modal */}
      <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title={`Create Policy Wizard — Step ${wizardStep} of 3`}>
        <form onSubmit={handleIssuePolicy} className="space-y-4">
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Customer</label>
                <select
                  value={newPolicy.customerId}
                  onChange={(e) => setNewPolicy({ ...newPolicy, customerId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Policy Category</label>
                <select
                  value={newPolicy.policyType}
                  onChange={(e) => setNewPolicy({ ...newPolicy, policyType: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
                >
                  <option value="HEALTH">HEALTH</option>
                  <option value="LIFE">LIFE</option>
                  <option value="MOTOR">MOTOR</option>
                  <option value="HOME">HOME</option>
                  <option value="TRAVEL">TRAVEL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={newPolicy.planName}
                  onChange={(e) => setNewPolicy({ ...newPolicy, planName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
                />
              </div>

              <Button type="button" onClick={() => setWizardStep(2)} className="w-full font-bold">Next: Coverage & Terms</Button>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sum Insured ($)</label>
                  <input
                    type="number"
                    required
                    value={newPolicy.sumInsured}
                    onChange={(e) => setNewPolicy({ ...newPolicy, sumInsured: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Premium Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={newPolicy.premiumAmount}
                    onChange={(e) => setNewPolicy({ ...newPolicy, premiumAmount: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nominee Beneficiary</label>
                <input
                  type="text"
                  value={newPolicy.nominee}
                  onChange={(e) => setNewPolicy({ ...newPolicy, nominee: e.target.value })}
                  placeholder="Primary Nominee Name"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
                />
              </div>

              <div className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={() => setWizardStep(1)} className="w-1/3 font-bold">Back</Button>
                <Button type="button" onClick={() => setWizardStep(3)} className="w-2/3 font-bold">Review Schedule</Button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-700">
                <p>Category: <strong className="text-blue-600">{newPolicy.policyType}</strong></p>
                <p>Plan Name: <strong className="text-slate-900">{newPolicy.planName}</strong></p>
                <p>Sum Insured: <strong className="text-slate-900">{formatCurrency(newPolicy.sumInsured)}</strong></p>
                <p>Premium Amount: <strong className="text-blue-600">{formatCurrency(newPolicy.premiumAmount)}</strong> / Year</p>
              </div>

              <div className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={() => setWizardStep(2)} className="w-1/3 font-bold">Back</Button>
                <Button type="submit" className="w-2/3 font-bold">Issue Active Policy</Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
