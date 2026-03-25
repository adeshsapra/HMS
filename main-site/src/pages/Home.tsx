import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import axios from "axios";
import {
  departmentAPI,
  doctorAPI,
  emergencyAPI,
  homeCareAPI,
  serviceAPI,
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

interface FeaturedService {
  id: number;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

interface EmergencyContact {
  id: number;
  icon: string;
  title: string;
  phone: string;
  meta?: string;
  badge?: string;
  badge_type: "blue" | "green";
  urgent: boolean;
}

interface EmergencyTip {
  id: number;
  tip: string;
}

interface EmergencyInfo {
  is_active?: boolean;
  section_heading: string;
  section_description?: string;
  banner_title: string;
  banner_description?: string;
  banner_button_label: string;
  banner_button_phone: string;
  tips_title: string;
  contacts: EmergencyContact[];
  tips: EmergencyTip[];
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
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>([]);
  const [loadingFeaturedServices, setLoadingFeaturedServices] = useState(true);
  const [featuredServicesError, setFeaturedServicesError] = useState<string | null>(null);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null);

  useEffect(() => {
    (window as any).__homeCriticalReady = false;
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
    fetchEmergencyInfo();
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
    setLoadingDoctors(true);
    setLoadingDepartments(true);
    setLoadingFeaturedServices(true);
    setFeaturedServicesError(null);

    const [doctorsResult, departmentsResult, featuredResult] = await Promise.allSettled([
      doctorAPI.getAll(1, 10),
      departmentAPI.getAll(1, 6),
      serviceAPI.getFeatured(),
    ]);

    if (doctorsResult.status === "fulfilled") {
      const doctorsResponse = doctorsResult.value as any;
      if ((doctorsResponse.data?.success || doctorsResponse.data?.status) && doctorsResponse.data?.data) {
        const doctorsData = doctorsResponse.data.data.data || doctorsResponse.data.data;
        setDoctors(doctorsData);
      } else {
        setDoctors([]);
      }
    } else {
      console.error("Error fetching doctors:", doctorsResult.reason);
      setDoctors([]);
    }

    if (departmentsResult.status === "fulfilled") {
      const departmentsResponse = departmentsResult.value as any;
      if ((departmentsResponse.data?.success || departmentsResponse.data?.status) && departmentsResponse.data?.data) {
        const deptData = departmentsResponse.data.data.data || departmentsResponse.data.data;
        setDepartments(deptData.slice(0, 6));
      } else {
        setDepartments([]);
      }
    } else {
      console.error("Error fetching departments:", departmentsResult.reason);
      setDepartments([]);
    }

    if (featuredResult.status === "fulfilled") {
      const featuredResponse = featuredResult.value as any;
      let featuredData: any[] = [];
      if (featuredResponse.data && featuredResponse.data.data) {
        featuredData = featuredResponse.data.data;
      } else if (featuredResponse.data && Array.isArray(featuredResponse.data)) {
        featuredData = featuredResponse.data;
      }

      const parsedFeatured = featuredData.map((service: any) => ({
        ...service,
        features: (() => {
          if (Array.isArray(service.features)) return service.features;
          if (typeof service.features === "string") {
            try {
              const parsed = JSON.parse(service.features);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        })(),
      }));
      setFeaturedServices(parsedFeatured);
    } else {
      console.error("Error fetching featured services:", featuredResult.reason);
      setFeaturedServices([]);
      setFeaturedServicesError(null);
    }

    setLoadingDoctors(false);
    setLoadingDepartments(false);
    setLoadingFeaturedServices(false);
  };

  const fetchEmergencyInfo = async () => {
    try {
      const response = await emergencyAPI.getInfo();
      if (response.data?.success && response.data?.data) {
        setEmergencyInfo(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching emergency info:", error);
      setEmergencyInfo(null);
    }
  };

  useEffect(() => {
    const isCriticalHomeDataReady = !loadingDoctors && !loadingDepartments && !loadingFeaturedServices;
    if (isCriticalHomeDataReady) {
      (window as any).__homeCriticalReady = true;
      window.dispatchEvent(new Event("home-critical-ready"));
    }
  }, [loadingDoctors, loadingDepartments, loadingFeaturedServices]);


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
    background-color: var(--accent-color) !important;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 112, 192, 0.3);
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
      <FeaturedServicesSection
        servicesData={featuredServices}
        loadingServices={loadingFeaturedServices}
        errorMessage={null}
      />

      <FindDoctorSection doctors={doctors} loadingDoctors={loadingDoctors} />

      <CallToActionSection />

      <DepartmentSection
        departments={departments}
        loadingDepartments={loadingDepartments}
      />

      <AboutSection />

      <EmergencyInfoSection emergencyInfo={emergencyInfo} />

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
