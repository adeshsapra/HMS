import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import Pagination from '../components/Pagination'
import ContentLoader from '../components/ContentLoader'
import { doctorAPI, departmentAPI } from '../services/api'

interface Department {
  id: number;
  name: string;
  slug: string;
}

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

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)
  const perPage = 8

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments for filter dropdown
  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll(1, 100);
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
    fetchDepartments();
    fetchDoctors();
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        department: departmentFilter,
        experience: experienceFilter > 0 ? experienceFilter : undefined
      };
      const response = await doctorAPI.getAll(currentPage, perPage, filters);
      if (response.data.success && response.data.data) {
        if (response.data.meta) {
          setDoctors(response.data.data);
          setTotalPages(response.data.meta.last_page || 1);
          setTotalRecords(response.data.meta.total || 0);
          setFrom(response.data.meta.from || 0);
          setTo(response.data.meta.to || 0);
        } else {
          setDoctors(response.data.data);
          setTotalRecords(response.data.data.length);
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    navigate(`/doctors/${doctor.id}`, { state: { doctor } });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchDoctors();
  };

  const handleClearFilter = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setExperienceFilter(0);
    setCurrentPage(1);
  };

  // ADDED margin=20 and size=512 so the default image is never cut off
  const DEFAULT_DOCTOR_IMAGE =
    "https://ui-avatars.com/api/?name=Doctor&background=0D8ABC&color=fff&size=512&margin=20";

  const getImageUrl = (path: string | null) => {
    if (!path) return DEFAULT_DOCTOR_IMAGE;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="doctors-page">
      <style>{`
        /* =========== ENHANCED PROFESSIONAL FILTER DESIGN =========== */
        .doctor-filter-wrapper {
          background: #ffffff;
          border-radius: 20px;
          padding: 28px 32px;
          box-shadow: 0 10px 40px rgba(13, 138, 188, 0.06);
          margin-bottom: 45px;
          border: 1px solid rgba(13, 138, 188, 0.1);
        }

        .doctor-filter-header {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1a3353;
          font-weight: 700;
          font-size: 1.15rem;
        }

        .doctor-filter-header i {
          color: #0d8abc;
          font-size: 1.3rem;
        }

        .doctor-filter-grid {
          display: grid;
          grid-template-columns: minmax(200px, 1.2fr) minmax(200px, 1.2fr) minmax(200px, 1.5fr) auto;
          gap: 24px;
          align-items: flex-end;
        }

        .filter-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          margin: 0;
        }

        .filter-input-wrapper {
          position: relative;
        }

        .filter-input-wrapper i {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1.1rem;
          pointer-events: none;
        }

        .doctor-filter-input, .doctor-filter-select {
          width: 100%;
          padding: 12px 16px 12px 46px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1e293b;
          background-color: #f8fafc;
          transition: all 0.3s ease;
          appearance: none;
        }

        .doctor-filter-input:focus, .doctor-filter-select:focus {
          border-color: #0d8abc;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(13, 138, 188, 0.1);
          outline: none;
        }

        .doctor-filter-select {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
        }

        .doctor-filter-range {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 4px;
          outline: none;
          margin: 15px 0 10px 0;
        }

        .doctor-filter-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0d8abc;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }

        .doctor-filter-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .doctor-filter-range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }

        .doctor-filter-actions {
          display: flex;
          gap: 12px;
        }

        .doctor-btn-filter {
          padding: 12px 24px;
          background: linear-gradient(135deg, #0d8abc 0%, #0a6c94 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(13, 138, 188, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .doctor-btn-filter:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(13, 138, 188, 0.35);
        }

        .doctor-btn-clear-filter {
          padding: 12px 18px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doctor-btn-clear-filter:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        /* Responsive Breakpoints for Filters */
        @media (max-width: 991px) {
          .doctor-filter-wrapper { padding: 24px; }
          .doctor-filter-grid { grid-template-columns: 1fr 1fr; }
          .doctor-filter-actions { grid-column: span 2; justify-content: flex-end; }
        }

        @media (max-width: 576px) {
          .doctor-filter-wrapper { padding: 20px 16px; margin-bottom: 30px; }
          .doctor-filter-grid { grid-template-columns: 1fr; gap: 18px; }
          .doctor-filter-actions { grid-column: span 1; flex-direction: column; width: 100%; }
          .doctor-btn-filter, .doctor-btn-clear-filter { width: 100%; }
        }


        /* =========== UPDATED DOCTOR CARD DESIGN =========== */
        .doctor-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #f8fafc;
        }

        .doctor-card:hover { 
          transform: translateY(-10px); 
          box-shadow: 0 15px 35px rgba(0,0,0,0.1); 
        }

        .doctor-image {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doctor-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* CHANGED to center to perfectly fit fallback placeholder text */
          object-position: center; 
          transition: transform 0.5s ease;
        }

        .doctor-card:hover .doctor-image img { transform: scale(1.08); }

        .doctor-content {
          padding: 20px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        /* CHANGED: STACKED NAME AND DEPARTMENT ON SEPARATE LINES */
        .doctor-header-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 12px;
          gap: 8px;
        }

        .doctor-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1a3353;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis; 
          width: 100%; /* Ensures long names still truncate nicely */
        }

        .doctor-specialty {
          color: #0d8abc;
          background: rgba(13, 138, 188, 0.1);
          font-weight: 700;
          font-size: 0.75rem;
          padding: 6px 12px;
          border-radius: 30px;
          white-space: nowrap;
          display: inline-block;
        }

        .doctor-bio {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 15px;
          flex-grow: 1;
          
          /* 2-Line Clamp implementation */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doctor-experience {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .doctor-experience i {
          color: #0d8abc;
        }

        .doctor-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: auto;
        }

        /* Unique Prefix Classes for buttons */
        .doctor-btn-profile, .doctor-btn-appointment {
          padding: 10px 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: center;
        }

        .doctor-btn-profile { background: #f1f5f9; color: #1e293b; }
        .doctor-btn-profile:hover { background: #e2e8f0; transform: translateY(-2px); }

        .doctor-btn-appointment { background: #0d8abc; color: white; box-shadow: 0 4px 10px rgba(13, 138, 188, 0.2); }
        .doctor-btn-appointment:hover { background: #0b7aa8; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(13, 138, 188, 0.3); }

        /* Mobile specific card tweaks */
        @media (max-width: 576px) {
          .doctor-image { height: 250px; }
          .doctor-content { padding: 16px; }
          .doctor-actions { gap: 8px; }
          .doctor-btn-profile, .doctor-btn-appointment {
             padding: 10px 8px; 
             font-size: 0.8rem;
          }
        }
      `}</style>

      <PageHero
        title="Doctors"
        description="Meet our team of skilled and compassionate medical specialists dedicated to your health."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Doctors' }
        ]}
      />

      <section id="doctors" className="doctors section pt-5">
        <div className="container" data-aos="fade-up" data-aos-delay="100">

          {/* =========== ENHANCED DOCTOR FILTER COMPONENT =========== */}
          <div className="doctor-filter-wrapper">
            <div className="doctor-filter-header">
              <i className="bi bi-funnel-fill"></i>
              <span>Find Your Specialist</span>
            </div>

            <div className="doctor-filter-grid">

              <div className="filter-input-group">
                <label>Search Doctor</label>
                <div className="filter-input-wrapper">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="doctor-filter-input"
                    placeholder="Doctor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-input-group">
                <label>Department</label>
                <div className="filter-input-wrapper">
                  <i className="bi bi-hospital"></i>
                  <select
                    className="doctor-filter-select"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.slug}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-input-group">
                <label>Minimum Experience: {experienceFilter > 0 ? `${experienceFilter}+ Years` : 'Any'}</label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  className="doctor-filter-range"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(parseInt(e.target.value))}
                />
                <div className="doctor-filter-range-labels">
                  <span>0 Yrs</span>
                  <span>40+ Yrs</span>
                </div>
              </div>

              <div className="doctor-filter-actions">
                <button className="doctor-btn-filter" onClick={handleApplyFilter}>
                  Search
                </button>
                <button className="doctor-btn-clear-filter" onClick={handleClearFilter} title="Clear Filters">
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>

            </div>
          </div>
          {/* =========== END FILTER COMPONENT =========== */}

          {loading ? (
            <ContentLoader message="Organizing Medical Faculty..." height="300px" />
          ) : (
            <React.Fragment>
              <div className="row gy-4">
                {doctors.map((doctor, idx) => (
                  <div key={doctor.id} className="col-xl-3 col-lg-4 col-md-6 col-12" data-aos="fade-up" data-aos-delay={100 + (idx % 4) * 100}>
                    <div className="doctor-card">
                      <div className="doctor-image">
                        <img
                          src={getImageUrl(doctor.profile_picture)}
                          alt={`${doctor.first_name} ${doctor.last_name}`}
                          className="img-fluid"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_DOCTOR_IMAGE;
                          }}
                        />
                      </div>
                      <div className="doctor-content">

                        {/* CHANGED TO TWO LINES: NAME AND DEPARTMENT */}
                        <div className="doctor-header-stack">
                          <h4 className="doctor-name" title={`${doctor.first_name} ${doctor.last_name}`}>
                            {doctor.first_name} {doctor.last_name}
                          </h4>
                          {doctor.department?.name && (
                            <span className="doctor-specialty">{doctor.department.name}</span>
                          )}
                        </div>

                        <p className="doctor-bio">
                          {doctor.bio || 'Experienced specialist dedicated to providing top-quality healthcare and medical treatments for all patients.'}
                        </p>

                        <div className="doctor-experience">
                          <i className="bi bi-award-fill"></i>
                          <span>{doctor.experience_years} Years Experience</span>
                        </div>

                        <div className="doctor-actions">
                          <button
                            onClick={() => navigate(`/doctor-profile/${doctor.id}`)}
                            className="doctor-btn-profile"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleBookAppointment(doctor)}
                            className="doctor-btn-appointment"
                          >
                            Book now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                perPage={perPage}
                onPageChange={handlePageChange}
                from={from}
                to={to}
              />
            </React.Fragment>
          )}
        </div>
      </section>
    </div>
  )
}

export default Doctors