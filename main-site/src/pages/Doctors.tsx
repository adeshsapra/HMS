import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import Pagination from '../components/Pagination'
import { doctorAPI } from '../services/api'

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
  working_days: string[]; // Backend sends array
  languages: string[]; // Backend sends array
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

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
    fetchDoctors();
  }, [currentPage])

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getAll(currentPage, perPage);
      if (response.data.success && response.data.data) {
        // Check if response is paginated
        if (response.data.meta) {
          setDoctors(response.data.data);
          setTotalPages(response.data.meta.last_page || 1);
          setTotalRecords(response.data.meta.total || 0);
          setFrom(response.data.meta.from || 0);
          setTo(response.data.meta.to || 0);
        } else {
          // Fallback for non-paginated response
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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const DEFAULT_DOCTOR_IMAGE =
    "https://ui-avatars.com/api/?name=Doctor&background=0D8ABC&color=fff&size=256";


  const getImageUrl = (path: string | null) => {
    if (!path) return DEFAULT_DOCTOR_IMAGE;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="doctors-page">
      <PageHero
        title="Doctors"
        description="Meet our team of skilled and compassionate medical specialists dedicated to your health."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Doctors' }
        ]}
      />

      <section id="doctors" className="doctors section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <React.Fragment>
              <div className="row gy-4">
                {doctors.map((doctor, idx) => (
                  <div key={doctor.id} className="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={100 + idx * 100}>
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
                        <div className="doctor-overlay">
                          <div className="doctor-social">
                            <a href="#" className="social-link"><i className="bi bi-linkedin"></i></a>
                            <a href="#" className="social-link"><i className="bi bi-twitter"></i></a>
                            <a href="#" className="social-link"><i className="bi bi-envelope"></i></a>
                          </div>
                        </div>
                      </div>
                      <div className="doctor-content">
                        <h4 className="doctor-name">{doctor.first_name} {doctor.last_name}</h4>
                        <span className="doctor-specialty">{doctor.specialization}</span>
                        <p className="doctor-bio">{doctor.bio ? (doctor.bio.length > 80 ? doctor.bio.substring(0, 80) + '...' : doctor.bio) : 'Experienced specialist.'}</p>
                        <div className="doctor-experience">
                          <span className="experience-badge">{doctor.experience_years} Years Experience</span>
                        </div>
                        <button onClick={() => handleBookAppointment(doctor)} className="btn-appointment">Book Appointment</button>
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

