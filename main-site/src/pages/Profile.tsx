import { useState, useEffect } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import { profileAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import MyAppointments from '../components/MyAppointments'
import MyMedicalRecords from '../components/MyMedicalRecords'
import MyBills from '../components/MyBills'

const Profile = () => {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('personal')
  const [user, setUser] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Account settings state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [emailForm, setEmailForm] = useState({
    current_password: '',
    email: '',
    confirm_email: ''
  })

  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dob: '',
    age: '',
    gender: '',
    blood_group: '',
    profile_image: null as File | null
  })

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get()
      if (response.data.status && response.data.user) {
        const userData = response.data.user
        setUser(userData)

        // Map data to form
        const patient = userData.patient || {}
        setFormData({
          first_name: patient.first_name || userData.name.split(' ')[0] || '',
          last_name: patient.last_name || userData.name.split(' ').slice(1).join(' ') || '',
          email: userData.email || '',
          phone: userData.phone || patient.phone || '',
          address: patient.address || '',
          city: patient.city || '',
          state: patient.state || '',
          pincode: patient.pincode || '',
          dob: patient.dob || '',
          age: patient.age || '',
          gender: patient.gender || '',
          blood_group: patient.blood_group || '',
          profile_image: null
        })

        if (patient.profile_image_url) {
          setImagePreview(patient.profile_image_url)
        } else if (userData.avatar) {
          setImagePreview(userData.avatar)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('Failed to load profile data', 'error')
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Never'
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData(prev => ({ ...prev, profile_image: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    try {
      const data = new FormData()
      data.append('_method', 'PUT') // Method spoofing for Laravel

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          data.append(key, value as string | Blob)
        }
      })

      const response = await profileAPI.update(data)
      if (response.data.status) {
        showToast('Profile updated successfully', 'success')
        await fetchProfile() // Refresh data
        setIsEditMode(false) // Switch back to profile details view after successful save
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Failed to update profile', 'error')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('New passwords do not match', 'error')
      return
    }

    if (passwordForm.new_password.length < 8) {
      showToast('New password must be at least 8 characters long', 'error')
      return
    }

    setIsPasswordLoading(true)
    try {
      const response = await profileAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })

      if (response.data.status) {
        showToast('Password changed successfully', 'success')
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
        setShowPasswordForm(false) // Close the form after success
      }
    } catch (error: any) {
      console.error('Error changing password:', error)
      const message = error.response?.data?.message || 'Failed to change password'
      showToast(message, 'error')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (emailForm.email !== emailForm.confirm_email) {
      showToast('Email addresses do not match', 'error')
      return
    }

    setIsEmailLoading(true)
    try {
      const response = await profileAPI.changeEmail({
        current_password: emailForm.current_password,
        email: emailForm.email,
      })

      if (response.data.status) {
        showToast('Email changed successfully', 'success')
        setEmailForm({
          current_password: '',
          email: '',
          confirm_email: ''
        })
        setShowEmailForm(false) // Close the form after success
        await fetchProfile() // Refresh user data
      }
    } catch (error: any) {
      console.error('Error changing email:', error)
      const message = error.response?.data?.message || 'Failed to change email'
      showToast(message, 'error')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: 'bi-person' },
    { id: 'account', label: 'Account Settings', icon: 'bi-gear' },
    { id: 'security', label: 'Security', icon: 'bi-shield-lock' },
    { id: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    { id: 'appointments', label: 'My Appointments', icon: 'bi-calendar-check' },
    { id: 'medical', label: 'Medical Records', icon: 'bi-file-medical' },
    { id: 'bills', label: 'Bills & Payments', icon: 'bi-receipt' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="profile-section">
            <div className="section-header">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h3>Personal Information</h3>
                  <p>Update your personal details and contact information</p>
                </div>
                <button
                  className="custom-edit-btn"
                  data-mode={isEditMode ? "view" : "edit"}
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  <i className={`bi ${isEditMode ? 'bi-eye' : 'bi-pencil-square'} me-1`}></i>
                  {isEditMode ? 'View Details' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Patient Details Summary */}
            {!isEditMode && (
              <div className="patient-details-summary mb-4" data-aos="fade-up">
                <div className="row">
                  <div className="col-md-3 text-center">
                    <div className="patient-avatar-large">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <i className="bi bi-person-circle"></i>
                      )}
                    </div>
                  </div>
                  <div className="col-md-9">
                    <div className="patient-info-grid">
                      <div className="info-row">
                        <label>Full Name:</label>
                        <span>{formData.first_name} {formData.last_name}</span>
                      </div>
                      <div className="info-row">
                        <label>Email:</label>
                        <span>{formData.email}</span>
                      </div>
                      <div className="info-row">
                        <label>Phone:</label>
                        <span>{formData.phone}</span>
                      </div>
                      <div className="info-row">
                        <label>Date of Birth:</label>
                        <span>{formData.dob ? new Date(formData.dob).toLocaleDateString() : 'Not provided'}</span>
                      </div>
                      <div className="info-row">
                        <label>Age:</label>
                        <span>{formData.age || 'Not provided'}</span>
                      </div>
                      <div className="info-row">
                        <label>Gender:</label>
                        <span>{formData.gender || 'Not provided'}</span>
                      </div>
                      <div className="info-row">
                        <label>Blood Group:</label>
                        <span>{formData.blood_group || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.address && (
                  <div className="mt-3">
                    <label>Address:</label>
                    <p className="mb-0">{formData.address}</p>
                    <p className="mb-0">{formData.city}, {formData.state} - {formData.pincode}</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Form */}
            {isEditMode && (
              <>
                {/* Profile Image Upload */}
                <div className="profile-image-upload mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="image-preview" style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#f0f0f0',
                      backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {!imagePreview && <i className="bi bi-person" style={{ fontSize: '3rem', color: '#ccc' }}></i>}
                    </div>
                    <div>
                      <label htmlFor="profile_image" className="btn btn-outline-primary btn-sm mb-2">
                        Change Picture
                      </label>
                      <input
                        type="file"
                        id="profile_image"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <p className="text-muted small mb-0">Allowed JPG, GIF or PNG. Max size of 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="profile-form">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="first_name">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        // disabled // Usually email change requires verify
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="dob">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          id="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input
                          type="number"
                          className="form-control"
                          id="age"
                          value={formData.age}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select
                          className="form-control"
                          id="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="blood_group">Blood Group</label>
                    <select
                      className="form-control"
                      id="blood_group"
                      value={formData.blood_group}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      className="form-control"
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="state">State</label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="pincode">Pincode</label>
                        <input
                          type="text"
                          className="form-control"
                          id="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-primary" onClick={handleSubmit}>Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={fetchProfile}>Cancel</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      case 'account':
        return (
          <div className="profile-section">
            <div className="section-header">
              <h3>Account Settings</h3>
              <p>Manage your account password and email settings</p>
            </div>

            <div className="row">
              {/* Change Email Card */}
              <div className="col-md-6">
                <div className="account-settings-card">
                  <div className="card-header">
                    <h4><i className="bi bi-envelope"></i> Email Address</h4>
                    <p>Your current email address and settings</p>
                  </div>

                  {!showEmailForm ? (
                    <div className="summary-view">
                      <div className="summary-item">
                        <label>Current Email:</label>
                        <div className="summary-value">
                          <span>{user?.email || formData.email || 'Loading...'}</span>
                        </div>
                      </div>
                      <div className="summary-item">
                        <label>Last Updated:</label>
                        <div className="summary-value">
                          <span>{formatDate(user?.updated_at)}</span>
                        </div>
                      </div>
                      <div className="summary-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowEmailForm(true)}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Change Email
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailChange}>
                      <div className="form-group">
                        <label htmlFor="email_current_password">Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="email_current_password"
                          value={emailForm.current_password}
                          onChange={(e) => setEmailForm(prev => ({ ...prev, current_password: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="new_email">New Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="new_email"
                          value={emailForm.email}
                          onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirm_email">Confirm Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="confirm_email"
                          value={emailForm.confirm_email}
                          onChange={(e) => setEmailForm(prev => ({ ...prev, confirm_email: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary me-2"
                          disabled={isEmailLoading || !emailForm.current_password || !emailForm.email || !emailForm.confirm_email}
                        >
                          {isEmailLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Changing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Update Email
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowEmailForm(false)}
                          disabled={isEmailLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Change Password Card */}
              <div className="col-md-6">
                <div className="account-settings-card">
                  <div className="card-header">
                    <h4><i className="bi bi-shield-lock"></i> Password</h4>
                    <p>Your account password and security settings</p>
                  </div>

                  {!showPasswordForm ? (
                    // Summary View
                    <div className="summary-view">
                      <div className="summary-item">
                        <label>Current Password:</label>
                        <div className="summary-value">
                          <span>••••••••</span>
                        </div>
                      </div>
                      <div className="summary-item">
                        <label>Last Updated:</label>
                        <div className="summary-value">
                          <span>{formatDate(user?.updated_at)}</span>
                        </div>
                      </div>
                      <div className="summary-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowPasswordForm(true)}
                        >
                          <i className="bi bi-shield-lock me-2"></i>
                          Change Password
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Form View
                    <form onSubmit={handlePasswordChange}>
                      <div className="form-group">
                        <label htmlFor="current_password">Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="current_password"
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="new_password">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="new_password"
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                          required
                          minLength={8}
                        />
                        <small className="form-text text-muted">Minimum 8 characters</small>
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirm_password">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="confirm_password"
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary me-2"
                          disabled={isPasswordLoading || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                        >
                          {isPasswordLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Changing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Update Password
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowPasswordForm(false)}
                          disabled={isPasswordLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="security-notice mt-4">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Security Notice:</strong> Your current password is required to make changes to your account settings. This ensures that only you can modify your account credentials.
              </div>
            </div>
          </div>
        )
      case 'appointments':
        return <MyAppointments />
      case 'medical':
        return <MyMedicalRecords />
      case 'bills':
        return <MyBills />
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
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person-circle"></i>
                    )}
                  </div>
                  <div className="avatar-info">
                    <h4>{user?.name || 'User'}</h4>
                    <p>{user?.email || 'email@example.com'}</p>
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
          overflow: hidden; 
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

          .section-header .d-flex {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start !important;
          }

          .section-header .btn {
            align-self: flex-end;
          }
        }

        /* Patient Details Summary Styles */
        .patient-details-summary {
          background: color-mix(in srgb, var(--accent-color), transparent 95%);
          border: 1px solid color-mix(in srgb, var(--accent-color), transparent 80%);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .patient-avatar-large {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color), #007acc 50%));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 8px 25px color-mix(in srgb, var(--accent-color), transparent 70%);
          overflow: hidden;
        }

        .patient-avatar-large i {
          font-size: 4rem;
          color: var(--contrast-color);
        }

        .patient-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-row label {
          font-weight: 600;
          color: color-mix(in srgb, var(--heading-color), transparent 20%);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-row span {
          color: var(--heading-color);
          font-size: 1rem;
          font-weight: 500;
        }

        @media (max-width: 767px) {
          .patient-details-summary {
            padding: 1.5rem;
          }

          .patient-avatar-large {
            width: 80px;
            height: 80px;
            margin-bottom: 1rem;
          }

          .patient-avatar-large i {
            font-size: 2.5rem;
          }

          .patient-info-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
        
        /* Account Settings Styles */
        .account-settings-card {
          background: var(--surface-color);
          border: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          height: fit-content;
        }
        
        .account-settings-card .card-header {
          border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        
        .account-settings-card .card-header h4 {
          color: var(--heading-color);
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .account-settings-card .card-header h4 i {
          color: var(--accent-color);
          font-size: 1.1rem;
        }
        
        .account-settings-card .card-header p {
          color: color-mix(in srgb, var(--default-color), transparent 40%);
          margin-bottom: 0;
          font-size: 0.9rem;
        }
        
        .account-settings-card .form-group {
          margin-bottom: 1.5rem;
        }
        
        .account-settings-card .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--heading-color);
          font-size: 0.95rem;
        }
        
        .account-settings-card .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid color-mix(in srgb, var(--default-color), transparent 85%);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .account-settings-card .form-control:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--accent-color), transparent 85%);
        }
        
        .account-settings-card .form-text {
          margin-top: 0.25rem;
          font-size: 0.8rem;
        }
        
        .account-settings-card .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .account-settings-card .btn-primary {
          background: var(--accent-color);
          border: 2px solid var(--accent-color);
          color: var(--contrast-color);
        }
        
        .account-settings-card .btn-primary:hover:not(:disabled) {
          background: color-mix(in srgb, var(--accent-color), black 10%);
          transform: translateY(-1px);
        }
        
        .account-settings-card .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        /* Summary View Styles */
        .summary-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .summary-item label {
          font-weight: 600;
          color: color-mix(in srgb, var(--heading-color), transparent 20%);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .summary-value {
          background: color-mix(in srgb, var(--accent-color), transparent 95%);
          border: 1px solid color-mix(in srgb, var(--accent-color), transparent 80%);
          border-radius: 8px;
          padding: 0.75rem;
          color: var(--heading-color);
          font-size: 1rem;
          font-weight: 500;
        }
        
        .summary-actions {
          margin-top: 1rem;
        }
        
        .summary-actions .btn {
          width: 100%;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .summary-actions .btn-primary {
          background: var(--accent-color);
          border: 2px solid var(--accent-color);
          color: var(--contrast-color);
        }
        
        .summary-actions .btn-primary:hover {
          background: color-mix(in srgb, var(--accent-color), black 10%);
          transform: translateY(-1px);
        }
        
        /* Form actions specific to account settings */
        .account-settings-card .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }
        
        .account-settings-card .form-actions .btn {
          flex: 1;
          min-width: 120px;
        }
        
        .account-settings-card .form-actions .btn-secondary {
          background: transparent;
          border: 2px solid color-mix(in srgb, var(--default-color), transparent 70%);
          color: var(--default-color);
        }
        
        .account-settings-card .form-actions .btn-secondary:hover:not(:disabled) {
          background: color-mix(in srgb, var(--default-color), transparent 90%);
        }
        
        .security-notice {
          background: color-mix(in srgb, var(--accent-color), transparent 95%);
          border: 1px solid color-mix(in srgb, var(--accent-color), transparent 80%);
          border-radius: 8px;
          padding: 1rem;
        }
        
        .security-notice .alert {
          background: transparent;
          border: none;
          margin: 0;
          padding: 0;
          color: var(--heading-color);
        }
        
        .security-notice .alert i {
          color: var(--accent-color);
        }
        
        /* Custom Edit Button Styles */
        .custom-edit-btn {
          background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color), #007acc 50%));
          border: none;
          color: var(--contrast-color);
          padding: 0.625rem 1.25rem;
          border-radius: 25px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px color-mix(in srgb, var(--accent-color), transparent 70%);
          position: relative;
          overflow: hidden;
          text-transform: none;
          letter-spacing: 0.025em;
        }
        
        .custom-edit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .custom-edit-btn:hover {
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent-color), black 10%), color-mix(in srgb, var(--accent-color), #007acc 60%));
          transform: translateY(-2px);
          box-shadow: 0 8px 25px color-mix(in srgb, var(--accent-color), transparent 60%);
        }
        
        .custom-edit-btn:hover::before {
          left: 100%;
        }
        
        .custom-edit-btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 15px color-mix(in srgb, var(--accent-color), transparent 70%);
        }
        
        .custom-edit-btn i {
          font-size: 1rem;
          transition: transform 0.3s ease;
        }
        
        .custom-edit-btn:hover i {
          transform: scale(1.1);
        }
        
        /* Edit mode specific styling */
        .custom-edit-btn[data-mode="view"] {
          background: linear-gradient(135deg, #6c757d, #5a6268);
          box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }
        
        .custom-edit-btn[data-mode="view"]:hover {
          background: linear-gradient(135deg, #5a6268, #495057);
          box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
        }
        
        @media (max-width: 767px) {
          .custom-edit-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            border-radius: 20px;
          }
          
          .custom-edit-btn i {
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 767px) {
          .account-settings-card {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .account-settings-card .card-header {
            margin-bottom: 1.5rem;
          }
          
          .account-settings-card .card-header h4 {
            font-size: 1.1rem;
          }
          
          .summary-view {
            gap: 1.25rem;
          }
          
          .summary-item label {
            font-size: 0.8rem;
          }
          
          .summary-value {
            padding: 0.625rem;
            font-size: 0.95rem;
          }
          
          .summary-actions .btn {
            padding: 0.625rem 1.25rem;
            font-size: 0.9rem;
          }
          
          .account-settings-card .form-actions {
            flex-direction: column;
          }
          
          .account-settings-card .form-actions .btn {
            width: 100%;
          }
        }
        
        /* Debug styles to ensure visibility */
        .summary-view * {
          visibility: visible !important;
        }
        
        .summary-item {
          margin-bottom: 1rem !important;
        }
        
        .summary-value {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}

export default Profile