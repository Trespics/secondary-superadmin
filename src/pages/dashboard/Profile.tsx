import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { User, Mail, Phone, Shield, Save, Lock, Camera, Award, Briefcase } from "lucide-react";
import "../styles/Profile.css"; // Import the CSS file

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    position: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/superadmin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        position: data.super_admin_details?.position || "",
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/superadmin/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>System Profile</h1>
        <p>Manage your superadministrator credentials and settings.</p>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card-header" />
          <div className="profile-card-body">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {profile?.name?.charAt(0)}
              </div>
              <button className="profile-avatar-upload">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="profile-name">{profile?.name}</h2>
            <span className="profile-badge">
              {profile?.super_admin_details?.position || "System Administrator"}
            </span>
            
            <div className="profile-details">
              <div className="profile-detail-item">
                <Mail size={18} />
                <span>{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="profile-detail-item">
                  <Phone size={18} />
                  <span>{profile?.phone}</span>
                </div>
              )}
              <div className="profile-detail-item">
                <Award size={18} />
                <span>Super Admin Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="profile-settings">
          {/* Profile Settings */}
          <div className="settings-section">
            <div className="section-header">
              <User size={20} />
              Profile Information
            </div>
            <div className="section-content">
              <form onSubmit={handleUpdate} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <User size={14} /> Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <Phone size={14} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <Briefcase size={14} /> Position
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.position}
                    onChange={(e) => setForm({...form, position: e.target.value})}
                    placeholder="e.g., Senior System Administrator"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <Save size={18} className="spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Settings */}
          <div className="settings-section security">
            <div className="section-header security">
              <Shield size={20} />
              Account Security
            </div>
            <div className="section-content">
              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-row security">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-danger" disabled={changingPassword}>
                    {changingPassword ? (
                      <>
                        <Lock size={18} className="spinner" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;