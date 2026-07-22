import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, ShieldCheck, CheckCircle2, ArrowRight, CreditCard, Lock, Download, AlertCircle, QrCode, Smartphone, Building2, Check, Sparkles, Send, PhoneCall, FileText } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'EMI' | 'CORPORATE'>('UPI');
  const [upiApp, setUpiApp] = useState('GPay');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 8892');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Alexander Pierce');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('889');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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
  const rawTotal = baseAmount + gstAmount - ncbDiscount;
  const totalAmount = Math.max(0, rawTotal - couponDiscount);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'INSURECORE2026' || couponCode.trim().toUpperCase() === 'WELCOME500') {
      setAppliedCoupon(couponCode.trim().toUpperCase());
      setCouponDiscount(1000);
      setActionMessage('Coupon applied successfully! ₹1,000 discount added.');
    } else {
      alert('Invalid coupon code. Try using INSURECORE2026 or WELCOME500');
    }
  };

  const handleExecutePayment = async () => {
    if (!selectedPolicy) return;
    if (!agreeTerms) {
      alert('Please agree to policy terms & IRDAI KYC declaration to proceed.');
      return;
    }
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

          <div className="flex items-center space-x-4 text-xs text-slate-300 font-bold">
            <span className="flex items-center text-emerald-400"><Lock className="w-4 h-4 mr-1" /> PCI-DSS Level 1 Encrypted</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">IRDAI Reg No. 154</span>
          </div>
        </div>
      </div>

      {/* Progress Steps Header */}
      {step < 4 && (
        <div className="bg-white border-b border-slate-200 py-4 px-6 mb-8 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs font-bold">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Order Summary</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>2</span>
              <span>Billing & Tax KYC</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Secure Checkout</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>4</span>
              <span>Policy Issued</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6">
        {step < 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Interactive Checkout Desk */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <h2 className="text-xl font-extrabold text-slate-900">Step 1: Select Target Policy & Review</h2>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
                      IRDAI Approved Plan
                    </span>
                  </div>

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
                    <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 text-xs text-blue-900 font-medium">
                      <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                        <span className="font-extrabold text-sm">{selectedPolicy.planName}</span>
                        <span className="font-mono font-bold text-blue-700">{selectedPolicy.policyNumber}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700">
                        <p>Coverage Cap: <strong className="text-slate-900">{formatCurrency(selectedPolicy.sumInsured)}</strong></p>
                        <p>Policyholder: <strong className="text-slate-900">{selectedPolicy.customer?.name}</strong></p>
                        <p>Frequency: <strong className="text-slate-900">{selectedPolicy.premiumFrequency}</strong></p>
                        <p>Nominee: <strong className="text-slate-900">{selectedPolicy.nominee || 'Priya Sharma'}</strong></p>
                      </div>
                    </div>
                  )}

                  {/* Coupon Code Engine */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Have a Promo or Referral Coupon?</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. INSURECORE2026 or WELCOME500"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                      />
                      <Button onClick={handleApplyCoupon} variant="outline" className="font-bold text-xs py-2">
                        Apply Coupon
                      </Button>
                    </div>
                    {actionMessage && <p className="text-xs font-bold text-emerald-600">{actionMessage}</p>}
                  </div>

                  <Button onClick={() => setStep(2)} variant="primary" className="w-full py-4 font-bold text-base shadow-md">
                    Proceed to Tax & Payer Details <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  <h2 className="text-xl font-extrabold text-slate-900">Step 2: Payer Identity & Section 80D Tax Details</h2>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 font-medium">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Official 80D Tax Exemption Certificate will be generated for Income Tax filing under IT Act 1961.</span>
                  </div>

                  <div className="space-y-4 text-xs font-medium">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Policyholder Full Legal Name</label>
                      <input
                        type="text"
                        value={selectedPolicy?.customer?.name || user?.name || ''}
                        readOnly
                        className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 font-bold text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">PAN Card Number</label>
                        <input
                          type="text"
                          defaultValue="ABCDE1234F"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 uppercase"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Receipt Email</label>
                        <input
                          type="email"
                          value={selectedPolicy?.customer?.email || user?.email || ''}
                          readOnly
                          className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => setStep(1)} variant="outline" className="w-1/3 py-3 font-bold">
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} variant="primary" className="w-2/3 py-3 font-bold shadow-md">
                      Select Payment Gateway <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <h2 className="text-xl font-extrabold text-slate-900">Step 3: Select Payment Gateway</h2>
                    <span className="text-xl font-extrabold text-blue-600">{formatCurrency(totalAmount)}</span>
                  </div>

                  {/* Payment Method Tabs */}
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

                  {paymentMethod === 'UPI' && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Preferred Instant UPI App</p>
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
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1">CVV Security Code</label>
                          <input
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
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
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="terms">
                      I agree to policy wording terms, IRDAI e-KYC consent declaration, and refund rules.
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => setStep(2)} variant="outline" className="w-1/3 py-3 font-bold">
                      Back
                    </Button>
                    <Button
                      onClick={handleExecutePayment}
                      disabled={isProcessing || !agreeTerms}
                      variant="primary"
                      className="w-2/3 py-4 font-extrabold text-base shadow-md"
                    >
                      {isProcessing ? 'Processing Transaction...' : `Pay ${formatCurrency(totalAmount)} Now`}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Order Summary & Trust Badge Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 space-y-4 bg-white border-slate-200 shadow-md">
                <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-200 pb-3">Itemized Order Summary</h3>
                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between text-slate-700"><span>Base Policy Premium:</span><strong className="text-slate-900">{formatCurrency(baseAmount)}</strong></div>
                  <div className="flex justify-between text-slate-600"><span>GST (18% Statutory Tax):</span><strong className="text-slate-900">+{formatCurrency(gstAmount)}</strong></div>
                  <div className="flex justify-between text-emerald-700"><span>No-Claim Bonus (5% Discount):</span><strong className="text-emerald-700">-{formatCurrency(ncbDiscount)}</strong></div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700"><span>Promo Discount ({appliedCoupon}):</span><strong className="text-emerald-700">-{formatCurrency(couponDiscount)}</strong></div>
                  )}
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-slate-900">
                    <span className="font-extrabold text-sm">Total Net Payable:</span>
                    <span className="text-2xl font-extrabold text-blue-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </Card>

              <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Institutional Bank Grade Security</span>
                </div>
                <p className="text-slate-400 font-medium">
                  Verified by Visa • Mastercard SecureCode • RuPay Secure • 256-Bit SSL Encryption • PCI DSS Level 1 Certified
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION & 80D RECEIPT DOWNLOAD */}
        {step === 4 && completedPayment && (
          <div className="bg-white border border-emerald-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <Check className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Transaction Verified & Approved
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Policy Issued Successfully!</h2>
              <p className="text-slate-500 text-xs font-medium">Official Digital Certificate & Section 80D Tax Receipt generated cleanly in InsureCore DB.</p>
            </div>

            <div className="max-w-xl mx-auto p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 text-left font-medium">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Transaction Reference:</span>
                <span className="font-mono font-bold text-slate-900">{completedPayment.transactionRef}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Policy Certificate Number:</span>
                <span className="font-mono font-bold text-blue-600">{selectedPolicy?.policyNumber || 'POL-2026-00128'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Total Net Amount Paid:</span>
                <span className="font-extrabold text-emerald-700 text-sm">{formatCurrency(completedPayment.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Coverage End Date:</span>
                <span className="font-bold text-slate-900">{selectedPolicy?.endDate ? new Date(selectedPolicy.endDate).toLocaleDateString('en-IN') : '31/03/2027'}</span>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
              <Button
                onClick={() => downloadFile(`/policies/${selectedPolicy?.id || completedPayment.policyId}/pdf`, `Schedule_${selectedPolicy?.policyNumber}.pdf`)}
                variant="primary"
                className="text-xs font-bold py-3"
              >
                <FileText className="w-4 h-4 mr-1.5" /> Policy Schedule
              </Button>
              <Button
                onClick={() => downloadFile(`/payments/${completedPayment.id}/receipt`, `Receipt_${completedPayment.id}.pdf`)}
                variant="outline"
                className="text-xs font-bold py-3"
              >
                <Download className="w-4 h-4 mr-1.5" /> 80D Tax Receipt
              </Button>
              <Button
                onClick={() => downloadFile(`/policies/${selectedPolicy?.id || completedPayment.policyId}/health-card`, `HealthCard_${selectedPolicy?.policyNumber}.pdf`)}
                variant="outline"
                className="text-xs font-bold py-3"
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> Health Card
              </Button>
              <Button
                onClick={() => alert('Policy Certificate copy has been sent to your registered email and WhatsApp number.')}
                variant="outline"
                className="text-xs font-bold py-3"
              >
                <Send className="w-4 h-4 mr-1.5" /> Email & WhatsApp
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-center space-x-4">
              <Button onClick={() => navigate('/policies')} variant="primary" className="font-bold py-3 px-8">
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
