import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, ShieldCheck, CheckCircle2, ArrowRight, CreditCard, Lock, Download, AlertCircle, QrCode, Smartphone, Building2, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api, downloadFile } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const policyId = searchParams.get('policyId') || '';

  const [step, setStep] = useState<number>(1);
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'EMI'>('UPI');
  const [upiApp, setUpiApp] = useState('GPay');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Rajesh Sharma');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<any>(null);

  useEffect(() => {
    const fetchUserPolicies = async () => {
      try {
        const res = await api.get('/policies');
        const list = res.data.data || [];
        setPolicies(list);

        if (policyId) {
          const match = list.find((p: any) => p.id === policyId);
          if (match) setSelectedPolicy(match);
          else if (list.length > 0) setSelectedPolicy(list[0]);
        } else if (list.length > 0) {
          setSelectedPolicy(list[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserPolicies();
  }, [policyId]);

  const baseAmount = selectedPolicy?.premiumAmount || 14500;
  const gstAmount = Math.round(baseAmount * 0.18);
  const ncbDiscount = Math.round(baseAmount * 0.05);
  const totalAmount = baseAmount + gstAmount - ncbDiscount;

  const handleExecutePayment = async () => {
    if (!selectedPolicy) return;
    setIsProcessing(true);

    try {
      const res = await api.post('/payments', {
        policyId: selectedPolicy.id,
        amount: totalAmount,
        method: paymentMethod,
        transactionRef: `TXN-IRDAI-${Date.now()}`,
      });

      setCompletedPayment(res.data.data);
      setIsProcessing(false);
      setStep(4); // Move to Success Step
    } catch (err: any) {
      setIsProcessing(false);
      alert(err.response?.data?.error?.message || 'Payment execution failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Top Header Strip */}
      <div className="bg-slate-900 text-white py-4 px-6 border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">INSURECORE</span>
              <p className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">Institutional Payment Gateway</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-300 font-bold">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted Transaction</span>
          </div>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 mb-8 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>1</span>
            <span>Policy Review</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>2</span>
            <span>Tax & Payer KYC</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>3</span>
            <span>Payment Method</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>4</span>
            <span>Receipt Issued</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* STEP 1: POLICY & PLAN REVIEW */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900">Step 1: Select & Review Target Policy</h2>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Active Policy</label>
                <select
                  value={selectedPolicy?.id}
                  onChange={(e) => {
                    const match = policies.find((p) => p.id === e.target.value);
                    if (match) setSelectedPolicy(match);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none"
                >
                  {policies.map((pol) => (
                    <option key={pol.id} value={pol.id}>
                      {pol.policyNumber} — {pol.planName} ({pol.policyType})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPolicy && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-xs text-blue-900 font-medium">
                  <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                    <span className="font-bold">{selectedPolicy.planName}</span>
                    <span className="font-mono font-bold text-blue-700">{selectedPolicy.policyNumber}</span>
                  </div>
                  <p>Sum Insured Cap: <strong className="text-slate-900">{formatCurrency(selectedPolicy.sumInsured)}</strong></p>
                  <p>Policyholder: <strong className="text-slate-900">{selectedPolicy.customer?.name} ({selectedPolicy.customer?.email})</strong></p>
                  <p>Nominee: <strong className="text-slate-900">{selectedPolicy.nominee}</strong></p>
                </div>
              )}
            </div>

            {/* Tax Calculation Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Statutory Premium & Tax Calculation</h3>
              <div className="flex justify-between text-slate-600 font-medium py-1">
                <span>Base Annual Premium</span>
                <span className="font-bold text-slate-900">{formatCurrency(baseAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium py-1">
                <span>GST (18% Statutory Tax)</span>
                <span className="font-bold text-slate-900">+{formatCurrency(gstAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium py-1">
                <span>No-Claim Bonus (5% Discount)</span>
                <span className="font-bold">-{formatCurrency(ncbDiscount)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-extrabold text-blue-700">
                <span>Total Amount Payable</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <Button onClick={() => setStep(2)} variant="primary" className="w-full py-4 font-bold text-base shadow-md">
              Proceed to Tax & Payer Details <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 2: PAYER & SECTION 80D TAX DETAILS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900">Step 2: Payer Identity & Section 80D Tax Information</h2>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 font-medium">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Official 80D Tax Receipt will be generated in the name of the policyholder below for Income Tax filing.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Policyholder Full Name</label>
                <input
                  type="text"
                  value={selectedPolicy?.customer?.name || user?.name || ''}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">PAN Card Number (For Section 80D)</label>
                  <input
                    type="text"
                    defaultValue="ABCDE1234F"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Receipt Delivery Email</label>
                  <input
                    type="email"
                    value={selectedPolicy?.customer?.email || user?.email || ''}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={() => setStep(1)} variant="outline" className="w-1/3 py-3 font-bold">
                Back to Review
              </Button>
              <Button onClick={() => setStep(3)} variant="primary" className="w-2/3 py-3 font-bold shadow-md">
                Select Payment Method <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT METHOD & GATEWAY */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <h2 className="text-xl font-extrabold text-slate-900">Step 3: Select Payment Method</h2>
                <span className="text-base font-extrabold text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>

              {/* Payment Method Selector Grid */}
              <div className="grid grid-cols-4 gap-3 text-xs font-bold">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'NETBANKING', label: 'NetBanking', icon: Building2 },
                  { id: 'EMI', label: 'Auto-Debit EMI', icon: QrCode },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 transition border ${
                        paymentMethod === m.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Form Based on Selected Payment Method */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Preferred UPI App</p>
                  <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                    {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiApp(app)}
                        className={`py-3 rounded-xl border ${
                          upiApp === app ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button onClick={() => setStep(2)} variant="outline" className="w-1/3 py-3 font-bold">
                Back
              </Button>
              <Button
                onClick={handleExecutePayment}
                disabled={isProcessing}
                variant="primary"
                className="w-2/3 py-4 font-extrabold text-base shadow-md"
              >
                {isProcessing ? 'Processing Transaction...' : `Pay ${formatCurrency(totalAmount)} Now`}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION & 80D RECEIPT DOWNLOAD */}
        {step === 4 && completedPayment && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Payment Verified & Policy Active!</h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">Official Premium Payment Receipt & Section 80D Tax Certificate Generated.</p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-left font-medium">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-900">{completedPayment.transactionRef}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Policy Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedPolicy?.policyNumber}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1">
                <span>Amount Paid:</span>
                <span>{formatCurrency(completedPayment.amount)}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <Button
                onClick={() => downloadFile(`/payments/${completedPayment.id}/receipt`, `Receipt_${completedPayment.id}.pdf`)}
                variant="primary"
                className="font-bold py-3 px-6"
              >
                <Download className="w-4 h-4 mr-2" /> Download Section 80D Tax Receipt PDF
              </Button>
              <Button onClick={() => navigate('/payments')} variant="outline" className="font-bold py-3 px-6">
                Return to Payments Ledger
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
