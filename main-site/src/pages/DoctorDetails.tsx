import { useLocation } from 'react-router-dom';
import PageHero from '../components/PageHero';
import CalendarComponent from '../components/CalendarComponent';

interface Doctor {
  img: string;
  full_name: string;
  specialization: string;
  bio: string;
  qualifications: string;
  gender: string;
  experience_years: number;
  consultation_fee: number;
  employment_type: string;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string;
  languages: string;
  status: string;
  department_name: string;
  address: string;
  phone: string;
  email: string;
}

const DoctorDetails = () => {
  const location = useLocation();
  const doctor: Doctor = location.state?.doctor;
  const parsedLanguages = JSON.parse(doctor.languages).join(', ');

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
                  <img src={`/assets/img/health/${doctor.img}`} alt={doctor.full_name} />
                  <div className="appointment-status-badge">
                    <span className="appointment-status-dot"></span> {doctor.status}
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="appointment-doctor-details">
                  <div className="appointment-doc-header">
                    <h2>{doctor.full_name}</h2>
                    <span className="appointment-doc-specialty">{doctor.specialization} - {doctor.department_name}</span>
                  </div>

                  <p className="appointment-doc-bio">{doctor.bio}</p>

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
                      <span className="appointment-info-value">{doctor.qualifications}</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Gender</span>
                      <span className="appointment-info-value">{doctor.gender}</span>
                    </div>
                  </div>

                  <div className="appointment-info-grid" style={{ marginTop: '20px' }}>
                     <div className="appointment-info-box">
                      <span className="appointment-info-label">Working Days</span>
                      <span className="appointment-info-value">{doctor.working_days}</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Hours</span>
                      <span className="appointment-info-value">{doctor.working_hours_start} - {doctor.working_hours_end}</span>
                    </div>
                    <div className="appointment-info-box">
                      <span className="appointment-info-label">Languages</span>
                      <span className="appointment-info-value" style={{fontSize: '0.85rem'}}>{parsedLanguages}</span>
                    </div>
                     <div className="appointment-info-box">
                      <span className="appointment-info-label">Type</span>
                      <span className="appointment-info-value">{doctor.employment_type}</span>
                    </div>
                  </div>

                  <div className="appointment-contact-row">
                    <div className="appointment-contact-item">
                      <i className="bi bi-geo-alt-fill"></i> {doctor.address}
                    </div>
                    <div className="appointment-contact-item">
                      <i className="bi bi-envelope-fill"></i> {doctor.email}
                    </div>
                    <div className="appointment-contact-item">
                      <i className="bi bi-telephone-fill"></i> {doctor.phone}
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