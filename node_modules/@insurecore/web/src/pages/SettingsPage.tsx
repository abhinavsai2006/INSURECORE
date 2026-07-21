import React, { useState } from 'react';
import { User, Shield, Bell, CreditCard, Lock, Save, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing'>('profile');

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Suite 400',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
  });

  const [notifications, setNotifications] = useState({
    emailPolicyRenewal: true,
    emailClaimStatus: true,
    smsPaymentReminder: true,
    marketingUpdates: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Preferences & Settings</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Manage your personal profile, notification preferences, security, and payment settings.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4 mr-2" /> Personal Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4 mr-2" /> Security & Password
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4 mr-2" /> Notifications & Alerts
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 mr-2" /> Saved Payment Methods
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" /> Settings updated successfully!
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Contact Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 text-sm font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Account Role</label>
                <input
                  type="text"
                  value={user?.role || 'CUSTOMER'}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-blue-700 font-bold text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2">Residential Address</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Street Address</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Zipcode</label>
                <input
                  type="text"
                  value={profileData.zip}
                  onChange={(e) => setProfileData({ ...profileData, zip: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="font-bold">
              <Save className="w-4 h-4 mr-2" /> Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Change Account Password</h3>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-medium"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="font-bold">
              Update Password
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="space-y-5">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Communication Preferences</h3>

          <div className="space-y-4 text-sm font-medium text-slate-700">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Policy Renewal Email Notices</p>
                <p className="text-xs text-slate-500">Receive email alerts 30 days prior to policy term expiration.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailPolicyRenewal}
                onChange={(e) => setNotifications({ ...notifications, emailPolicyRenewal: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Claim Settlement Status Updates</p>
                <p className="text-xs text-slate-500">Get notified immediately when your claim is reviewed or approved.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailClaimStatus}
                onChange={(e) => setNotifications({ ...notifications, emailClaimStatus: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">SMS Premium Due Reminders</p>
                <p className="text-xs text-slate-500">Receive text messages before monthly or annual premium due dates.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsPaymentReminder}
                onChange={(e) => setNotifications({ ...notifications, smsPaymentReminder: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          <Button variant="primary" onClick={handleSave} className="font-bold">
            Save Preferences
          </Button>
        </Card>
      )}

      {activeTab === 'billing' && (
        <Card className="space-y-5">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Payment Methods</h3>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
                VISA
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Visa Ending in •••• 4242</p>
                <p className="text-xs text-slate-500">Expires 12/2028 • Default Payment Method</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
              Primary Card
            </span>
          </div>

          <Button variant="outline" className="font-bold">
            <CreditCard className="w-4 h-4 mr-2" /> Add Payment Method
          </Button>
        </Card>
      )}
    </div>
  );
};
