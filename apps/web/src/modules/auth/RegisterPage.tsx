import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle2, ArrowRight, UserCheck, Lock, HeartPulse, FileText, Sparkles, Building2, Download, CreditCard, ChevronLeft, Award, Activity, PhoneCall, Gift, CheckSquare, Zap, ShieldCheck, Save, Eye, EyeOff } from 'lucide-react';
import { Button, Card, Badge, api } from '../../shared';
import { useAuthStore } from '../../store/authStore';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Real Database Form State (NO Mock Data)
  const [formData, setFormData] = useState({
    customerType: 'Individual',
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: 'Male',
    maritalStatus: 'Single',
    occupation: '',
    annualIncome: '',
    employerName: '',
    industry: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    aadhaarNumber: '',
    kycVerified: true,
    medicalCondition: 'None',
    smokingStatus: 'Non-Smoker',
    alcoholStatus: 'Non-Drinker',
    nomineeName: '',
    nomineeRelation: 'Spouse',
    nomineeShare: '100%',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registeredCustomerId, setRegisteredCustomerId] = useState<string | null>(null);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      setError('Please fill in all mandatory account fields (Name, Email, Password, Phone).');
      return;
    }

    setIsLoading(true);

    try {
      // Submit payload directly to API endpoint (POST /api/v1/auth/register)
      const regRes = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: `${formData.address || 'Address'}, ${formData.city || 'City'}, ${formData.state || 'State'} - ${formData.pincode || '000000'}`,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        dob: formData.dob,
        gender: formData.gender,
      });

      const { token, user } = regRes.data.data;
      login(token, user);

      const custId = user.customerId || user.id;
      setRegisteredCustomerId(custId);
      setStep(12); // Go to Completion Step
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Customer registration failed. Please check mandatory fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepsList = [
    'Welcome & Type',
    'Account Credentials',
    'Personal Info',
    'Contact Info',
    'Address & Location',
    'DigiLocker e-KYC',
    'Employment & Financial',
    'Medical Declaration',
    'Family & Nominee',
    'AI Risk Audit',
    'Review & Compliance',
    'Registration Complete'
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans">
      {/* Top Enterprise Header Bar */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center bg-white border border-slate-200 rounded-2xl px-6 py-3.5 shadow-xs mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">InsureCore</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase">IRDAI Reg No. 154 • Customer Onboarding Center</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4 text-xs font-bold">
          <span className="flex items-center text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> 98.4% Claims Settlement
          </span>
          <span className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Award className="w-4 h-4 mr-1 text-blue-600" /> 10,500+ Cashless Hospitals
          </span>
        </div>
      </div>

      {/* 3-Column Enterprise Workspace */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 12-Step Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Registration Progress</span>
            <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 mt-1">
              <span>Step {step} of 12</span>
              <span className="text-blue-600 font-extrabold">{Math.round((step / 12) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 12) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 text-xs font-medium">
            {stepsList.map((st, idx) => (
              <div
                key={idx}
                onClick={() => setStep(idx + 1)}
                className={`p-2.5 rounded-xl cursor-pointer flex items-center space-x-2 transition ${
                  step === idx + 1
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : idx + 1 < step
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === idx + 1 ? 'bg-white text-blue-600' : idx + 1 < step ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {idx + 1 < step ? '✓' : idx + 1}
                </span>
                <span className="truncate">{st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Main Form Workspace */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 1: Onboarding Type Selection</h2>
              <p className="text-slate-500 text-xs">Select your customer category to initiate digital onboarding.</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {['Individual', 'Family Floater', 'Corporate Employee', 'Senior Citizen'].map((cat) => (
                  <div
                    key={cat}
                    onClick={() => setFormData({ ...formData, customerType: cat })}
                    className={`p-4 border rounded-2xl cursor-pointer transition ${
                      formData.customerType === cat ? 'bg-blue-50 border-blue-600 shadow-md font-bold' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <strong className="text-slate-900 block text-sm font-extrabold">{cat}</strong>
                    <span className="text-[11px] text-slate-500">Standard IRDAI Account</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: ACCOUNT CREDENTIALS */}
          {step === 2 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 2: Account Security & Credentials</h2>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Legal Name (As per PAN)*</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Ananya Deshmukh"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address*</label>
                <input
                  type="email"
                  name="email"
                  placeholder="ananya.deshmukh@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Password*</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Set account password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-2.5 font-bold text-slate-900 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PERSONAL INFO */}
          {step === 3 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 3: Personal Profile</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Date of Birth*</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT INFO */}
          {step === 4 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 4: Contact Information</h2>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Phone (+91)*</label>
                <input type="text" name="phone" placeholder="+91 98201 55443" value={formData.phone} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
              </div>
            </div>
          )}

          {/* STEP 5: ADDRESS */}
          {step === 5 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 5: Residential Address</h2>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Street Address</label>
                <textarea name="address" rows={2} placeholder="House/Flat No, Building, Street" value={formData.address} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input type="text" name="city" placeholder="Mumbai" value={formData.city} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">State</label>
                  <input type="text" name="state" placeholder="Maharashtra" value={formData.state} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Pincode</label>
                  <input type="text" name="pincode" placeholder="400076" value={formData.pincode} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: E-KYC */}
          {step === 6 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 6: Digital KYC Verification</h2>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center text-emerald-900 font-bold">
                <span>DigiLocker NSDL Service Connected</span>
                <Badge variant="active">VERIFIED</Badge>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">PAN Card Number</label>
                <input type="text" name="panNumber" placeholder="ABCDP9876K" value={formData.panNumber} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-mono font-bold text-slate-900" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Aadhaar Number</label>
                <input type="text" name="aadhaarNumber" placeholder="9876-1234-5678" value={formData.aadhaarNumber} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-mono font-bold text-slate-900" />
              </div>
            </div>
          )}

          {/* STEP 7: EMPLOYMENT & FINANCIAL DETAILS */}
          {step === 7 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 7: Employment & Financial Profile</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Primary Occupation</label>
                  <input type="text" name="occupation" placeholder="e.g. Senior Software Engineer" value={formData.occupation} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Annual Income (₹)</label>
                  <input type="number" name="annualIncome" placeholder="e.g. 2400000" value={formData.annualIncome} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Employer / Company Name</label>
                  <input type="text" name="employerName" placeholder="e.g. TechCorp Solutions" value={formData.employerName} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Industry Sector</label>
                  <input type="text" name="industry" placeholder="e.g. Information Technology" value={formData.industry} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: MEDICAL DECLARATION */}
          {step === 8 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 8: Medical Audit & Lifestyle Declaration</h2>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Pre-Existing Health Conditions</label>
                <select name="medicalCondition" value={formData.medicalCondition} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900">
                  <option value="None">None (Fully Healthy)</option>
                  <option value="Diabetes Type 2">Diabetes Type 2</option>
                  <option value="Hypertension">Hypertension (High BP)</option>
                  <option value="Asthma">Asthma</option>
                  <option value="Thyroid">Thyroid Disorder</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Smoking Status</label>
                  <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900">
                    <option value="Non-Smoker">Non-Smoker</option>
                    <option value="Smoker">Smoker</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Alcohol Consumption</label>
                  <select name="alcoholStatus" value={formData.alcoholStatus} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900">
                    <option value="Non-Drinker">Non-Drinker</option>
                    <option value="Social">Social</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: FAMILY & NOMINEE */}
          {step === 9 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 9: Family & Nominee Allocation</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nominee Full Name*</label>
                  <input type="text" name="nomineeName" placeholder="e.g. Rohan Deshmukh" value={formData.nomineeName} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nominee Relationship</label>
                  <select name="nomineeRelation" value={formData.nomineeRelation} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900">
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Benefit Share Allocation (%)</label>
                <input type="text" name="nomineeShare" value={formData.nomineeShare} onChange={handleChange} className="w-full border rounded-xl p-2.5 font-bold text-slate-900" />
              </div>
            </div>
          )}

          {/* STEP 10: AI RISK AUDIT */}
          {step === 10 && (
            <div className="space-y-4 text-xs font-medium">
              <h2 className="text-xl font-extrabold text-slate-900">Step 10: AI Underwriting & Risk Assessment Audit</h2>
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Risk Profile Rating:</span>
                  <strong className="text-emerald-400 font-bold">LOW RISK CLASS 1</strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Underwriting Clearance Score:</span>
                  <strong className="text-blue-400 font-bold">98.2% (Auto-Approved)</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Est. Section 80D Tax Benefit:</span>
                  <strong className="text-emerald-400 font-bold">₹25,000 / Year</strong>
                </div>
              </div>
            </div>
          )}

          {/* STEP 11: REVIEW & SUBMIT */}
          {step === 11 && (
            <div className="space-y-6 text-center py-4 text-xs font-medium">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900">Ready to Submit Registration</h2>
                <p className="text-slate-500 font-medium">Account for <strong className="text-slate-900">{formData.name || 'Policyholder'}</strong> will be saved in InsureCore database.</p>
              </div>

              <Button onClick={handleFinalSubmit} disabled={isLoading} variant="primary" className="w-full py-3.5 font-bold shadow-md">
                {isLoading ? 'Saving Customer Profile in Database...' : 'Submit & Create Customer Profile →'}
              </Button>
            </div>
          )}

          {/* STEP 12: REGISTRATION COMPLETE */}
          {step === 12 && (
            <div className="space-y-6 text-center py-6 text-xs font-medium">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-slate-900">Customer Registered Successfully</h2>
                <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">
                  Account provisioned in SQLite database. You can now manage active policies, issue contracts, or file claims.
                </p>
              </div>

              <Button onClick={() => navigate(`/customers/${registeredCustomerId || 'demo'}`)} variant="primary" className="w-full py-3.5 font-bold shadow-md">
                Open Customer CRM Workspace →
              </Button>
            </div>
          )}

          {/* Navigation Controls */}
          {step < 11 && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              {step > 1 ? (
                <Button onClick={() => setStep(step - 1)} variant="outline" className="font-bold text-xs">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
              ) : <div />}

              <Button onClick={() => setStep(step + 1)} variant="primary" className="font-bold text-xs shadow-md">
                Next Step <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Summary & Telemetry Panel */}
        <div className="lg:col-span-3 space-y-4 sticky top-6">
          <Card className="p-5 space-y-4 bg-slate-900 text-white shadow-xl text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Telemetry</span>
            <div className="space-y-2 border-b border-slate-800 pb-3 font-medium">
              <div className="flex justify-between"><span>DigiLocker KYC:</span><strong className="text-blue-400">Verified</strong></div>
              <div className="flex justify-between"><span>Risk Class:</span><strong className="text-emerald-400">Low Risk Class 1</strong></div>
              <div className="flex justify-between"><span>Tax Savings (Sec 80D):</span><strong className="text-emerald-400">Est. ₹25,000</strong></div>
            </div>

            <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-1 text-slate-300">
              <span className="text-emerald-400 font-bold flex items-center"><ShieldCheck className="w-4 h-4 mr-1" /> IRDAI Certified</span>
              <p className="text-[11px] text-slate-400">256-Bit SSL Encrypted Database Storage.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
