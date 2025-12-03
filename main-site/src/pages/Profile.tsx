import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: 'bi-person' },
    { id: 'account', label: 'Account Settings', icon: 'bi-gear' },
    { id: 'security', label: 'Security', icon: 'bi-shield-lock' },
    { id: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    { id: 'appointments', label: 'My Appointments', icon: 'bi-calendar-check' },
    { id: 'medical', label: 'Medical Records', icon: 'bi-file-medical' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="profile-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              <p>Update your personal details and contact information</p>
            </div>
            <div className="profile-form">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" className="form-control" id="firstName" defaultValue="John" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" className="form-control" id="lastName" defaultValue="Doe" />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" className="form-control" id="email" defaultValue="john.doe@example.com" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" className="form-control" id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea className="form-control" id="address" rows={3} defaultValue="123 Main Street, City, State 12345"></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        )
      case 'account':
        return (
          <div className="profile-section">
            <div className="section-header">
              <h3>Account Settings</h3>
              <p>Manage your account preferences and settings</p>
            </div>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-content">
                  <h4>Profile Visibility</h4>
                  <p>Control who can see your profile information</p>
                </div>
                <div className="setting-control">
                  <select className="form-select">
                    <option>Public</option>
                    <option>Private</option>
                    <option>Friends Only</option>
                  </select>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-content">
                  <h4>Email Notifications</h4>
                  <p>Receive email updates about your appointments</p>
                </div>
                <div className="setting-control">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
                    <label className="form-check-label" htmlFor="emailNotifications"></label>
                  </div>
                </div>
              </div>
              <div className="setting-item">
                <div className="setting-content">
                  <h4>SMS Notifications</h4>
                  <p>Receive SMS reminders for appointments</p>
                </div>
                <div className="setting-control">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="smsNotifications" defaultChecked />
                    <label className="form-check-label" htmlFor="smsNotifications"></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="profile-section">
            <div className="section-header">
              <h3>Security Settings</h3>
              <p>Manage your password and security preferences</p>
            </div>
            <div className="security-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input type="password" className="form-control" id="currentPassword" />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input type="password" className="form-control" id="newPassword" />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input type="password" className="form-control" id="confirmPassword" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-primary">Update Password</button>
              </div>
            </div>
            <div className="security-options">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
              <button type="button" className="btn btn-outline-primary">Enable 2FA</button>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="profile-section">
            <div className="section-header">
              <h3>Notification Preferences</h3>
              <p>Choose how you want to be notified</p>
            </div>
            <div className="notifications-list">
              <div className="notification-item">
                <div className="notification-content">
                  <h4>Appointment Reminders</h4>
                  <p>Get reminded about upcoming appointments</p>
                </div>
                <div className="notification-controls">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="reminderEmail" defaultChecked />
                    <label className="form-check-label" htmlFor="reminderEmail">Email</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="reminderSMS" defaultChecked />
                    <label className="form-check-label" htmlFor="reminderSMS">SMS</label>
                  </div>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-content">
                  <h4>Test Results</h4>
                  <p>Receive notifications when test results are available</p>
                </div>
                <div className="notification-controls">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="resultsEmail" defaultChecked />
                    <label className="form-check-label" htmlFor="resultsEmail">Email</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="resultsSMS" />
                    <label className="form-check-label" htmlFor="resultsSMS">SMS</label>
                  </div>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-content">
                  <h4>Health Tips</h4>
                  <p>Receive weekly health tips and wellness advice</p>
                </div>
                <div className="notification-controls">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="tipsEmail" />
                    <label className="form-check-label" htmlFor="tipsEmail">Email</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'appointments':
        return (
          <div className="profile-section">
            <div className="section-header">
              <h3>My Appointments</h3>
              <p>View and manage your upcoming appointments</p>
            </div>
            <div className="appointments-list">
              <div className="appointment-card">
                <div className="appointment-info">
                  <div className="appointment-date">
                    <span className="date">Dec 15, 2024</span>
                    <span className="time">10:00 AM</span>
                  </div>
                  <div className="appointment-details">
                    <h4>Dr. Sarah Johnson</h4>
                    <p>Cardiology Consultation</p>
                    <span className="status upcoming">Upcoming</span>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button className="btn btn-sm btn-outline-primary">Reschedule</button>
                  <button className="btn btn-sm btn-outline-danger">Cancel</button>
                </div>
              </div>
              <div className="appointment-card">
                <div className="appointment-info">
                  <div className="appointment-date">
                    <span className="date">Nov 28, 2024</span>
                    <span className="time">2:30 PM</span>
                  </div>
                  <div className="appointment-details">
                    <h4>Dr. Michael Chen</h4>
                    <p>General Checkup</p>
                    <span className="status completed">Completed</span>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button className="btn btn-sm btn-outline-primary">View Details</button>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link to="/appointment" className="btn btn-primary">Schedule New Appointment</Link>
            </div>
          </div>
        )
      case 'medical':
        return (
          <div className="profile-section">
            <div className="section-header">
              <h3>Medical Records</h3>
              <p>Access your medical history and records</p>
            </div>
            <div className="medical-records">
              <div className="record-card">
                <div className="record-header">
                  <h4>Recent Lab Results</h4>
                  <span className="date">Nov 20, 2024</span>
                </div>
                <div className="record-content">
                  <p>Blood work results from your annual checkup</p>
                  <button className="btn btn-sm btn-outline-primary">Download PDF</button>
                </div>
              </div>
              <div className="record-card">
                <div className="record-header">
                  <h4>Cardiology Report</h4>
                  <span className="date">Oct 15, 2024</span>
                </div>
                <div className="record-content">
                  <p>EKG and stress test results</p>
                  <button className="btn btn-sm btn-outline-primary">Download PDF</button>
                </div>
              </div>
              <div className="record-card">
                <div className="record-header">
                  <h4>Vaccination Record</h4>
                  <span className="date">Sep 10, 2024</span>
                </div>
                <div className="record-content">
                  <p>Updated vaccination history</p>
                  <button className="btn btn-sm btn-outline-primary">Download PDF</button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="profile-page">
      <PageHero
        title="My Profile"
        description="Update and manage your personal details, preferences, and account information."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Profile' }
        ]}
      />


      <section className="profile section">
        <div className="container" data-aos="fade-up">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-4 col-xl-3">
              <div className="profile-sidebar">
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div className="avatar-info">
                    <h4>John Doe</h4>
                    <p>john.doe@example.com</p>
                  </div>
                </div>
                <nav className="profile-nav">
                  <ul className="nav flex-column">
                    {tabs.map((tab) => (
                      <li key={tab.id} className="nav-item">
                        <button
                          className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                          onClick={() => setActiveTab(tab.id)}
                        >
                          <i className={`bi ${tab.icon}`}></i>
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-lg-8 col-xl-9">
              <div className="profile-content">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .profile-sidebar {
          background: var(--surface-color);
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 140px;
        }

        .profile-avatar {
          text-align: center;
          padding-bottom: 2rem;
          border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
          margin-bottom: 2rem;
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color), #007acc 50%));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 5px 15px color-mix(in srgb, var(--accent-color), transparent 70%);
        }

        .avatar-circle i {
          font-size: 2.5rem;
          color: var(--contrast-color);
        }

        .avatar-info h4 {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
          color: var(--heading-color);
        }

        .avatar-info p {
          color: color-mix(in srgb, var(--default-color), transparent 40%);
          font-size: 0.9rem;
        }

        .profile-nav .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border: none;
          background: none;
          color: var(--default-color);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
          width: 100%;
          text-align: left;
          font-weight: 500;
        }

        .profile-nav .nav-link:hover {
          background: color-mix(in srgb, var(--accent-color), transparent 90%);
          color: var(--accent-color);
        }

        .profile-nav .nav-link.active {
          background: var(--accent-color);
          color: var(--contrast-color);
        }

        .profile-nav .nav-link i {
          font-size: 1.1rem;
          width: 20px;
        }

        .profile-content {
          background: var(--surface-color);
          border-radius: 15px;
          padding: 2.5rem;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
          min-height: 600px;
        }

        .profile-section .section-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
        }

        .profile-section .section-header h3 {
          font-size: 1.75rem;
          color: var(--heading-color);
          margin-bottom: 0.5rem;
        }

        .profile-section .section-header p {
          color: color-mix(in srgb, var(--default-color), transparent 30%);
        }

        .profile-form .form-group {
          margin-bottom: 1.5rem;
        }

        .profile-form label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--heading-color);
        }

        .profile-form .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid color-mix(in srgb, var(--default-color), transparent 85%);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .profile-form .form-control:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--accent-color), transparent 85%);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .form-actions .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .form-actions .btn-primary {
          background: var(--accent-color);
          border: 2px solid var(--accent-color);
          color: var(--contrast-color);
        }

        .form-actions .btn-primary:hover {
          background: color-mix(in srgb, var(--accent-color), black 10%);
          transform: translateY(-2px);
        }

        .form-actions .btn-secondary {
          background: transparent;
          border: 2px solid color-mix(in srgb, var(--default-color), transparent 70%);
          color: var(--default-color);
        }

        .form-actions .btn-secondary:hover {
          background: color-mix(in srgb, var(--default-color), transparent 90%);
        }

        .settings-list .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
        }

        .settings-list .setting-item:last-child {
          border-bottom: none;
        }

        .setting-content h4 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: var(--heading-color);
        }

        .setting-content p {
          color: color-mix(in srgb, var(--default-color), transparent 30%);
          font-size: 0.9rem;
          margin: 0;
        }

        .setting-control .form-select {
          min-width: 150px;
          padding: 0.5rem;
          border: 2px solid color-mix(in srgb, var(--default-color), transparent 85%);
          border-radius: 6px;
        }

        .notifications-list .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem 0;
          border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
        }

        .notifications-list .notification-item:last-child {
          border-bottom: none;
        }

        .notification-content h4 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: var(--heading-color);
        }

        .notification-content p {
          color: color-mix(in srgb, var(--default-color), transparent 30%);
          font-size: 0.9rem;
          margin: 0;
        }

        .notification-controls {
          display: flex;
          gap: 1rem;
        }

        .appointments-list .appointment-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: color-mix(in srgb, var(--background-color), transparent 95%);
          border-radius: 10px;
          margin-bottom: 1rem;
          border: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
        }

        .appointment-info {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .appointment-date {
          text-align: center;
          min-width: 80px;
        }

        .appointment-date .date {
          display: block;
          font-weight: 600;
          color: var(--heading-color);
          font-size: 0.9rem;
        }

        .appointment-date .time {
          display: block;
          color: var(--accent-color);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .appointment-details h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
          color: var(--heading-color);
        }

        .appointment-details p {
          color: color-mix(in srgb, var(--default-color), transparent 30%);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .appointment-details .status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .appointment-details .status.upcoming {
          background: color-mix(in srgb, #ffc107, transparent 20%);
          color: #856404;
        }

        .appointment-details .status.completed {
          background: color-mix(in srgb, #28a745, transparent 20%);
          color: #155724;
        }

        .appointment-actions {
          display: flex;
          gap: 0.5rem;
        }

        .medical-records .record-card {
          padding: 1.5rem;
          background: color-mix(in srgb, var(--background-color), transparent 95%);
          border-radius: 10px;
          margin-bottom: 1rem;
          border: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
        }

        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .record-header h4 {
          font-size: 1.1rem;
          color: var(--heading-color);
          margin: 0;
        }

        .record-header .date {
          color: color-mix(in srgb, var(--default-color), transparent 40%);
          font-size: 0.9rem;
        }

        .record-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .record-content p {
          color: color-mix(in srgb, var(--default-color), transparent 30%);
          margin: 0;
        }

        .security-options {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
        }

        .security-options h4 {
          font-size: 1.25rem;
          color: var(--heading-color);
          margin-bottom: 0.5rem;
        }

        .security-options p {
          color: color-mix(in srgb, var(--default-color), transparent 30%);
          margin-bottom: 1.5rem;
        }

        @media (max-width: 991px) {
          .profile-sidebar {
            position: static;
            margin-bottom: 2rem;
          }

          .profile-content {
            padding: 2rem;
          }
        }

        @media (max-width: 768px) {
          .profile-page {
            padding-top: 100px;
          }

          .profile-sidebar {
            padding: 1.5rem;
          }

          .profile-content {
            padding: 1.5rem;
          }

          .avatar-circle {
            width: 60px;
            height: 60px;
          }

          .avatar-circle i {
            font-size: 2rem;
          }

          .profile-nav .nav-link {
            padding: 0.75rem;
            font-size: 0.9rem;
          }

          .appointment-info {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .appointment-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile