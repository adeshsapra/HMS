import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "../SectionHeading";
import ContentLoader from "../../ContentLoader";

// --- Advanced Animation Constants ---
const springTransition = { type: "spring", stiffness: 200, damping: 20 };

const cardVariants = {
    initial: { opacity: 0, scale: 0.9, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: springTransition as any },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

const imageBlobVariants = {
    initial: { borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" },
    hover: {
        borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%",
        scale: 1.05,
        rotate: 2
    }
};

interface FindDoctorSectionProps {
    doctors: any[];
    loadingDoctors: boolean;
}

const FindDoctorSection = ({ doctors, loadingDoctors }: FindDoctorSectionProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("");

    const filteredDoctors = useMemo(() => {
        let filtered = doctors;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(doc =>
                `${doc.first_name} ${doc.last_name}`.toLowerCase().includes(query) ||
                doc.specialization?.toLowerCase().includes(query)
            );
        }
        if (selectedSpecialty) {
            filtered = filtered.filter(doc => doc.specialization?.toLowerCase() === selectedSpecialty.toLowerCase());
        }
        return filtered.slice(0, 6);
    }, [searchQuery, selectedSpecialty, doctors]);

    const getFullImageUrl = useCallback((path: string | null) => {
        if (!path) return "/assets/img/person/person-m-12.webp";
        if (path.startsWith("http")) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";
        return `${baseUrl}/storage/${path}`;
    }, []);

    return (
        <section className="kinetic-section py-5">
            <div className="mesh-gradient"></div>

            <div className="container position-relative">
                <SectionHeading desc="Pioneering the future of clinical excellence.">
                    Meet <span className="text-gradient">Our Specialist</span>
                </SectionHeading>

                <div className="search-aero-wrapper mb-5">
                    <div className="search-aero-inner">
                        <div className="search-main">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Who are you looking for?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="search-divider d-none d-md-block"></div>

                        <div className="search-filter d-none d-md-flex">
                            <i className="bi bi-stars"></i>
                            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
                                <option value="">All Expertise</option>
                                <option value="cardiology">Cardiology</option>
                                <option value="neurology">Neurology</option>
                                <option value="pediatrics">Pediatrics</option>
                            </select>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="search-aero-btn"
                        >
                            Explore
                        </motion.button>
                    </div>
                </div>


                {/* --- Bento Grid --- */}
                {loadingDoctors ? (
                    <ContentLoader message="Assembling medical excellence..." height="400px" />
                ) : (
                    <motion.div className="row g-4" initial="initial" animate="animate">
                        <AnimatePresence mode="popLayout">
                            {filteredDoctors.map((doc, idx) => (
                                <motion.div
                                    key={doc.id || idx}
                                    layout
                                    variants={cardVariants}
                                    className="col-lg-4 col-md-6"
                                >
                                    <motion.div className="kinetic-card" whileHover="hover" initial="initial">
                                        <div className="kinetic-top">
                                            <motion.div
                                                className="kinetic-image-wrapper"
                                                variants={imageBlobVariants}
                                                transition={springTransition as any}
                                            >
                                                <img
                                                    src={getFullImageUrl(doc.profile_picture)}
                                                    alt={doc.first_name}
                                                    onError={(e) => (e.currentTarget.src = '/assets/img/health/staff-3.webp')}
                                                />
                                            </motion.div>
                                            <div className="kinetic-badge">
                                                <div className={`dot ${doc.is_available ? 'online' : 'busy'}`}></div>
                                                {doc.is_available ? 'Available' : 'Busy'}
                                            </div>
                                        </div>

                                        <div className="kinetic-body">
                                            <div className="d-flex justify-content-between">
                                                <span className="kinetic-tag">{doc.specialization}</span>
                                                <span className="kinetic-rating"><i className="bi bi-star-fill"></i> 4.9</span>
                                            </div>
                                            <h3 className="kinetic-name">Dr. {doc.first_name} {doc.last_name}</h3>

                                            <motion.div
                                                className="kinetic-hidden-info"
                                                variants={{
                                                    initial: { height: 0, opacity: 0 },
                                                    hover: { height: 'auto', opacity: 1 }
                                                }}
                                            >
                                                <p className="kinetic-bio">Top-tier specialist with {doc.experience_years}+ years of clinical innovation.</p>
                                                <div className="kinetic-mini-stats">
                                                    <span><b>120+</b> Reviews</span>
                                                    <span><b>98%</b> Success</span>
                                                </div>
                                            </motion.div>

                                            <div className="kinetic-footer">
                                                {/* ICON INSTEAD OF VIEW TEXT */}
                                                <Link to={`/doctor-profile/${doc.id}`} className="kinetic-btn-outline" title="View Profile">
                                                    <i className="bi bi-person-lines-fill"></i>
                                                </Link>
                                                <Link to={`/doctors/${doc.id}`} className="kinetic-btn-primary">
                                                    Book Appointment
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            <style>{`
                .kinetic-section {
                    background: var(--background-color);
                    position: relative;
                    overflow: hidden;
                    min-height: 800px;
                }

                .mesh-gradient {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: 
                        radial-gradient(at 0% 0%, var(--accent-color) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, var(--heading-color) 0px, transparent 50%);
                    opacity: 0.05;
                    z-index: 0;
                }

                .kinetic-gradient-text {
                    background: linear-gradient(135deg, var(--heading-color) 0%, var(--accent-color) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 900;
                }

                /* Search Bar with Minor Shadow */
                .search-aero-wrapper {
                    max-width: 900px; margin: 0 auto; padding: 8px;
                    background: rgba(0, 0, 0, 0.03); border-radius: 100px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }
                .search-aero-inner {
                    display: flex; align-items: center; background: var(--surface-color);
                    padding: 8px 12px 8px 25px; border-radius: 100px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                }
                .search-main { display: flex; align-items: center; gap: 12px; flex: 1; }
                .search-main i { color: var(--accent-color); font-size: 1.1rem; }
                .search-main input {
                    border: none; outline: none; width: 100%; font-size: 1rem;
                    background: transparent; color: var(--default-color);
                }
                .search-divider { width: 1px; height: 30px; background: #eee; margin: 0 20px; }
                
                .search-filter { display: flex; align-items: center; gap: 10px; min-width: 180px; position: relative; }
                .search-filter i { color: var(--accent-color); }
                .search-filter select {
                    border: none; outline: none; background: transparent;
                    font-weight: 500; color: var(--heading-color); cursor: pointer;
                    appearance: none; padding-right: 20px; width: 100%;
                }
                /* Custom Dropdown Arrow */
                .search-filter::after {
                    content: "\\F282"; font-family: "bootstrap-icons"; position: absolute;
                    right: 5px; top: 50%; transform: translateY(-50%);
                    pointer-events: none; font-size: 0.8rem; color: #999;
                }

                .search-aero-btn {
                    background: var(--heading-color); color: var(--contrast-color);
                    border: none; padding: 12px 35px; border-radius: 100px;
                    font-weight: 600; transition: 0.3s; margin-left: 15px;
                }
                .search-aero-btn:hover { background: var(--accent-color); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }

                /* Kinetic Bento Card with Minor Shadow */
                .kinetic-card {
                    background: var(--surface-color);
                    border-radius: 40px;
                    padding: 25px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08); /* Initial Minor Black Shadow */
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                    height: 100%;
                }
                .kinetic-card:hover {
                    border-color: var(--accent-color);
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12); /* Pronounced Shadow on hover */
                    transform: translateY(-5px);
                }

                .kinetic-top {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    margin-bottom: 25px;
                }

                .kinetic-image-wrapper {
                    width: 180px;
                    height: 180px;
                    overflow: hidden;
                    background: rgba(0,0,0,0.05);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                .kinetic-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .kinetic-badge {
                    position: absolute;
                    bottom: 0;
                    background: var(--surface-color);
                    padding: 6px 18px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--default-color);
                }
                .dot.online { background: #28a745; }
                .dot.busy { background: #dc3545; }

                .kinetic-name {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin: 10px 0;
                    color: var(--heading-color);
                }

                .kinetic-footer {
                    display: flex;
                    gap: 12px;
                    margin-top: 25px;
                }
                .kinetic-btn-primary {
                    flex: 4;
                    background: var(--heading-color);
                    color: var(--contrast-color);
                    text-decoration: none;
                    text-align: center;
                    padding: 12px 8px;
                    border-radius: 20px;
                    font-weight: 700;
                    transition: 0.3s;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .kinetic-btn-outline {
                    flex: 1;
                    background: rgba(0, 0, 0, 0.04);
                    color: var(--heading-color);
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.3rem; 
                    padding: 10px 12px;
                    border-radius: 20px;
                    transition: 0.3s;
                }
                .kinetic-btn-primary:hover { 
                    background: var(--accent-color); 
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                    color: var(--contrast-color);
                }
                .kinetic-btn-outline:hover { 
                    background: var(--heading-color);
                    color: var(--contrast-color);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </section>
    );
};

export default FindDoctorSection;