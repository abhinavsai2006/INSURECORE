import * as React from } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    theme: "light",
    language: "en",
    timezone: "UTC",
  });
  const [companyProfile, setCompanyProfile] = useState({
    name: "InsureCore Insurance",
    address: "123 Insurance Ave",
    city: "Insurance City",
    state: "IC",
    pincode: "12345",
    phone: "+1 (555) 123-4567",
    email: "info@insurecore.com",
    website: "www.insurecore.com",
  });
  const [notificationTemplates, setNotificationTemplates] = useState({
    policyCreated: "Your policy {policyNumber} has been created successfully.",
    paymentReceived: "We've received your payment of ${amount} for policy {policyNumber}.",
    claimSubmitted: "Your claim {claimNumber} has been submitted and is under review.",
    claimApproved: "Your claim {claimNumber} has been approved for ${amount}.",
    claimRejected: "Your claim {claimNumber} has been rejected. Reason: {reason}",
    premiumDue: "Your premium of ${amount} is due on {dueDate} for policy {policyNumber}.",
  });

  // Only admins can access settings
  if (user?.role !== "ADMIN") {
    return <div className="text-center py-8 text-red-500">Access denied</div>;
  }

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // In a real app, this would call an API to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Profile updated successfully");
      setMessageType("success");
      // Update auth store
      // useAuthStore.getState().setUser({ ...user, ...profileData });
    } catch (err) {
      setMessage("Failed to update profile");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // In a real app, this would save preferences to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Preferences saved successfully");
      setMessageType("success");
    } catch (err) {
      setMessage("Failed to save preferences");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanyProfile = async () => {
    setLoading(true);
    try {
      // In a real app, this would update company settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Company profile updated successfully");
      setMessageType("success");
    } catch (err) {
      setMessage("Failed to update company profile");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, this would save notification templates
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Notification templates saved successfully");
      setMessageType("success");
    } catch (err) {
      setMessage("Failed to save notification templates");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <nav className="flex space-x-4 text-sm font-medium text-gray-500">
          <a href="#profile" className="hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500">
            Profile
          </a>
          <a href="#preferences" className="hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500">
            Preferences
          </a>
          <a href="#company" className="hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500">
            Company
          </a>
          <a href="#notifications" className="hover:text-gray-900 border-b-2 border-transparent hover:border-blue-500">
            Notifications
          </a>
        </nav>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          messageType === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message}
        </div>
      )}

      <section id="profile">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <Input
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                type="email"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                type="tel"
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-fit"
            >
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </section>

      <section id="preferences">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
            <Checkbox
              checked={preferences.emailNotifications}
              onCheckedChange={setPreferences((prev) => ({ ...prev, emailNotifications: !preferences.emailNotifications }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Notifications</label>
            <Checkbox
              checked={preferences.smsNotifications}
              onCheckedChange={setPreferences((prev) => ({ ...prev, smsNotifications: !preferences.smsNotifications }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, theme: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <Select
              value={preferences.language}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, language: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, timezone: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">Eastern Standard Time</SelectItem>
                <SelectItem value="PST">Pacific Standard Time</SelectItem>
                <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSavePreferences}
              disabled={loading}
              className="w-fit"
            >
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </section>

      <section id="company">
        <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <Input
                value={companyProfile.name}
                onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                placeholder="Enter company name"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <Input
                value={companyProfile.email}
                onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                type="email"
                placeholder="Enter company email"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <Input
                value={companyProfile.phone}
                onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                type="tel"
                placeholder="Enter company phone"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-md text-gray-700 mb-1">Website</label>
              <Input
                value={companyProfile.website}
                onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                placeholder="Enter company website"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <Input
              value={companyProfile.address}
              onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
              placeholder="Enter street address"
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Input
                value={companyProfile.city}
                onChange={(e) => setCompanyProfile({ ...companyProfile, city: e.target.value })}
                placeholder="Enter city"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
              <Input
                value={companyProfile.state}
                onChange={(e) => setCompanyProfile({ ...companyProfile, state: e.target.value })}
                placeholder="Enter state"
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code</label>
              <Input
                value={companyProfile.pincode}
                onChange={(e) => setCompanyProfile({ ...companyProfile, pincode: e.target.value })}
                placeholder="Enter postal code"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveCompanyProfile}
              disabled={loading}
              className="w-fit"
            >
              {loading ? "Saving..." : "Save Company Profile"}
            </Button>
          </div>
        </div>
      </section>

      <section id="notifications">
        <h2 className="text-xl font-semibold mb-4">Notification Templates</h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Created</label>
            <Textarea
              value={notificationTemplates.policyCreated}
              onChange={(e) => setNotificationTemplates({ ...notificationTemplates, policyCreated: e.target.value })}
              placeholder="Enter template for policy creation notifications"
              disabled={loading}
              className="h-32"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Received</label>
            <Textarea
              value={notificationTemplates.paymentReceived}
              onChange={(e) => setNotificationTemplates({ ...notificationTemplates, paymentReceived: e.target.value })}
              placeholder="Enter template for payment received notifications"
              disabled={loading}
              className="h-32"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Claim Submitted</label>
            <Textarea
              value={notificationTemplates.claimSubmitted}
              onChange={(e) => setNotificationTemplates({ ...notificationTemplates, claimSubmitted: e.target.value })}
              placeholder="Enter template for claim submitted notifications"
              disabled={loading}
              className="h-32"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Claim Approved</label>
            <Textarea
              value={notificationTemplates.claimApproved}
              onChange={(e) => setNotificationTemplates({ ...notificationTemplates, claimApproved: e.target.value })}
              placeholder="Enter template for claim approved notifications"
              disabled={loading}
              className="h-32"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Claim Rejected</label>
            <Textarea
              value={notificationTemplates.claimRejected}
              onChange={(e) => setNotificationTemplates({ ...notificationTemplates, claimRejected: e.target.value })}
              placeholder="Enter template for claim rejected notifications"
              disabled={loading}
              className="h-32"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Premium Due Reminder</label>
            <Textarea
              value={notificationTemplates.premiumDue}
              onChange={(e) => setNotificationTemplates({ ...notificationTemplates, premiumDue: e.target.value })}
              placeholder="Enter template for premium due reminders"
              disabled={loading}
              className="h-32"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveNotifications}
              disabled={loading}
              className="w-fit"
            >
              {loading ? "Saving..." : "Save Templates"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;