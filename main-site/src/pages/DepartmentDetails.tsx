import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const DepartmentDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, [])

  // --- MOCK DATA (Fallback if no state is passed) ---
  // In a real app, you would fetch this by ID from the URL
  const defaultDept = {
    title: 'Cardiology',
    subtitle: 'Heart & Vascular Institute',
    img: 'cardiology-2.webp',
    icon: 'bi-heart-pulse',
    desc: 'Our Cardiology department offers a comprehensive range of diagnostic and treatment services for patients with heart conditions.',
    phone: '+1 234 567 890',
    email: 'cardio@medilab.com',
    location: 'Building A, 2nd Floor',
    head: 'Dr. Jennifer Martinez'
  };

  const departmentData = state?.department || defaultDept;

  // --- MOCK DOCTORS DATA (Filtered by Department) ---
  const allDoctors = [
    { id: 1, name: 'Dr. Jennifer Martinez', specialty: 'Cardiology', role: 'Head of Department', img: 'staff-3.webp', bio: 'Expert in interventional cardiology with 15 years of experience.' },
    { id: 2, name: 'Dr. Emily Johnson', specialty: 'Cardiology', role: 'Senior Consultant', img: 'staff-12.webp', bio: 'Specializes in heart rhythm disorders and cardiac imaging.' },
    { id: 3, name: 'Dr. Michael Chen', specialty: 'Orthopedics', role: 'Surgeon', img: 'staff-7.webp', bio: 'Orthopedic surgeon specializing in sports medicine.' },
    // Add more mock doctors as needed to test filtering
  ];

  // Filter doctors that match the current department name (or generic fallback logic)
  const relatedDoctors = allDoctors.filter(doc => 
    doc.specialty.includes(departmentData.title) || 
    departmentData.title.includes(doc.specialty)
  );

  const handleBookAppointment = (doctor: any) => {
    // Navigate to appointment page or open modal
    console.log("Booking for", doctor.name);
  };

  return (
    <div className="department-details-page">
      <style>{`
        /* --- Page Specific Styles --- */
        .dept-tabs-nav {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .dept-tab-btn {
          background: none;
          border: none;
          padding: 10px 20px;
          font-weight: 600;
          color: #666;
          border-radius: 50px;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .dept-tab-btn:hover {
          color: var(--accent-color);
          background: rgba(4, 158, 187, 0.05);
        }

        .dept-tab-btn.active {
          background: var(--accent-color);
          color: #fff;
          box-shadow: 0 4px 10px rgba(4, 158, 187, 0.3);
        }

        .content-box {
          background: #fff;
          border-radius: 0 0 12px 12px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .feature-list li {
          margin-bottom: 12px;
          display: flex;
          align-items: start;
          color: #555;
        }

        .feature-list i {
          color: var(--accent-color);
          margin-right: 10px;
          font-size: 1.1rem;
          margin-top: 2px;
        }

        /* --- Sidebar Styles --- */
        .dept-sidebar {
          background: #fff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
          position: sticky;
          top: 100px; /* Sticky effect */
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .sidebar-icon {
          width: 50px;
          height: 50px;
          background: rgba(4, 158, 187, 0.1);
          color: var(--accent-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .info-row {
          margin-bottom: 20px;
        }
        
        .info-row label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #999;
          font-weight: 600;
          display: block;
          margin-bottom: 5px;
        }

        .info-row p {
          color: var(--heading-color);
          font-weight: 500;
          margin: 0;
          font-size: 1rem;
        }

        .hours-list {
          list-style: none;
          padding: 0;
          margin-top: 20px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }

        .hours-list li {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: #555;
        }
        
        .hours-list li:last-child { margin-bottom: 0; }
        .hours-list li span:last-child { font-weight: 600; color: var(--heading-color); }

        /* --- Doctor List Styles --- */
        .specialist-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .specialist-card:hover {
          border-color: var(--accent-color);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          transform: translateX(5px);
        }

        .specialist-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .specialist-info h5 {
          margin: 0 0 5px 0;
          color: var(--heading-color);
          font-weight: 700;
        }

        .specialist-role {
          font-size: 0.85rem;
          color: var(--accent-color);
          margin-bottom: 5px;
          display: block;
        }

        .specialist-actions {
          margin-left: auto;
        }
      `}</style>

      <PageHero
        title={departmentData.title}
        description={departmentData.subtitle}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Departments', path: '/departments' },
          { label: departmentData.title }
        ]}
      />

      <section className="department-details section">
        <div className="container" data-aos="fade-up">
          <div className="row">
            
            {/* --- LEFT COLUMN: MAIN CONTENT --- */}
            <div className="col-lg-8">
              
              {/* Main Image */}
              <div className="mb-4 rounded-4 overflow-hidden position-relative" style={{height: '350px'}}>
                <img 
                  src={`/assets/img/health/${departmentData.img}`} 
                  alt={departmentData.title} 
                  className="w-100 h-100 object-fit-cover" 
                />
                <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'}}>
                  <h3 className="text-white m-0">{departmentData.title} Excellence</h3>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="dept-tabs-nav">
                <button 
                  className={`dept-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`dept-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  Treatments & Services
                </button>
                <button 
                  className={`dept-tab-btn ${activeTab === 'technology' ? 'active' : ''}`}
                  onClick={() => setActiveTab('technology')}
                >
                  Technology
                </button>
              </div>

              {/* Tab Content */}
              <div className="content-box mb-5">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="mb-3 fw-bold text-dark">About the Department</h3>
                    <p className="lead text-muted mb-4">{departmentData.desc}</p>
                    <p>We are dedicated to providing state-of-the-art care. Our team of specialists works collaboratively to diagnose and treat complex conditions with precision and compassion.</p>
                    <div className="row mt-4">
                      <div className="col-md-6">
                        <ul className="feature-list list-unstyled">
                          <li><i className="bi bi-check-circle-fill"></i> Comprehensive Diagnostics</li>
                          <li><i className="bi bi-check-circle-fill"></i> Personalized Treatment Plans</li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <ul className="feature-list list-unstyled">
                          <li><i className="bi bi-check-circle-fill"></i> 24/7 Emergency Support</li>
                          <li><i className="bi bi-check-circle-fill"></i> Post-treatment Rehabilitation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div>
                    <h3 className="mb-3 fw-bold text-dark">Our Services</h3>
                    <p>We offer a wide array of specialized treatments designed to meet individual patient needs.</p>
                    <div className="row g-3 mt-2">
                      {['Minimally Invasive Surgery', 'Diagnostic Imaging', 'Preventive Screenings', 'Advanced Therapy', 'Outpatient Services', 'Consultation'].map((item, idx) => (
                        <div key={idx} className="col-md-6">
                          <div className="p-3 border rounded bg-light">
                            <h6 className="m-0 text-dark"><i className="bi bi-dot text-primary"></i> {item}</h6>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'technology' && (
                   <div>
                   <h3 className="mb-3 fw-bold text-dark">Advanced Technology</h3>
                   <p>Our department is equipped with the latest medical technology to ensure accuracy and safety.</p>
                   <ul className="feature-list list-unstyled mt-3">
                     <li><i className="bi bi-cpu"></i> Robotic-Assisted Surgery Systems</li>
                     <li><i className="bi bi-display"></i> 3D Imaging & MRI Scanners</li>
                     <li><i className="bi bi-activity"></i> Real-time Patient Monitoring</li>
                   </ul>
                 </div>
                )}
              </div>

              {/* --- RELATED DOCTORS SECTION --- */}
              <div className="mt-5 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-end mb-4">
                  <h3 className="fw-bold text-dark m-0">Meet Our Specialists</h3>
                  <Link to="/doctors" className="text-decoration-none small fw-bold">View All Doctors <i className="bi bi-arrow-right"></i></Link>
                </div>

                {relatedDoctors.length > 0 ? (
                  relatedDoctors.map(doctor => (
                    <div key={doctor.id} className="specialist-card" data-aos="fade-up">
                      <img src={`/assets/img/health/${doctor.img}`} alt={doctor.name} className="specialist-img" />
                      <div className="specialist-info">
                        <h5>{doctor.name}</h5>
                        <span className="specialist-role">{doctor.role}</span>
                        <p className="small text-muted mb-0 d-none d-md-block">{doctor.bio}</p>
                      </div>
                      <div className="specialist-actions d-none d-sm-block">
                         <button 
                            className="btn btn-outline-primary btn-sm rounded-pill"
                            onClick={() => handleBookAppointment(doctor)}
                          >
                           Book Visit
                         </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No specific specialists listed for this department yet.</p>
                )}
              </div>

            </div>

            {/* --- RIGHT COLUMN: SIDEBAR --- */}
            <div className="col-lg-4">
              <div className="dept-sidebar">
                <div className="sidebar-header">
                  <div className="sidebar-icon">
                    <i className={`bi ${departmentData.icon}`}></i>
                  </div>
                  <div>
                    <h5 className="m-0 fw-bold text-dark">{departmentData.title}</h5>
                    <small className="text-muted">Department Info</small>
                  </div>
                </div>

                <div className="info-row">
                  <label><i className="bi bi-person me-2"></i>Head of Department</label>
                  <p>{departmentData.head}</p>
                </div>

                <div className="info-row">
                  <label><i className="bi bi-geo-alt me-2"></i>Location</label>
                  <p>{departmentData.location}</p>
                </div>

                <div className="info-row">
                  <label><i className="bi bi-telephone me-2"></i>Contact</label>
                  <p>{departmentData.phone}</p>
                  <p className="small text-muted">{departmentData.email}</p>
                </div>

                <div className="mt-4">
                  <label className="fw-bold text-dark mb-2">Opening Hours</label>
                  <ul className="hours-list">
                    <li><span>Mon - Fri</span> <span>08:00 - 20:00</span></li>
                    <li><span>Saturday</span> <span>09:00 - 18:00</span></li>
                    <li><span>Sunday</span> <span>Emergency Only</span></li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-top text-center">
                  <h6 className="fw-bold mb-3">Need Emergency Care?</h6>
                  <button className="btn btn-danger w-100 py-2 fw-bold">
                    <i className="bi bi-telephone-fill me-2"></i> Call Ambulance
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default DepartmentDetails