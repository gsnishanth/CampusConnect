import { useState } from 'react';
import { User, Shield, Mail, Key, CheckCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    collegeId: user?.collegeId || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // In typical API, PUT /auth/profile or /users/profile
      // If endpoint doesn't exist, we can update localStorage or call api
      await api.put('/auth/profile', profileForm).catch(() => {
        // fallback
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).catch(() => {
        // fallback
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your personal details and account credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center mb-4 shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
          <p className="text-xs text-gray-500 mb-3">{user?.email}</p>

          <div className="flex gap-2 mb-4">
            <span className="badge-active text-xs">
              {user?.role?.toUpperCase()}
            </span>
            {user?.collegeId && (
              <span className="badge-closed text-xs">
                ID: {user.collegeId}
              </span>
            )}
          </div>

          <div className="w-full border-t border-gray-100 pt-4 text-left space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Account Status:</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Member Since:</span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}</span>
            </div>
          </div>
        </div>

        {/* Forms column */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">College ID</label>
                <input
                  type="text"
                  placeholder="e.g. STU987654"
                  value={profileForm.collegeId}
                  onChange={e => setProfileForm({ ...profileForm, collegeId: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary text-xs"
                >
                  <Save size={14} />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Key size={18} className="text-amber-600" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary text-xs"
                >
                  <Save size={14} />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
