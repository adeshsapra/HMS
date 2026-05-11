import { useEffect, useMemo, useState } from "react";
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

interface HeroDepartmentHighlight {
  title: string;
  description: string;
  icon: string;
}

const heroDepartmentFallback: HeroDepartmentHighlight[] = [
  {
    title: "Cardiology",
    description:
      "Advanced cardiac diagnostics, preventive screenings, and personalized heart-care treatment plans.",
    icon: "bi bi-heart-pulse-fill",
  },
  {
    title: "Pulmonology",
    description:
      "Comprehensive respiratory care for asthma, COPD, sleep disorders, and critical lung conditions.",
    icon: "bi bi-lungs-fill",
  },
  {
    title: "Diagnostics",
    description:
      "Fast, accurate imaging and pathology services to support early detection and confident decisions.",
    icon: "bi bi-clipboard2-pulse-fill",
  },
];

const heroDepartmentIcons = [
  "bi bi-heart-pulse-fill",
  "bi bi-lungs-fill",
  "bi bi-clipboard2-pulse-fill",
];
const HERO_MAIN_TITLE_LINES = [
  "Advanced Medical Care Focused on",
  "Your Family's Well-Being",
];
const HERO_MAIN_TITLE = HERO_MAIN_TITLE_LINES.join("\n");

const toPreviewText = (value: unknown, maxLength = 108) => {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
};


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
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null);
  const [typedHeroTitle, setTypedHeroTitle] = useState("");
  const [heroTypingComplete, setHeroTypingComplete] = useState(false);
  const [typedTitleLineOne = "", typedTitleLineTwo = ""] = useMemo(
    () => typedHeroTitle.split("\n"),
    [typedHeroTitle]
  );
  const isTypingSecondLine = typedHeroTitle.includes("\n");
  const heroDepartmentHighlights = useMemo<HeroDepartmentHighlight[]>(() => {
    if (!departments.length) return heroDepartmentFallback;

    return departments.slice(0, 3).map((department: any, index: number) => {
      const fallback = heroDepartmentFallback[index] || heroDepartmentFallback[0];
      const title =
        department?.name ||
        department?.department_name ||
        fallback.title;

      const descriptionText =
        toPreviewText(
          department?.short_description ||
          department?.description ||
          department?.overview ||
          department?.details
        ) || fallback.description;

      return {
        title,
        description: descriptionText,
        icon: heroDepartmentIcons[index] || fallback.icon,
      };
    });
  }, [departments]);

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

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        if (!cancelled) callback();
      }, delay);
      timers.push(timer);
    };

    const startTypingCycle = () => {
      let charIndex = 0;
      setTypedHeroTitle("");
      setHeroTypingComplete(false);

      const typeNextCharacter = () => {
        charIndex += 1;
        setTypedHeroTitle(HERO_MAIN_TITLE.slice(0, charIndex));

        if (charIndex < HERO_MAIN_TITLE.length) {
          schedule(typeNextCharacter, 34);
          return;
        }

        setHeroTypingComplete(true);
        schedule(() => {
          setHeroTypingComplete(false);
          startTypingCycle();
        }, 3000);
      };

      schedule(typeNextCharacter, 200);
    };

    startTypingCycle();

    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);


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

  /* --- Home Hero Professional Enhancements --- */
  #hero .hero-image::after {
    background: linear-gradient(
      120deg,
      rgba(0, 23, 44, 0.78) 0%,
      rgba(0, 36, 69, 0.66) 48%,
      rgba(0, 54, 97, 0.5) 100%
    );
  }

  #hero .hero-content .content-box h1,
  #hero .hero-content .content-box p,
  #hero .hero-content .content-box .info-badges .badge-content span,
  #hero .hero-content .content-box .info-badges .badge-content strong {
    color: #ffffff;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.3);
  }

  #hero .hero-content .content-box .badge-accent {
    background: rgba(0, 112, 192, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    margin-bottom: 1rem;
  }

  #hero .hero-wrapper {
    min-height: 66vh;
    padding: 105px 0 38px 0;
  }

  #hero .hero-content {
    padding: 2.1rem 0 1.45rem 0;
  }

  #hero .hero-content .content-box {
    padding: 1rem 0;
  }

  #hero .hero-content .content-box h1 {
    font-size: clamp(2.1rem, 3.5vw, 3rem);
    margin-bottom: 1rem;
    line-height: 1.16;
  }

  #hero .hero-content .content-box p {
    margin-bottom: 1.3rem;
    max-width: 620px;
    color: rgba(255, 255, 255, 0.95);
  }

  #hero .hero-content .content-box .cta-group .btn {
    backdrop-filter: blur(3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.14);
  }

  #hero .hero-content .content-box .cta-group {
    margin-bottom: 1.4rem;
  }

  #hero .hero-content .content-box .info-badges {
    gap: 1.6rem;
    margin-bottom: 0;
  }

  #hero .hero-content .content-box .cta-group .btn.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(0, 112, 192, 0.45);
  }

  #hero .hero-content .content-box .cta-group .btn.btn-outline,
  #hero .hero-content .content-box .cta-group .btn.btn-outline:focus {
    color: #ffffff !important;
    border-color: rgba(255, 255, 255, 0.95) !important;
    background: rgba(255, 255, 255, 0.1);
  }

  #hero .hero-content .content-box .cta-group .btn.btn-outline:hover {
    color: #053158 !important;
    background: #ffffff;
    border-color: #ffffff !important;
    transform: translateY(-2px);
  }

  #hero .features-wrapper {
    background: rgba(3, 30, 55, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.13);
    backdrop-filter: blur(7px);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
    margin-top: 8px;
    padding: 1.9rem 1.8rem;
    min-height: 150px;
  }

  #hero .features-wrapper .feature-item {
    min-height: 95px;
  }

  #hero .features-wrapper .feature-item .feature-text h3,
  #hero .features-wrapper .feature-item .feature-text p {
    color: #ffffff;
  }

  #hero .features-wrapper .feature-item .feature-text p {
    opacity: 0.88;
  }

  #hero .features-wrapper .feature-item .feature-icon {
    background-color: rgba(255, 255, 255, 0.1);
  }

  #hero .features-wrapper .feature-item .feature-icon i {
    color: #52c6ff;
  }

  #hero [data-aos="hero-fade-up"] {
    opacity: 0;
    transform: translate3d(0, 22px, 0);
    transition-property: opacity, transform;
    transition-duration: 850ms;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
  }

  #hero [data-aos="hero-fade-up"].aos-animate {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  #hero .hero-title-typed {
    display: block;
    letter-spacing: 0.01em;
    min-height: 2.46em;
  }

  #hero .hero-title-line {
    display: block;
    white-space: nowrap;
  }

  #hero .hero-title-line.line-one,
  #hero .hero-title-line.line-two {
    min-height: 1.14em;
  }

  #hero .hero-title-cursor {
    display: inline-block;
    width: 0.08em;
    height: 0.95em;
    margin-left: 0.12em;
    vertical-align: baseline;
    background: #ffffff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.38);
    animation: heroCursorBlink 0.95s steps(1, end) infinite;
  }

  #hero .hero-title-cursor.typing-complete {
    opacity: 0.72;
  }

  @keyframes heroCursorBlink {
    0%, 46% { opacity: 1; }
    47%, 100% { opacity: 0; }
  }

  #hero [data-aos="hero-float-up"] {
    opacity: 0;
    transform: translate3d(0, 28px, 0) scale(0.98);
    transition-property: opacity, transform;
    transition-duration: 900ms;
    transition-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: opacity, transform;
  }

  #hero [data-aos="hero-float-up"].aos-animate {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }

  @media (prefers-reduced-motion: reduce) {
    #hero [data-aos="hero-fade-up"],
    #hero [data-aos="hero-float-up"] {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }

    #hero .hero-title-cursor {
      animation: none !important;
    }
  }

  @media (max-width: 992px) {
    #hero .hero-title-line {
      white-space: normal;
    }
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
                src="/assets/img/showcase-hero.png"
                alt="Advanced Healthcare"
                className="img-fluid"
              />
            </div>

            <div className="hero-content">
              <div className="container">
                <div className="row">
                  <div
                    className="col-lg-8 col-md-10"
                    data-aos="hero-fade-up"
                    data-aos-delay="100"
                  >
                    <div className="content-box">
                      <span
                        className="badge-accent"
                        data-aos="hero-fade-up"
                        data-aos-delay="130"
                      >
                        Trusted Multi-Specialty Care
                      </span>
                      <h1 data-aos="hero-fade-up" data-aos-delay="180">
                        <span className="hero-title-typed">
                          <span className="hero-title-line line-one">
                            {typedTitleLineOne || "\u00A0"}
                            {!isTypingSecondLine && (
                              <span
                                className={`hero-title-cursor ${heroTypingComplete ? "typing-complete" : ""}`}
                                aria-hidden="true"
                              ></span>
                            )}
                          </span>
                          <span className="hero-title-line line-two">
                            {typedTitleLineTwo || "\u00A0"}
                            {(isTypingSecondLine || heroTypingComplete) && (
                              <span
                                className={`hero-title-cursor ${heroTypingComplete ? "typing-complete" : ""}`}
                                aria-hidden="true"
                              ></span>
                            )}
                          </span>
                        </span>
                      </h1>
                      <p data-aos="hero-fade-up" data-aos-delay="240">
                        Our multidisciplinary specialists combine clinical
                        excellence, modern diagnostics, and compassionate
                        support to deliver safer outcomes and confident care
                        decisions for every stage of life.
                      </p>

                      <div
                        className="cta-group"
                        data-aos="hero-fade-up"
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
                        data-aos="hero-fade-up"
                        data-aos-delay="360"
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
                    {heroDepartmentHighlights.map((item, index) => (
                      <div className="col-lg-4" key={item.title}>
                        <div
                          className="feature-item"
                          data-aos="hero-float-up"
                          data-aos-delay={420 + index * 90}
                        >
                          <div className="feature-icon">
                            <i className={item.icon}></i>
                          </div>
                          <div className="feature-text">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
