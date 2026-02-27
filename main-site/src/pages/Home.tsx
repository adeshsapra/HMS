import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import axios from "axios";
import {
  departmentAPI,
  doctorAPI,
  homeCareAPI,
  testimonialAPI,
} from "../services/api";
import DepartmentSection from "../components/Home/Departments/DepartmentSection";
import HealthPackageSection from "../components/Home/HealthPackages/HealthPackageSection";
import WorkflowSection from "../components/Home/Workflow/WorkflowSection";
import HospitalAtHomeSection from "../components/Home/HospitalAtHome/HospitalAtHomeSection";
import "../billing-toggle.css";
import SectionHeading from "../components/Home/SectionHeading";
import FindDoctorSection from "../components/Home/FindDoctor/FindDoctorSection";
import CallToActionSection from "../components/Home/CallToAction/CallToActionSection";
import AboutSection from "../components/Home/About/AboutSection";
import FeaturedServicesSection from "../components/Home/FeaturedServices/FeaturedServicesSection";
import EmergencyInfoSection from "../components/Home/EmergencyInfo/EmergencyInfoSection";
import TestimonialsSection from "../components/Home/Testimonials/TestimonialsSection";

interface HealthPackage {
  id: number;
  title: string;
  subtitle: string;
  price_monthly: number;
  price_yearly: number;
  features_monthly: string[];
  features_yearly: string[];
  featured: boolean;
}



const Home = () => {
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);

  // Home Care State
  const [homeCareServices, setHomeCareServices] = useState<any[]>([]);
  const [homeCareSettings, setHomeCareSettings] = useState<any>({});
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  // Doctors State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Departments State
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
    fetchPackages();
    fetchHomeCareData();
    fetchTestimonials();
    fetchDoctorsAndDepartments(); // Combined fetch for better performance
  }, []);



  const fetchHomeCareData = async () => {
    try {
      const [servicesRes, settingsRes] = await Promise.all([
        homeCareAPI.getServices(),
        homeCareAPI.getSettings(),
      ]);
      if (servicesRes.data.success)
        setHomeCareServices(servicesRes.data.data || []);
      if (settingsRes.data.success)
        setHomeCareSettings(settingsRes.data.data || {});
    } catch (err) {
      console.error("Error fetching home care data:", err);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setLoadingTestimonials(true);
      const response = await testimonialAPI.getAll();
      if (response.data.status) {
        setTestimonials(response.data.data.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const API_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      const response = await axios.get(`${API_URL}/public/health-packages`);
      if (response.data.success) {
        setHealthPackages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching health packages:", error);
    }
  };

  const fetchDoctorsAndDepartments = async () => {
    try {
      setLoadingDoctors(true);
      setLoadingDepartments(true);

      // Fetch both in parallel for better performance
      const [doctorsResponse, departmentsResponse] = await Promise.all([
        doctorAPI.getAll(1, 10), // Limit to 10 doctors for homepage
        departmentAPI.getAll(1, 6), // Limit to 6 departments for homepage
      ]);

      // Process doctors
      if (doctorsResponse.data.success) {
        const doctorsData = doctorsResponse.data.data.data || doctorsResponse.data.data;
        setDoctors(doctorsData);
      }

      // Process departments
      if (departmentsResponse.data.success) {
        const deptData = departmentsResponse.data.data.data || departmentsResponse.data.data;
        setDepartments(deptData.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching doctors and departments:", error);
    } finally {
      setLoadingDoctors(false);
      setLoadingDepartments(false);
    }
  };


  return (
    <div className="index-page">
      <style
        dangerouslySetInnerHTML={{
          __html: `
  /* --- Global Button Theme Overrides --- */
  .btn-submit-custom {
    transition: all 0.2s;
  }
  .btn-submit-custom:hover, .btn-submit-custom:active, .btn-submit-custom:focus {
    background-color: #049EBB!important;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(4, 158, 187, 0.3);
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

  .text-gradient {
    background: linear-gradient(135deg, var(--heading-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`,
        }}
      />
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background">
        <div className="container-fluid p-0">
          <div className="hero-wrapper">
            <div className="hero-image">
              <img
                src="/assets/img/health/showcase-1.webp"
                alt="Advanced Healthcare"
                className="img-fluid"
              />
            </div>

            <div className="hero-content">
              <div className="container">
                <div className="row">
                  <div
                    className="col-lg-7 col-md-10"
                    data-aos="fade-right"
                    data-aos-delay="100"
                  >
                    <div className="content-box">
                      <span
                        className="badge-accent"
                        data-aos="fade-up"
                        data-aos-delay="150"
                      >
                        Leading Healthcare Specialists
                      </span>
                      <h1 data-aos="fade-up" data-aos-delay="200">
                        Advanced Medical Care for Your Family's Health
                      </h1>
                      <p data-aos="fade-up" data-aos-delay="250">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Ut elit tellus, luctus nec ullamcorper mattis, pulvinar
                        dapibus leo.
                      </p>

                      <div
                        className="cta-group"
                        data-aos="fade-up"
                        data-aos-delay="300"
                      >
                        <Link
                          to="/quickappointment"
                          className="btn btn-primary"
                        >
                          Book Appointment
                        </Link>
                        <Link to="/services" className="btn btn-outline">
                          Explore Services
                        </Link>
                      </div>

                      <div
                        className="info-badges"
                        data-aos="fade-up"
                        data-aos-delay="350"
                      >
                        <div className="badge-item">
                          <i className="bi bi-telephone-fill"></i>
                          <div className="badge-content">
                            <span>Emergency Line</span>
                            <strong>+1 (555) 987-6543</strong>
                          </div>
                        </div>
                        <div className="badge-item">
                          <i className="bi bi-clock-fill"></i>
                          <div className="badge-content">
                            <span>Working Hours</span>
                            <strong>Mon-Fri: 8AM-8PM</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="features-wrapper">
                  <div className="row gy-4">
                    <div className="col-lg-4">
                      <div
                        className="feature-item"
                        data-aos="fade-up"
                        data-aos-delay="450"
                      >
                        <div className="feature-icon">
                          <i className="bi bi-heart-pulse-fill"></i>
                        </div>
                        <div className="feature-text">
                          <h3>Cardiology</h3>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div
                        className="feature-item"
                        data-aos="fade-up"
                        data-aos-delay="500"
                      >
                        <div className="feature-icon">
                          <i className="bi bi-lungs-fill"></i>
                        </div>
                        <div className="feature-text">
                          <h3>Pulmonology</h3>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div
                        className="feature-item"
                        data-aos="fade-up"
                        data-aos-delay="550"
                      >
                        <div className="feature-icon">
                          <i className="bi bi-capsule"></i>
                        </div>
                        <div className="feature-text">
                          <h3>Diagnostics</h3>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <FeaturedServicesSection />

      <FindDoctorSection doctors={doctors} loadingDoctors={loadingDoctors} />

      <CallToActionSection />

      <DepartmentSection
        departments={departments}
        loadingDepartments={loadingDepartments}
      />

      <AboutSection />

      <EmergencyInfoSection />

      <HospitalAtHomeSection
        homeCareServices={homeCareServices}
        homeCareSettings={homeCareSettings}
        SectionHeading={SectionHeading}
      />

      <HealthPackageSection healthPackages={healthPackages} />

      <WorkflowSection />

      <TestimonialsSection testimonials={testimonials} loadingTestimonials={loadingTestimonials} />
    </div>
  );
};

export default Home;
