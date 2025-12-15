import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero';
import CalendarComponent from '../components/CalendarComponent';
import { doctorAPI } from '../services/api';

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  bio: string;
  experience_years: number;
  profile_picture: string;
  qualification: string;
  consultation_fee: number;
  employment_type: string;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
  languages: string[];
  status: string;
  department: {
    name: string;
  };
  address: string;
  phone: string;
  email: string;
  gender: string;
}

const DoctorDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(location.state?.doctor || null);
  const [loading, setLoading] = useState(!location.state?.doctor);

  useEffect(() => {
    if (!doctor && id) {
      fetchDoctor(id);
    } else {
      setLoading(false);
    }
  }, [id, doctor]);

  const fetchDoctor = async (doctorId: string) => {
    try {
      setLoading(true);
      const response = await doctorAPI.getById(doctorId);
      if (response.data.success) {
        setDoctor(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch doctor details", error);
    } finally {
      setLoading(false);
    }
  };

  const DEFAULT_DOCTOR_IMAGE =
    "https://ui-avatars.com/api/?name=Doctor&background=0D8ABC&color=fff&size=256";


  const getImageUrl = (path: string | null) => {
    if (!path) return DEFAULT_DOCTOR_IMAGE;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const formatList = (list: string[] | string) => {
    if (Array.isArray(list)) return list.join(', ');
    try {
      return JSON.parse(list).join(', ');
    } catch (e) {
      return list;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return <div className="text-center mt-5">Doctor not found</div>;
  }

  return (
    <>
      <style>
        {`
        :root {
          --background-color: #ffffff;
          --default-color: #2c3031;
          --heading-color: #18444c;
          --accent-color: #049ebb;
          --surface-color: #ffffff;
          --contrast-color: #ffffff;
          --soft-shadow: 0 10px 40px rgba(4, 158, 187, 0.08);
          --glass-bg: rgba(255, 255, 255, 0.95);
          --border-color: rgba(4, 158, 187, 0.15);
        }

        .appointment-page {
          background-color: #f8fbfc;
          padding-bottom: 80px;
          font-family: "Open Sans", system-ui, -apple-system, sans-serif;
        }

        /* --- Doctor Profile Section --- */
        .appointment-doctor-profile-card {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid var(--border-color);
          box-shadow: var(--soft-shadow);
          overflow: hidden;
          margin-bottom: 40px;
          transition: transform 0.3s ease;
        }

        .appointment-doctor-img-wrapper {
          position: relative;
          height: 100%;
          min-height: 400px;
          overflow: hidden;
        }

        .appointment-doctor-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .appointment-status-badge {
          position: absolute;
          top: 20px;
          left: 20px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.9);
          color: #198754;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.85rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .appointment-status-dot {
          width: 8px;
          height: 8px;
          background-color: #198754;
          border-radius: 50%;
          display: inline-block;
        }

        .appointment-doctor-details {
          padding: 40px;
        }

        .appointment-doc-header h2 {
          color: var(--heading-color);
          font-weight: 800;
          margin-bottom: 5px;
          font-size: 2.2rem;
        }

        .appointment-doc-specialty {
          color: var(--accent-color);
          font-weight: 600;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
          display: block;
        }

        .appointment-doc-bio {
          color: var(--default-color);
          line-height: 1.8;
          margin-bottom: 30px;
          opacity: 0.85;
        }

        .appointment-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .appointment-info-box {
          background: #fdfdfd;
          border: 1px solid #eef2f4;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .appointment-info-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          border-color: var(--accent-color);
        }

        .appointment-info-label {
          display: block;
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .appointment-info-value {
          display: block;
          font-weight: 700;
          color: var(--heading-color);
          font-size: 1rem;
        }

        .appointment-contact-row {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .appointment-contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--default-color);
          font-size: 0.95rem;
        }

        .appointment-contact-item i {
          color: var(--accent-color);
        }

        @media (max-width: 991px) {
          .appointment-doctor-img-wrapper {
            min-height: 300px;
          }
        }
        `}
      </style>

      <div className="appointment-page">
        <PageHero
          title="Doctor Details"
          description="View detailed information about the doctor and book your appointment."
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Doctors', path: '/doctors' },
            { label: 'Details' }
          ]}
        />

        <div className="container mt-5">
          {/* Doctor Profile Section */}
          <div className="appointment-doctor-profile-card">
            <div className="row g-0">
              <div className="col-lg-4">
                <div className="appointment-doctor-img-wrapper">
                  <img
                    src={getImageUrl(doctor.profile_picture)}
                    alt={`${doctor.first_name} ${doctor.last_name}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Doctor';
                    }}
                  />
                  <div className="appointment-status-badge">
                    <span className="appointment-status-dot"></span> {doctor.status || 'Active'}
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="appointment-doctor-details">
                  <div className="appointment-doc-header">
                    <h2>{doctor.first_name} {doctor.last_name}</h2>
                    <span className="appointment-doc-specialty">{doctor.specialization} {doctor.department?.name ? `- ${doctor.department.name}` : ''}</span>
                  </div>

                  <p className="appointment-doc-bio">{doctor.bio || 'No biography available.'}</p>

                  <div className="appointment-info-grid">
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Experience</span>
                      <span className="appointment-info-value">{doctor.experience_years} Years</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Consultation Fee</span>
                      <span className="appointment-info-value">${doctor.consultation_fee}</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Qualification</span>
                      <span className="appointment-info-value">{doctor.qualification || 'N/A'}</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Gender</span>
                      <span className="appointment-info-value">{doctor.gender === 'male' ? 'Male' : doctor.gender === 'female' ? 'Female' : doctor.gender}</span>
                    </div>
                  </div>

                  <div className="appointment-info-grid" style={{ marginTop: '20px' }}>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Working Days</span>
                      <span className="appointment-info-value">{formatList(doctor.working_days)}</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Hours</span>
                      <span className="appointment-info-value">{doctor.working_hours_start} - {doctor.working_hours_end}</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Languages</span>
                      <span className="appointment-info-value" style={{ fontSize: '0.85rem' }}>{formatList(doctor.languages)}</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Type</span>
                      <span className="appointment-info-value">{doctor.employment_type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="appointment-contact-row">
                    <div className="appointment-contact-item">
                      <i className="bi bi-geo-alt-fill"></i> {doctor.address || 'N/A'}
                    </div>
                    <div className="appointment-contact-item">
                      <i className="bi bi-envelope-fill"></i> {doctor.email}
                    </div>
                    <div className="appointment-contact-item">
                      <i className="bi bi-telephone-fill"></i> {doctor.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CalendarComponent doctor={doctor} />
        </div>
      </div>
    </>
  );
};

export default DoctorDetails;