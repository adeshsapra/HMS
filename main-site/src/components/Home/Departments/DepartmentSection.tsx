import React, { useRef, useCallback, useState, useEffect } from "react"; // Added useState, useEffect
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import ContentLoader from "../../ContentLoader";

interface Department {
    id: number;
    name: string;
    description: string;
    image: string | null;
    icon: string | null;
}

interface DepartmentSectionProps {
    departments: Department[];
    loadingDepartments: boolean;
}

const DepartmentSection: React.FC<DepartmentSectionProps> = ({
    departments,
    loadingDepartments
}) => {
    const departmentSectionRef = useRef<HTMLElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null); // Ref for the moving content
    const [scrollRange, setScrollRange] = useState(0); // Store the calculated scroll distance

    const { scrollYProgress } = useScroll({
        target: departmentSectionRef,
        offset: ["start start", "end end"]
    });

    // Calculate the horizontal scroll distance dynamically
    useEffect(() => {
        if (carouselRef.current && departments.length > 0) {
            const calculateWidth = () => {
                const scrollWidth = carouselRef.current?.scrollWidth || 0;
                const viewportWidth = window.innerWidth;
                // We subtract viewportWidth so the scrolling stops exactly when the right edge hits the screen edge
                setScrollRange(scrollWidth - viewportWidth);
            };

            calculateWidth();

            // Recalculate on resize
            window.addEventListener("resize", calculateWidth);
            return () => window.removeEventListener("resize", calculateWidth);
        }
    }, [departments, loadingDepartments]);

    // Transform vertical scroll to horizontal pixel movement
    // Note: If content fits on screen (scrollRange <= 0), it won't move.
    const xTransform = useTransform(
        scrollYProgress,
        [0, 1],
        ["0px", `-${scrollRange > 0 ? scrollRange : 0}px`]
    );

    const getDepartmentImageUrl = useCallback((imageName: string | null) => {
        if (!imageName) return "/assets/img/health/cardiology-3.webp";
        if (imageName.startsWith("http")) return imageName;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";
        return `${baseUrl}/storage/departments/${imageName}`;
    }, []);

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
            :root {
                --card-bg: #ffffff;
                --primary-gradient: linear-gradient(135deg, #0299be 0%, #049ebb 100%);
                --text-dark: #1e293b;
                --text-light: #64748b;
            }

            /* --- Layout Styles --- */
            .featured-departments-scroll-container {
              position: relative;
              height: 300vh; 
              background-color: #f0f4f8;
              background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
              background-size: 40px 40px;
            }

            .sticky-wrapper {
              position: sticky;
              top: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              overflow: hidden;
              z-index: 10;
            }

            .section-header-wrapper {
                position: relative;
                z-index: 20;
                background: rgba(240, 244, 248, 0.8);
                backdrop-filter: blur(5px);
                margin-bottom: 20px; /* Added spacing between header and cards */
            }

            .horizontal-scroll-container {
              width: 100%;
              /* padding: 2rem 0; Removed padding to ensure exact calculations */
              perspective: 1000px;
              overflow: hidden; /* Hide the scrollbar */
            }

            .horizontal-motion-div {
              display: flex;
              gap: 3rem;
              padding: 0 5vw; /* Keep horizontal padding for aesthetics */
              width: max-content;
              will-change: transform;
              align-items: stretch;
            }

            /* --- Card Container --- */
            .horizontal-card-wrapper {
              width: 400px;
              flex-shrink: 0;
              height: 520px; 
            }

            /* --- The Professional Card --- */
            .pro-dept-card {
              background: var(--card-bg);
              border-radius: 24px;
              height: 90%; 
              display: flex;
              flex-direction: column;
              position: relative;
              overflow: visible;
              border: 1px solid rgba(255, 255, 255, 0.6);
              box-shadow: 
                0 10px 15px -3px rgba(0, 0, 0, 0.05),
                0 4px 6px -2px rgba(0, 0, 0, 0.025),
                inset 0 0 0 1px rgba(255,255,255,0.5);
              transition: box-shadow 0.3s ease;
            }

            .pro-dept-card:hover {
                box-shadow: 
                    0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }

            /* Image Area */
            .card-image-wrapper {
                height: 220px; 
                width: 100%;
                border-radius: 24px 24px 0 0;
                overflow: hidden;
                position: relative;
                z-index: 0;
                flex-shrink: 0; 
            }

            .card-image-wrapper img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .card-image-overlay {
                position: absolute;
                inset: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%);
                opacity: 0.6;
                transition: opacity 0.3s ease;
            }

            .card-image-wrapper::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 50%;
                height: 100%;
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
                transform: skewX(-25deg);
                transition: none;
                z-index: 2;
                pointer-events: none;
            }

            .pro-dept-card:hover .card-image-wrapper::before {
                animation: shine 1.2s;
            }

            @keyframes shine {
                100% { left: 150%; }
            }

            /* Floating Icon */
            .floating-icon-box {
                position: absolute;
                top: 190px;
                right: 30px;
                width: 64px;
                height: 64px;
                background: var(--card-bg);
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                z-index: 10;
                padding: 4px;
            }

            .icon-inner {
                width: 100%;
                height: 100%;
                background: var(--primary-gradient);
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
            }

            /* Content Area */
            .card-content {
                padding: 2.5rem 2rem 2rem;
                display: flex;
                flex-direction: column;
                flex-grow: 1; 
                background: var(--card-bg);
                border-radius: 0 0 24px 24px;
                position: relative;
                z-index: 1;
            }

            .card-content h3 {
                font-size: 1.5rem;
                font-weight: 800;
                color: var(--text-dark);
                margin-bottom: 0.75rem;
                letter-spacing: -0.02em;
            }

            .card-content p {
                color: var(--text-light);
                font-size: 0.95rem;
                line-height: 1.7;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                margin-bottom: 0; 
            }

            /* Animated Button */
            .action-row {
                margin-top: auto; 
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-top: 1px solid rgba(0,0,0,0.05);
                padding-top: 1.2rem;
                width: 100%;
            }

            .btn-explore {
                color: var(--dept-secondary);
                font-weight: 700;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                border-radius: 30px;
                background: transparent;
                transition: all 0.3s ease;
            }

            .arrow-circle {
                width: 24px;
                height: 24px;
                background: rgba(2, 153, 190, 0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
                color: var(--dept-primary);
                transition: all 0.3s ease;
            }
            .pro-dept-card:hover .btn-explore {
                color: #0299be;
                border-color: transparent;
                padding-right: 0.5rem;
            }

            /* Mobile Responsiveness */
            @media (max-width: 991px) {
              .featured-departments-scroll-container {
                height: auto !important;
                background-image: none;
              }
              .sticky-wrapper {
                position: relative !important;
                height: auto !important;
                padding: 40px 0;
                display: block;
              }
              .section-header-wrapper {
                  background: transparent;
              }
              .horizontal-motion-div {
                flex-direction: column;
                padding: 0 1rem;
                width: 100%;
                gap: 2.5rem;
                transform: none !important;
              }
              .horizontal-card-wrapper {
                width: 100%;
                height: auto; 
              }
              .pro-dept-card {
                height: auto;
              }
            }
          `,
                }}
            />
            <section
                id="featured-departments"
                className="featured-departments-scroll-container"
                ref={departmentSectionRef}
            >
                <div className="sticky-wrapper">
                    <div className="section-header-wrapper">
                        <div className="container section-title" data-aos="fade-up">
                            <h2>Featured Departments</h2>
                            <p>
                                Explore our specialized medical units equipped with the latest technology and expert medical staff.
                            </p>
                        </div>
                    </div>

                    <div className="horizontal-scroll-container">
                        <motion.div
                            ref={carouselRef} // ATTACH REF HERE
                            style={{ x: xTransform }}
                            className="horizontal-motion-div"
                        >
                            {loadingDepartments ? (
                                <div className="d-flex align-items-center justify-content-center w-100" style={{ minWidth: '100vw' }}>
                                    <ContentLoader message="Mapping Specialized Departments..." height="300px" />
                                </div>
                            ) : departments.length > 0 ? (
                                departments.map((dept, idx) => (
                                    <div key={dept.id || idx} className="horizontal-card-wrapper">
                                        <motion.div
                                            className="pro-dept-card"
                                            whileHover={{ y: -10 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <div className="card-image-wrapper">
                                                <div className="card-image-overlay"></div>
                                                <motion.img
                                                    src={getDepartmentImageUrl(dept.image)}
                                                    alt={`${dept.name}`}
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ duration: 0.5 }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/assets/img/health/cardiology-3.webp';
                                                    }}
                                                />
                                            </div>

                                            <div className="floating-icon-box">
                                                <div className="icon-inner">
                                                    <i className={`fas fa-${dept.icon?.replace('bi-', '') || 'heartbeat'}`}></i>
                                                </div>
                                            </div>

                                            <div className="card-content">
                                                <h3>{dept.name}</h3>
                                                <p>{dept.description}</p>

                                                <div className="action-row">
                                                    <Link to="/department-details" className="btn-explore">
                                                        <span>View Department</span>
                                                        <div className="arrow-circle">
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))
                            ) : (
                                <div className="d-flex align-items-center justify-content-center w-100" style={{ minWidth: '100vw' }}>
                                    <p className="text-muted">No departments available at the moment.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default DepartmentSection;