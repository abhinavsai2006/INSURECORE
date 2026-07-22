import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, HeartPulse, Car, ShieldCheck, Plane, Home, CheckCircle2, ArrowRight, ArrowLeft, Download, CreditCard, Lock, Sparkles, User, FileText, Check, Share2, AlertCircle, RefreshCw, Layers, DollarSign, FileCheck, Building, Star, Info, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../lib/utils';
import { api, downloadFile } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const NewPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Form State across wizard
  const [insuranceType, setInsuranceType] = useState('HEALTH');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Product Details Drawer state
  const [activeDrawerProduct, setActiveDrawerProduct] = useState<any | null>(null);

  const [proposalDetails, setProposalDetails] = useState({
    address: 'Flat 402, InsureCore Residency, BKC, Bandra East, Mumbai - 400051',
    dob: '1990-06-15',
    gender: 'Male',
    nomineeName: 'Priya Sharma',
    nomineeRelation: 'Spouse',
    preExistingDiseases: 'None',
    vehicleNumber: 'MH 02 CZ 9988',
  });

  const [healthInfo, setHealthInfo] = useState({
    floaterType: 'Family Floater',
    members: 'Self, Spouse, 1 Child',
    heightCm: '175',
    weightKg: '72',
    smoking: 'No',
  });

  const [motorInfo, setMotorInfo] = useState({
    regNo: 'MH 02 CZ 9988',
    brandModel: 'Honda City ZX i-VTEC',
    previousNCB: '20% NCB',
    dlNumber: 'MH-02-2021-0084920',
  });

  const [lifeInfo, setLifeInfo] = useState({
    occupation: 'Salaried IT Professional',
    annualIncome: '2500000',
  });

  const [issuedPolicy, setIssuedPolicy] = useState<any>(null);

  // Expanded Product Catalogue (15+ Health, Motor, Life, Travel, Home)
  const plansList: Record<string, any[]> = {
    HEALTH: [
      { id: 'h1', title: 'Individual Health Shield', rating: '4.8', coverage: 500000, basePremium: 850, claimRatio: '98.4%', cashless: '10,500+ Hospitals', roomRent: 'Single Private AC', copay: '0% Co-Pay', badge: 'Popular', features: ['₹5 Lakh Sum Insured', 'Cashless Hospitalization', 'Pre/Post 60/90 Days', 'AYUSH Treatment'], exclusions: ['Pre-existing initial 24-mo waiting', 'Cosmetic procedures'] },
      { id: 'h2', title: 'Family Floater Elite', rating: '4.9', coverage: 1000000, basePremium: 1450, claimRatio: '98.4%', cashless: '10,500+ Hospitals', roomRent: 'No Capping', copay: '0% Co-Pay', badge: 'Best Seller', features: ['₹10 Lakh Sum Insured', 'Zero Room Rent Capping', 'Organ Donor Benefit', 'Free Annual Checkup'], exclusions: ['Experimental therapy'] },
      { id: 'h3', title: 'Senior Citizen Care Plus', rating: '4.7', coverage: 1500000, basePremium: 2200, claimRatio: '98.4%', cashless: '10,500+ Hospitals', roomRent: 'Single Private AC', copay: '10% Co-Pay', badge: 'Senior Special', features: ['Pre-Existing Disease Covered after 12 Months', 'Ayurvedic Inpatient Care', 'Home Domiciliary Care'], exclusions: ['Aesthetic surgery'] },
      { id: 'h4', title: 'Critical Illness Protect', rating: '4.9', coverage: 2500000, basePremium: 1950, claimRatio: '98.4%', cashless: 'Lump-Sum Payout', roomRent: 'No Cap', copay: '0% Co-Pay', badge: 'Recommended', features: ['₹25 Lakh Lump-Sum Diagnosis Benefit', '36 Critical Illnesses Covered', 'Second Medical Opinion'], exclusions: ['Pre-existing within 90 days'] },
      { id: 'h5', title: 'Cancer Care Plus', rating: '4.9', coverage: 5000000, basePremium: 2100, claimRatio: '98.4%', cashless: 'Global Oncology', roomRent: 'No Cap', copay: '0% Co-Pay', badge: 'Specialty Shield', features: ['₹50 Lakh Oncology Benefit', 'Chemotherapy & Targeted Radiation', 'Proton Therapy Included'], exclusions: ['Pre-existing cancer'] },
      { id: 'h6', title: 'Platinum 1-Crore Shield', rating: '5.0', coverage: 10000000, basePremium: 2800, claimRatio: '98.4%', cashless: 'Global Network', roomRent: 'Suite Allowed', copay: '0% Co-Pay', badge: 'Ultra Premium', features: ['₹1 Crore Global Sum Insured', 'Air Ambulance Evacuation', 'Zero Co-Pay Nationwide', 'Unlimited Restore'], exclusions: ['War risk'] },
    ],
    MOTOR: [
      { id: 'm1', title: 'Auto Zero-Dep Comprehensive', rating: '4.9', coverage: 500000, basePremium: 750, claimRatio: '97.8%', cashless: '6,200+ Garages', roomRent: 'N/A', copay: '0% Co-Pay', badge: 'Best Seller', features: ['100% Zero-Depreciation Parts', 'Engine & Gearbox Protect', '24x7 Roadside Spot Repair'], exclusions: ['Consequential damage'] },
      { id: 'm2', title: 'Third Party Legal Guard', rating: '4.6', coverage: 750000, basePremium: 350, claimRatio: '97.8%', cashless: 'IRDAI Mandated', roomRent: 'N/A', copay: '0%', badge: 'Mandatory Cover', features: ['Property Damage Liability up to ₹7.5 Lakh', 'Personal Injury Liability', 'Legal Defense Cover'], exclusions: ['Own Vehicle Damage'] },
      { id: 'm3', title: 'Electric Vehicle Shield', rating: '4.8', coverage: 800000, basePremium: 920, claimRatio: '97.8%', cashless: 'EV Authorized Garages', roomRent: 'N/A', copay: '0%', badge: 'EV Special', features: ['Battery Pack Protection', 'Wall Box Charger Insurance', 'Towing to Charging Station'], exclusions: ['Water submergence due to negligence'] },
    ],
    LIFE: [
      { id: 'l1', title: 'Term Life Security Reserve', rating: '4.9', coverage: 10000000, basePremium: 1800, claimRatio: '99.1%', cashless: 'Instant Claim Payout', roomRent: 'N/A', copay: 'N/A', badge: 'Tax Saver 80C', features: ['₹1 Crore Guaranteed Death Payout', 'Terminal Illness Advance Benefit', 'Section 80C Tax Exemption'], exclusions: ['Suicide within 12 months'] },
      { id: 'l2', title: 'Smart Life Shield', rating: '4.9', coverage: 15000000, basePremium: 2400, claimRatio: '99.1%', cashless: 'Direct Bank Settlement', roomRent: 'N/A', copay: 'N/A', badge: 'Recommended', features: ['₹1.5 Crore Sum Assured', 'Accidental Disability Rider', 'Waiver of Premium'], exclusions: ['Self harm'] },
    ],
    TRAVEL: [
      { id: 't1', title: 'Global Voyager Pass', rating: '4.8', coverage: 1000000, basePremium: 320, claimRatio: '98.0%', cashless: 'Worldwide Network', roomRent: 'Single Private', copay: '0%', badge: 'Schengen Approved', features: ['Medical Evacuation & Cashless Hospital', 'Passport & Luggage Loss Benefit', 'Flight Interruption Cover'], exclusions: ['Extreme sports without rider'] },
    ],
    HOME: [
      { id: 'hm1', title: 'Home Structure & Contents', rating: '4.7', coverage: 5000000, basePremium: 650, claimRatio: '97.5%', cashless: 'Direct Repair Credit', roomRent: 'N/A', copay: 'N/A', badge: 'Complete House Shield', features: ['Fire & Earthquake Structure Cover', 'Burglary & Theft Contents Protection', 'Alternative Accommodation Rent'], exclusions: ['Willful destruction'] },
    ],
  };

  const currentPlans = plansList[insuranceType] || plansList['HEALTH'];

  const calculateTotals = () => {
    if (!selectedPlan) return { base: 10200, riders: 750, discount: 500, gst: 1881, stampDuty: 20, total: 12351 };
    const base = selectedPlan.basePremium * 12;
    const riders = 750;
    const discount = 500;
    const gst = Math.round((base + riders - discount) * 0.18);
    const stampDuty = 20;
    const total = base + riders - discount + gst + stampDuty;
    return { base, riders, discount, gst, stampDuty, total };
  };

  const totals = calculateTotals();

  const startPaymentProcessing = async () => {
    setStep(9); // Progress loader
    setIsProcessing(true);
    const stepsText = [
      'Verifying Bank Payment & Gateway Authentication...',
      'Connecting to Payment Authorization Node...',
      'Generating GST Tax Invoice & Official Receipt...',
      'Applying ISO 27001 Digital Signature Certificate...',
      'Activating Active Policy Schedule in InsureCore DB...',
    ];

    for (let i = 0; i < stepsText.length; i++) {
      setProcessingStep(i);
      await new Promise((res) => setTimeout(res, 800));
    }

    try {
      const res = await api.post('/policies', {
        customerId: user?.customerId,
        policyType: insuranceType,
        planName: selectedPlan.title,
        sumInsured: selectedPlan.coverage,
        premiumAmount: totals.total,
        premiumFrequency: 'YEARLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nominee: proposalDetails.nomineeName,
      });

      setIssuedPolicy(res.data.data);
      setIsProcessing(false);
      setStep(10); // Success screen
    } catch (err: any) {
      setIsProcessing(false);
      const errMsg = err.response?.data?.error?.message;
      const fields = err.response?.data?.error?.fields;
      let detailed = errMsg || 'Policy issuance failed';
      if (fields) {
        detailed += ': ' + Object.entries(fields).map(([k, v]) => `${k} (${v})`).join(', ');
      }
      alert(detailed);
      setStep(8);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Wizard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
            IRDAI Compliant Dynamic Onboarding Engine
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Buy New Policy Journey</h1>
          <p className="text-slate-500 text-sm font-medium">Enterprise Onboarding for Health, Motor, Life, Travel, & Home Insurance.</p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <span className="px-3 py-1 bg-slate-100 rounded-full">Step {step} of 10</span>
          {step > 1 && step < 9 && (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} className="font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="grid grid-cols-10 gap-1 text-[9px] font-extrabold text-center">
        {['Marketplace', 'Specific Details', 'Quote', 'Proposal', 'eKYC', 'Underwriting', 'Payment Review', 'Payment', 'Processing', 'Issued'].map((stLabel, idx) => {
          const stepNum = idx + 1;
          return (
            <div key={stLabel} className="space-y-1">
              <div className={`h-2 rounded-full transition-all ${step >= stepNum ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <span className={`block truncate ${step === stepNum ? 'text-blue-600 font-bold' : 'text-slate-400 font-normal'}`}>
                {stLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: MARKETPLACE PRODUCT CATALOG */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-blue-900">
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-1.5" /> IRDAI Approved Reg No 154</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-1.5" /> 10,500+ Network Hospitals</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-1.5" /> 20-Min Cashless Approval</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-1.5" /> 98.4% Claim Ratio</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Available Insurance Products</h2>
              <p className="text-xs text-slate-500 font-medium">Select a product tier to compare coverage, cashless network, and tax benefits.</p>
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
              {['HEALTH', 'MOTOR', 'LIFE', 'TRAVEL', 'HOME'].map((typeKey) => (
                <button
                  key={typeKey}
                  onClick={() => setInsuranceType(typeKey)}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                    insuranceType === typeKey ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {typeKey}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentPlans.map((plan) => (
              <Card key={plan.id} className="p-6 flex flex-col justify-between space-y-4 hover:border-blue-600 hover:shadow-lg transition">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-700 uppercase tracking-wider">
                      {plan.badge}
                    </span>
                    <span className="flex items-center text-amber-500 text-xs font-extrabold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" /> {plan.rating}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">{plan.title}</h3>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Coverage Limit</span>
                    <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(plan.coverage)}</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Starting Premium:</span>
                      <strong className="text-blue-600 font-extrabold">{formatCurrency(plan.basePremium)}/mo</strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Room Rent:</span>
                      <strong className="text-slate-800">{plan.roomRent}</strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Co-Pay:</span>
                      <strong className="text-emerald-700 font-bold">{plan.copay}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setStep(2);
                    }}
                    variant="primary"
                    className="w-full font-bold py-2.5 text-xs shadow-md"
                  >
                    Select Plan & Continue
                  </Button>
                  <Button
                    onClick={() => setActiveDrawerProduct(plan)}
                    variant="outline"
                    className="w-full font-bold py-2 text-xs text-slate-600"
                  >
                    <Info className="w-3.5 h-3.5 mr-1" /> View Brochure & Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: SPECIFIC DETAILS */}
      {step === 2 && (
        <Card className="p-8 max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900">Step 2 — Underwriting Parameters ({insuranceType})</h2>
            <p className="text-xs text-slate-500 font-medium">Selected Plan: <strong className="text-blue-600">{selectedPlan?.title}</strong></p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Nominee Full Name</label>
              <input
                type="text"
                value={proposalDetails.nomineeName}
                onChange={(e) => setProposalDetails({ ...proposalDetails, nomineeName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Nominee Relationship</label>
              <select
                value={proposalDetails.nomineeRelation}
                onChange={(e) => setProposalDetails({ ...proposalDetails, nomineeRelation: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
              </select>
            </div>
          </div>

          <Button onClick={() => setStep(3)} variant="primary" className="w-full font-bold py-3 mt-4">
            Proceed to Quote Summary <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      )}

      {/* STEPS 3 to 10 */}
      {step === 3 && (
        <Card className="p-8 max-w-xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900">Step 3 — Quote Review & Premium Schedule</h2>
            <p className="text-xs text-slate-500 font-medium">Selected Plan: {selectedPlan?.title}</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between"><span>Base Premium:</span><strong>{formatCurrency(totals.base)}</strong></div>
            <div className="flex justify-between"><span>GST (18% Statutory):</span><strong>+{formatCurrency(totals.gst)}</strong></div>
            <div className="pt-2 border-t flex justify-between font-extrabold text-blue-600 text-sm"><span>Net Premium:</span><span>{formatCurrency(totals.total)}</span></div>
          </div>

          <Button onClick={() => setStep(4)} variant="primary" className="w-full font-bold py-3">
            Proceed to Proposal <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      )}

      {step === 4 && (
        <Card className="p-8 max-w-xl mx-auto space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900">Step 4 — Proposal Address</h2>
          <input
            type="text"
            value={proposalDetails.address}
            onChange={(e) => setProposalDetails({ ...proposalDetails, address: e.target.value })}
            className="w-full border rounded-xl p-3 text-xs font-medium"
          />
          <Button onClick={() => setStep(5)} variant="primary" className="w-full font-bold py-3">
            Proceed to eKYC <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      )}

      {step === 5 && (
        <Card className="p-8 max-w-xl mx-auto space-y-6 text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-extrabold text-slate-900">Step 5 — Instant eKYC Verified</h2>
          <Button onClick={() => setStep(6)} variant="primary" className="w-full font-bold py-3">
            Underwriting Review <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      )}

      {step === 6 && (
        <Card className="p-8 max-w-xl mx-auto space-y-6 text-center">
          <FileCheck className="w-10 h-10 text-blue-600 mx-auto" />
          <h2 className="text-xl font-extrabold text-slate-900">Step 6 — Automated Medical Underwriting Passed</h2>
          <Button onClick={() => setStep(7)} variant="primary" className="w-full font-bold py-3">
            Payment Review Desk <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      )}

      {step === 7 && (
        <Card className="p-8 max-w-xl mx-auto space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900">Step 7 — Final Policy Schedule Review</h2>
          <div className="p-4 bg-slate-50 border rounded-2xl text-xs space-y-2 font-medium">
            <p>Plan: <strong className="text-slate-900">{selectedPlan?.title}</strong></p>
            <p>Coverage: <strong className="text-blue-600">{formatCurrency(selectedPlan?.coverage)}</strong></p>
            <p>Total Net Premium: <strong className="text-blue-600">{formatCurrency(totals.total)}</strong></p>
          </div>
          <Button onClick={() => setStep(8)} variant="primary" className="w-full font-bold py-3">
            Proceed to Secure Payment <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      )}

      {step === 8 && (
        <Card className="p-8 max-w-xl mx-auto space-y-6 text-center">
          <Lock className="w-10 h-10 text-blue-600 mx-auto" />
          <h2 className="text-xl font-extrabold text-slate-900">Step 8 — PCI-DSS Encrypted Gateway</h2>
          <Button onClick={startPaymentProcessing} variant="primary" className="w-full py-4 font-bold">
            Pay {formatCurrency(totals.total)} & Activate Policy Instantly
          </Button>
        </Card>
      )}

      {step === 9 && (
        <Card className="p-12 max-w-lg mx-auto text-center space-y-6">
          <RefreshCw className="w-10 h-10 text-blue-600 mx-auto animate-spin" />
          <h2 className="text-xl font-extrabold text-slate-900">Processing Secure Payment...</h2>
        </Card>
      )}

      {step === 10 && issuedPolicy && (
        <Card className="p-8 max-w-3xl mx-auto space-y-6 text-center bg-white border-emerald-200 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900">Policy Issued & Activated Successfully!</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <Button onClick={() => downloadFile(`/policies/${issuedPolicy.id}/pdf`, `Schedule_${issuedPolicy.policyNumber}.pdf`)} variant="primary" className="text-xs font-bold py-2.5">
              📄 Policy Schedule
            </Button>
            <Button onClick={() => navigate('/policies')} variant="outline" className="text-xs font-bold py-2.5">
              Return to Dashboard
            </Button>
          </div>
        </Card>
      )}

      {/* Product Details Drawer Modal */}
      {activeDrawerProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{activeDrawerProduct.badge}</span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">{activeDrawerProduct.title}</h2>
              </div>
              <button onClick={() => setActiveDrawerProduct(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex justify-between"><span>Sum Insured:</span><strong className="text-slate-900">{formatCurrency(activeDrawerProduct.coverage)}</strong></div>
                <div className="flex justify-between"><span>Claim Ratio:</span><strong className="text-emerald-700 font-bold">{activeDrawerProduct.claimRatio}</strong></div>
                <div className="flex justify-between"><span>Cashless Network:</span><strong className="text-slate-900">{activeDrawerProduct.cashless}</strong></div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider mb-2">Key Coverage Benefits</h4>
                <ul className="space-y-1.5 text-slate-700">
                  {activeDrawerProduct.features.map((f: string, idx: number) => (
                    <li key={idx} className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" /> {f}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider mb-2">Standard Exclusions</h4>
                <ul className="space-y-1.5 text-slate-500">
                  {activeDrawerProduct.exclusions.map((e: string, idx: number) => (
                    <li key={idx} className="flex items-center"><AlertCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" /> {e}</li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => {
                  setSelectedPlan(activeDrawerProduct);
                  setActiveDrawerProduct(null);
                  setStep(2);
                }}
                variant="primary"
                className="w-full py-3 font-bold"
              >
                Proceed with this Plan ({formatCurrency(activeDrawerProduct.basePremium)}/mo)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
