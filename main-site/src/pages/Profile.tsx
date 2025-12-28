import { useState, useEffect } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import { profileAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

const Profile = () => {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('personal')
  const [user, setUser] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
        fetchProfile() // Refresh data
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Failed to update profile', 'error')
    }
  }

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
          </div>
        )
      case 'account':
        return (
          <div className="profile-section">
            <div className="section-header">
              <h3>Account Settings</h3>
              <p>Manage your account preferences and settings</p>
            </div>
            <p>Account settings content here...</p>
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
        }
      `}</style>
    </div>
  )
}

export default Profile